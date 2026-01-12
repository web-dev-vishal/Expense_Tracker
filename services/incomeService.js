const Income = require('../models/Income');
const { getRedisClient } = require('../config/redis');

// Cache expiration time (5 minutes = 300 seconds)
const CACHE_EXPIRATION = 300;

/**
 * Generate Redis cache key for user's income
 */
const getCacheKey = (userId) => `income:user:${userId}`;

/**
 * Add new income and invalidate cache
 */
exports.addIncome = async (userId, incomeData) => {
    try {
        const { icon, source, amount, date } = incomeData;

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            throw new Error("Amount must be a positive number");
        }

        // Validate date
        const incomeDate = new Date(date);
        if (isNaN(incomeDate.getTime())) {
            throw new Error("Invalid date format");
        }

        // Create new income
        const newIncome = new Income({
            userId,
            icon,
            source,
            amount: parseFloat(amount),
            date: incomeDate
        });

        await newIncome.save();

        // Invalidate cache after adding new income
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);
        await redisClient.del(cacheKey);

        console.log(`✅ Cache invalidated for user ${userId} after adding income`);

        return newIncome;

    } catch (error) {
        throw new Error(`Add Income Error: ${error.message}`);
    }
};

/**
 * Get all income with Redis caching
 */
exports.getAllIncome = async (userId) => {
    try {
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);

        // Try to get from cache first
        const cachedIncome = await redisClient.get(cacheKey);

        if (cachedIncome) {
            console.log(`🚀 Cache HIT: Retrieved income for user ${userId} from Redis`);
            return JSON.parse(cachedIncome);
        }

        // Cache MISS - Fetch from database
        console.log(`📂 Cache MISS: Fetching income for user ${userId} from MongoDB`);
        const income = await Income.find({ userId }).sort({ date: -1 });

        // Store in cache for future requests
        await redisClient.setEx(
            cacheKey,
            CACHE_EXPIRATION,
            JSON.stringify(income)
        );

        console.log(`💾 Cached income for user ${userId} (expires in ${CACHE_EXPIRATION}s)`);

        return income;

    } catch (error) {
        // If Redis fails, fallback to database
        console.error('⚠️ Redis Error, using database fallback:', error.message);
        const income = await Income.find({ userId }).sort({ date: -1 });
        return income;
    }
};

/**
 * Delete income and invalidate cache
 */
exports.deleteIncome = async (incomeId, userId) => {
    try {
        const deletedIncome = await Income.findByIdAndDelete(incomeId);

        if (!deletedIncome) {
            throw new Error('Income not found');
        }

        // Invalidate cache after deletion
        const redisClient = getRedisClient();
        const cacheKey = getCacheKey(userId);
        await redisClient.del(cacheKey);

        console.log(`✅ Cache invalidated for user ${userId} after deleting income`);

        return { message: "Income deleted successfully" };

    } catch (error) {
        throw new Error(`Delete Income Error: ${error.message}`);
    }
};

/**
 * Get income for Excel download (bypass cache for real-time data)
 */
exports.getIncomeForExcel = async (userId) => {
    try {
        // Always fetch fresh data for downloads
        const income = await Income.find({ userId }).sort({ date: -1 });
        return income;

    } catch (error) {
        throw new Error(`Get Income For Excel Error: ${error.message}`);
    }
};