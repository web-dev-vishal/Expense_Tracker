const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { getRedisClient } = require('../config/redis');
const { Types } = require('mongoose');

// Constants for time periods
const TIME_PERIODS = {
    LAST_7_DAYS: 7 * 24 * 60 * 60 * 1000,
    LAST_30_DAYS: 30 * 24 * 60 * 60 * 1000,
    LAST_60_DAYS: 60 * 24 * 60 * 60 * 1000,
    LAST_6_MONTHS: 6 * 30 * 24 * 60 * 60 * 1000
};

// Cache configuration
const CACHE_EXPIRATION = 300; // 5 minutes

/**
 * Generate Redis cache key for user's dashboard
 */
const getCacheKey = (userId) => `dashboard:user:${userId}`;

/**
 * Calculate savings rate percentage
 */
const calculateSavingsRate = (totalIncome, totalExpense) => {
    if (totalIncome === 0) return 0;
    const savings = totalIncome - totalExpense;
    return Math.round((savings / totalIncome) * 100);
};

/**
 * Calculate daily average for a time period
 */
const calculateDailyAverage = (total, days) => {
    return Math.round(total / days);
};

/**
 * Get date range for aggregation queries
 */
const getDateRange = (days) => {
    return new Date(Date.now() - days);
};

/**
 * Get expense breakdown by category
 */
const getExpensesByCategory = async (userId) => {
    const userObjectId = new Types.ObjectId(userId);
    
    const expensesByCategory = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);

    // Calculate total for percentages
    const totalExpense = expensesByCategory.reduce((sum, cat) => sum + cat.total, 0);

    // Format with percentages
    return expensesByCategory.map(cat => ({
        category: cat._id,
        amount: cat.total,
        count: cat.count,
        percentage: totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0
    }));
};

/**
 * Get income breakdown by source
 */
const getIncomeBySource = async (userId) => {
    const userObjectId = new Types.ObjectId(userId);
    
    const incomeBySource = await Income.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: '$source',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);

    // Calculate total for percentages
    const totalIncome = incomeBySource.reduce((sum, src) => sum + src.total, 0);

    // Format with percentages
    return incomeBySource.map(src => ({
        source: src._id,
        amount: src.total,
        count: src.count,
        percentage: totalIncome > 0 ? Math.round((src.total / totalIncome) * 100) : 0
    }));
};

/**
 * Get top N expense categories
 */
const getTopExpenseCategories = async (userId, limit = 5) => {
    const userObjectId = new Types.ObjectId(userId);
    
    const topCategories = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } },
        { $limit: limit }
    ]);

    return topCategories.map(cat => ({
        category: cat._id,
        amount: cat.total,
        transactionCount: cat.count
    }));
};

/**
 * Get monthly trend for last N months
 */
const getMonthlyTrend = async (userId, months = 6) => {
    const userObjectId = new Types.ObjectId(userId);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly income
    const incomeByMonth = await Income.aggregate([
        {
            $match: {
                userId: userObjectId,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                total: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get monthly expenses
    const expenseByMonth = await Expense.aggregate([
        {
            $match: {
                userId: userObjectId,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                total: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Merge income and expense data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map();

    incomeByMonth.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        trendMap.set(key, {
            year: item._id.year,
            month: monthNames[item._id.month - 1],
            income: item.total,
            expense: 0,
            balance: item.total
        });
    });

    expenseByMonth.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        if (trendMap.has(key)) {
            const trend = trendMap.get(key);
            trend.expense = item.total;
            trend.balance = trend.income - item.total;
        } else {
            trendMap.set(key, {
                year: item._id.year,
                month: monthNames[item._id.month - 1],
                income: 0,
                expense: item.total,
                balance: -item.total
            });
        }
    });

    return Array.from(trendMap.values());
};

/**
 * Get recent combined transactions (income + expense)
 */
const getRecentTransactions = async (userId, limit = 5) => {
    const userObjectId = new Types.ObjectId(userId);

    // Use aggregation to combine and sort efficiently
    const recentIncome = await Income.aggregate([
        { $match: { userId: userObjectId } },
        { $sort: { date: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                userId: 1,
                icon: 1,
                source: 1,
                amount: 1,
                date: 1,
                createdAt: 1,
                type: { $literal: 'income' }
            }
        }
    ]);

    const recentExpenses = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        { $sort: { date: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                userId: 1,
                icon: 1,
                category: 1,
                amount: 1,
                date: 1,
                createdAt: 1,
                type: { $literal: 'expense' }
            }
        }
    ]);

    // Combine and sort by date
    const combined = [...recentIncome, ...recentExpenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

    return combined;
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (userId) => {
    const userObjectId = new Types.ObjectId(userId);

    const incomeStats = await Income.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: '$amount' },
                average: { $avg: '$amount' }
            }
        }
    ]);

    const expenseStats = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: '$amount' },
                average: { $avg: '$amount' }
            }
        }
    ]);

    return {
        totalIncomeTransactions: incomeStats[0]?.count || 0,
        totalExpenseTransactions: expenseStats[0]?.count || 0,
        averageIncomeAmount: Math.round(incomeStats[0]?.average || 0),
        averageExpenseAmount: Math.round(expenseStats[0]?.average || 0),
        totalTransactions: (incomeStats[0]?.count || 0) + (expenseStats[0]?.count || 0)
    };
};

/**
 * Get complete dashboard data with caching
 */
exports.getDashboardData = async (userId) => {
    try {
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);

        // Try to get from cache first
        if (redisClient) {
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`🚀 Cache HIT: Retrieved dashboard for user ${userId} from Redis`);
                return JSON.parse(cachedData);
            }
        }

        // Cache MISS - Calculate dashboard data
        console.log(`📂 Cache MISS: Calculating dashboard for user ${userId} from MongoDB`);

        const userObjectId = new Types.ObjectId(userId);

        // Fetch all data in parallel for better performance
        const [
            totalIncomeResult,
            totalExpenseResult,
            last60DaysIncomeTransactions,
            last30DaysExpenseTransactions,
            expensesByCategory,
            incomeBySource,
            topExpenseCategories,
            monthlyTrend,
            recentTransactions,
            transactionStats
        ] = await Promise.all([
            // Total Income
            Income.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Total Expense
            Expense.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last 60 days income
            Income.find({
                userId: userObjectId,
                date: { $gte: getDateRange(TIME_PERIODS.LAST_60_DAYS) }
            }).sort({ date: -1 }),
            // Last 30 days expenses
            Expense.find({
                userId: userObjectId,
                date: { $gte: getDateRange(TIME_PERIODS.LAST_30_DAYS) }
            }).sort({ date: -1 }),
            // Category-wise expenses
            getExpensesByCategory(userId),
            // Source-wise income
            getIncomeBySource(userId),
            // Top expense categories
            getTopExpenseCategories(userId, 5),
            // Monthly trend
            getMonthlyTrend(userId, 6),
            // Recent transactions
            getRecentTransactions(userId, 5),
            // Transaction statistics
            getTransactionStats(userId)
        ]);

        // Calculate totals
        const totalIncome = totalIncomeResult[0]?.total || 0;
        const totalExpense = totalExpenseResult[0]?.total || 0;
        const totalBalance = totalIncome - totalExpense;

        // Calculate time-based totals
        const incomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, txn) => sum + txn.amount,
            0
        );
        const expensesLast30Days = last30DaysExpenseTransactions.reduce(
            (sum, txn) => sum + txn.amount,
            0
        );

        // Calculate savings rate
        const savingsRate = calculateSavingsRate(totalIncome, totalExpense);
        const monthlySavings = incomeLast60Days / 2 - expensesLast30Days;

        // Build dashboard response
        const dashboardData = {
            // Financial Overview
            totalBalance,
            totalIncome,
            totalExpenses: totalExpense,
            savingsRate,
            monthlySavings: Math.round(monthlySavings),

            // Time-based Data
            last30DaysExpenses: {
                total: expensesLast30Days,
                dailyAverage: calculateDailyAverage(expensesLast30Days, 30),
                transactions: last30DaysExpenseTransactions
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                dailyAverage: calculateDailyAverage(incomeLast60Days, 60),
                transactions: last60DaysIncomeTransactions
            },

            // Category Analysis
            expensesByCategory,
            incomeBySource,
            topExpenseCategories,

            // Trends
            monthlyTrend,

            // Recent Activity
            recentTransactions,

            // Statistics
            transactionStats
        };

        // Cache the dashboard data
        if (redisClient) {
            await redisClient.setEx(
                cacheKey,
                CACHE_EXPIRATION,
                JSON.stringify(dashboardData)
            );
            console.log(`💾 Cached dashboard for user ${userId} (expires in ${CACHE_EXPIRATION}s)`);
        }

        return dashboardData;

    } catch (error) {
        console.error('⚠️ Dashboard Service Error:', error.message);
        throw error;
    }
};

/**
 * Invalidate dashboard cache for a user
 */
exports.invalidateDashboardCache = async (userId) => {
    try {
        const redisClient = getRedisClient();
        if (!redisClient) return;

        const cacheKey = getCacheKey(userId);
        await redisClient.del(cacheKey);
        console.log(`✅ Dashboard cache invalidated for user ${userId}`);
        
    } catch (error) {
        console.error('⚠️ Failed to invalidate dashboard cache:', error.message);
    }
};