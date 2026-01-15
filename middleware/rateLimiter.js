const { getRedisClient } = require('../config/redis');

/**
 * Create rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        maxRequests = 100,
        message = 'Too many requests, please try again later.',
        keyGenerator = (req) => req.user?.id || req.ip || 'unknown'
    } = options;

    return async (req, res, next) => {
        try {
            const redisClient = getRedisClient();

            if (!redisClient) {
                console.warn('⚠️ Redis not available, skipping rate limit');
                return next();
            }

            const identifier = keyGenerator(req);
            const key = `rate_limit:${identifier}`;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Remove old entries
            await redisClient.zRemRangeByScore(key, 0, windowStart);

            // Count current requests
            const requestCount = await redisClient.zCard(key);

            // Add current request
            await redisClient.zAdd(key, {
                score: now,
                value: `${now}-${Math.random()}`
            });

            // Set expiry
            await redisClient.expire(key, Math.ceil(windowMs / 1000));

            // Set headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));

            // Check limit
            if (requestCount >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: message,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            next();

        } catch (error) {
            console.error('❌ Rate Limiter Error:', error.message);
            next();
        }
    };
};

// Predefined limiters
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Try again after 15 minutes.'
});

const otpLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    maxRequests: 3,
    message: 'Too many OTP requests. Try again after 5 minutes.',
    keyGenerator: (req) => req.body.email || req.ip || 'unknown'
});

const strictLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many requests. Please slow down.'
});

const dashboardLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Too many dashboard requests.'
});

module.exports = {
    createRateLimiter,
    authLimiter,
    otpLimiter,
    strictLimiter,
    dashboardLimiter
};