// const Expense = require('../models/Expense');
// const { getRedisClient } = require('../config/redis');
// const dashboardService = require('./dashboardService');

// // Cache expiration time (5 minutes = 300 seconds)
// const CACHE_EXPIRATION = 300;

// /**
//  * Generate Redis cache key for user's expenses
//  */
// const getCacheKey = (userId) => `expenses:user:${userId}`;

// /**
//  * Add new expense and invalidate cache
//  */
// exports.addExpense = async (userId, expenseData) => {
//     try {
//         const { icon, category, amount, date } = expenseData;

//         // Create new expense
//         const newExpense = new Expense({
//             userId,
//             icon,
//             category,
//             amount,
//             date: new Date(date),
//         });

//         await newExpense.save();

//         // Invalidate cache after adding new expense
//         const redisClient = getRedisClient();
//         const cacheKey = getCacheKey(userId);
//         await redisClient.del(cacheKey);
        
//         console.log(`✅ Expense cache invalidated for user ${userId} after adding expense`);

//         // Invalidate dashboard cache
//         await dashboardService.invalidateDashboardCache(userId);

//         return newExpense;

//     } catch (error) {
//         throw new Error(`Add Expense Error: ${error.message}`);
//     }
// };

// /**
//  * Get all expenses with Redis caching
//  */
// exports.getAllExpenses = async (userId) => {
//     try {
//         const redisClient = getRedisClient();
//         const cacheKey = getCacheKey(userId);

//         // Try to get from cache first
//         const cachedExpenses = await redisClient.get(cacheKey);

//         if (cachedExpenses) {
//             console.log(`🚀 Cache HIT: Retrieved expenses for user ${userId} from Redis`);
//             return JSON.parse(cachedExpenses);
//         }

//         // Cache MISS - Fetch from database
//         console.log(`📂 Cache MISS: Fetching expenses for user ${userId} from MongoDB`);
//         const expenses = await Expense.find({ userId }).sort({ date: -1 });

//         // Store in cache for future requests
//         await redisClient.setEx(
//             cacheKey,
//             CACHE_EXPIRATION,
//             JSON.stringify(expenses)
//         );

//         console.log(`💾 Cached expenses for user ${userId} (expires in ${CACHE_EXPIRATION}s)`);

//         return expenses;

//     } catch (error) {
//         // If Redis fails, fallback to database
//         console.error('⚠️ Redis Error, using database fallback:', error.message);
//         const expenses = await Expense.find({ userId }).sort({ date: -1 });
//         return expenses;
//     }
// };

// /**
//  * Delete expense and invalidate cache
//  */
// exports.deleteExpense = async (expenseId, userId) => {
//     try {
//         const deletedExpense = await Expense.findByIdAndDelete(expenseId);

//         if (!deletedExpense) {
//             throw new Error('Expense not found');
//         }

//         // Invalidate cache after deletion
//         const redisClient = getRedisClient();
//         const cacheKey = getCacheKey(userId);
//         await redisClient.del(cacheKey);

//         console.log(`✅ Expense cache invalidated for user ${userId} after deleting expense`);

//         // Invalidate dashboard cache
//         await dashboardService.invalidateDashboardCache(userId);

//         return { message: "Expense deleted successfully" };

//     } catch (error) {
//         throw new Error(`Delete Expense Error: ${error.message}`);
//     }
// };

// /**
//  * Get expenses for Excel download (bypass cache for real-time data)
//  */
// exports.getExpensesForExcel = async (userId) => {
//     try {
//         // Always fetch fresh data for downloads
//         const expenses = await Expense.find({ userId }).sort({ date: -1 });
//         return expenses;

//     } catch (error) {
//         throw new Error(`Get Expenses For Excel Error: ${error.message}`);
//     }
// };

const Expense = require('../models/Expense');
const { getRedisClient } = require('../config/redis');
const dashboardService = require('./dashboardService');
const messagePublisher = require('./messagePublisher');

// Cache expiration time (5 minutes = 300 seconds)
const CACHE_EXPIRATION = 300;

/**
 * Generate Redis cache key for user's expenses
 */
const getCacheKey = (userId) => `expenses:user:${userId}`;

/**
 * Add new expense and invalidate cache
 * NOW WITH RABBITMQ INTEGRATION
 */
exports.addExpense = async (userId, expenseData) => {
    try {
        const { icon, category, amount, date } = expenseData;

        // Create new expense
        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
        });

        await newExpense.save();

        // Invalidate cache after adding new expense
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);
        await redisClient.del(cacheKey);
        
        console.log(`✅ Expense cache invalidated for user ${userId} after adding expense`);

        // Invalidate dashboard cache
        await dashboardService.invalidateDashboardCache(userId);

        // 🐰 PUBLISH MESSAGE TO RABBITMQ
        await messagePublisher.publishExpenseCreated({
            _id: newExpense._id.toString(),
            userId: newExpense.userId,
            icon: newExpense.icon,
            category: newExpense.category,
            amount: newExpense.amount,
            date: newExpense.date
        });

        return newExpense;

    } catch (error) {
        throw new Error(`Add Expense Error: ${error.message}`);
    }
};

/**
 * Get all expenses with Redis caching
 */
exports.getAllExpenses = async (userId) => {
    try {
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);

        // Try to get from cache first
        const cachedExpenses = await redisClient.get(cacheKey);

        if (cachedExpenses) {
            console.log(`🚀 Cache HIT: Retrieved expenses for user ${userId} from Redis`);
            return JSON.parse(cachedExpenses);
        }

        // Cache MISS - Fetch from database
        console.log(`📂 Cache MISS: Fetching expenses for user ${userId} from MongoDB`);
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        // Store in cache for future requests
        await redisClient.setEx(
            cacheKey,
            CACHE_EXPIRATION,
            JSON.stringify(expenses)
        );

        console.log(`💾 Cached expenses for user ${userId} (expires in ${CACHE_EXPIRATION}s)`);

        return expenses;

    } catch (error) {
        // If Redis fails, fallback to database
        console.error('⚠️ Redis Error, using database fallback:', error.message);
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        return expenses;
    }
};

/**
 * Delete expense and invalidate cache
 * NOW WITH RABBITMQ INTEGRATION
 */
exports.deleteExpense = async (expenseId, userId) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);

        if (!deletedExpense) {
            throw new Error('Expense not found');
        }

        // Invalidate cache after deletion
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);
        await redisClient.del(cacheKey);

        console.log(`✅ Expense cache invalidated for user ${userId} after deleting expense`);

        // Invalidate dashboard cache
        await dashboardService.invalidateDashboardCache(userId);

        // 🐰 PUBLISH MESSAGE TO RABBITMQ
        await messagePublisher.publishExpenseDeleted({
            _id: deletedExpense._id.toString(),
            userId: deletedExpense.userId,
            icon: deletedExpense.icon,
            category: deletedExpense.category,
            amount: deletedExpense.amount,
            date: deletedExpense.date
        });

        return { message: "Expense deleted successfully" };

    } catch (error) {
        throw new Error(`Delete Expense Error: ${error.message}`);
    }
};

/**
 * Get expenses for Excel download (bypass cache for real-time data)
 */
exports.getExpensesForExcel = async (userId) => {
    try {
        // Always fetch fresh data for downloads
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        return expenses;

    } catch (error) {
        throw new Error(`Get Expenses For Excel Error: ${error.message}`);
    }
};