const { getRedisClient } = require('../config/redis');

/**
 * Rate Limiter Middleware using Redis
 * Implements sliding window algorithm for accurate rate limiting
 */

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.message - Custom error message
 * @param {Function} options.keyGenerator - Function to generate unique key per user/IP
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {boolean} options.skipFailedRequests - Skip counting failed requests
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // Default: 15 minutes
        maxRequests = 100,           // Default: 100 requests
        message = 'Too many requests, please try again later.',
        keyGenerator = (req) => {
            // Use user ID if authenticated, otherwise use IP
            return req.user?.id || req.ip || req.connection?.remoteAddress || 'unknown';
        },
        skipSuccessfulRequests = false,
        skipFailedRequests = false
    } = options;

    return async (req, res, next) => {
        try {
            const redisClient = getRedisClient();

            // If Redis is not available, skip rate limiting (fail open)
            if (!redisClient) {
                console.warn('⚠️ Redis not available, skipping rate limit check');
                return next();
            }

            // Generate unique key for this client
            const identifier = keyGenerator(req);
            const key = `rate_limit:${identifier}`;

            // Current timestamp
            const now = Date.now();
            const windowStart = now - windowMs;

            // Use Redis pipeline for atomic operations
            const multi = redisClient.multi();

            // Remove old entries outside the time window
            multi.zRemRangeByScore(key, 0, windowStart);

            // Count requests in current window
            multi.zCard(key);

            // Add current request to sorted set
            multi.zAdd(key, {
                score: now,
                value: `${now}-${Math.random()}`
            });

            // Set expiry on the key
            multi.expire(key, Math.ceil(windowMs / 1000));

            // Execute pipeline
            const results = await multi.exec();

            // Get request count (result of zCard command)
            const requestCount = results[1];

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));
            res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

            // Check if limit exceeded
            if (requestCount > maxRequests) {
                const retryAfter = Math.ceil(windowMs / 1000);
                res.setHeader('Retry-After', retryAfter);

                return res.status(429).json({
                    success: false,
                    message: message,
                    retryAfter: `${retryAfter} seconds`,
                    limit: maxRequests,
                    windowMs: windowMs
                });
            }

            // Store original end function
            const originalEnd = res.end;

            // Override res.end to handle skipSuccessfulRequests and skipFailedRequests
            res.end = function (...args) {
                const statusCode = res.statusCode;
                const shouldSkip = 
                    (skipSuccessfulRequests && statusCode < 400) ||
                    (skipFailedRequests && statusCode >= 400);

                if (shouldSkip) {
                    // Remove the request we just added
                    redisClient.zRem(key, `${now}-${Math.random()}`).catch(err => {
                        console.error('❌ Error removing rate limit entry:', err);
                    });
                }

                // Call original end function
                return originalEnd.apply(this, args);
            };

            next();

        } catch (error) {
            console.error('❌ Rate Limiter Error:', error.message);
            // On error, allow request to proceed (fail open)
            next();
        }
    };
};

/**
 * Predefined Rate Limiters
 */

// Strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,              // 5 requests per 15 minutes
    message: 'Too many login attempts. Please try again after 15 minutes.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

// Rate limiter for OTP requests
const otpLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,   // 5 minutes
    maxRequests: 3,              // 3 OTP requests per 5 minutes
    message: 'Too many OTP requests. Please try again after 5 minutes.',
    keyGenerator: (req) => {
        // Use email for OTP limiting
        return req.body.email || req.ip || 'unknown';
    }
});

// Rate limiter for password reset
const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3,              // 3 attempts per hour
    message: 'Too many password reset attempts. Please try again after 1 hour.',
    keyGenerator: (req) => {
        return req.body.email || req.ip || 'unknown';
    }
});

// General API rate limiter
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,            // 100 requests per 15 minutes
    message: 'Too many requests. Please try again later.',
    skipSuccessfulRequests: false
});

// Strict rate limiter for expensive operations
const strictLimiter = createRateLimiter({
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 10,             // 10 requests per minute
    message: 'Rate limit exceeded. Please slow down.',
    skipSuccessfulRequests: false
});

// Rate limiter for file uploads
const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 20,             // 20 uploads per hour
    message: 'Too many file uploads. Please try again later.'
});

// Rate limiter for dashboard/reports (expensive queries)
const dashboardLimiter = createRateLimiter({
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 30,             // 30 requests per minute
    message: 'Too many dashboard requests. Please wait a moment.'
});

module.exports = {
    createRateLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    apiLimiter,
    strictLimiter,
    uploadLimiter,
    dashboardLimiter
};