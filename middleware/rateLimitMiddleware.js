/*
 * ========================================
 * RATE LIMITING MIDDLEWARE
 * ========================================
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

/**
 * Rate Limiting Middleware Configuration
 * Uses Redis for distributed rate limiting across multiple server instances
 * All limits are per IP address
 */

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Standardized rate limit error handler
 * Returns 429 status with detailed error information
 */
const rateLimitHandler = (req, res) => {
    const retryAfter = req.rateLimit.resetTime 
        ? Math.ceil(req.rateLimit.resetTime / 1000) 
        : 900; // Default 15 minutes
    
    res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: retryAfter,
        limit: req.rateLimit.limit,
        current: req.rateLimit.current
    });
};

// ==========================================
// REDIS STORE CONFIGURATION - LAZY LOADING
// ==========================================

/**
 * Get Redis store for rate limiting
 * LAZY INITIALIZATION: Creates store only when needed
 * Falls back to memory store if Redis is unavailable
 */
const getRedisStore = () => {
    const redisClient = getRedisClient();
    
    // Redis not connected - use memory store
    if (!redisClient) {
        return undefined; // express-rate-limit will use MemoryStore
    }

    // Redis connected - use Redis store
    try {
        return new RedisStore({
            client: redisClient,
            prefix: 'ratelimit:',
            sendCommand: (...args) => redisClient.sendCommand(args),
        });
    } catch (error) {
        console.error('⚠️ Failed to create Redis store:', error.message);
        return undefined; // Fallback to memory store
    }
};

// ==========================================
// RATE LIMIT CONFIGURATIONS
// ==========================================

/**
 * 1. GENERAL API RATE LIMITER
 * Applies to all API routes
 * Prevents abuse of any endpoint
 * 
 * Limit: 100 requests per 15 minutes
 * Use: Apply to /api/* routes
 */
const generalLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    // Removed custom keyGenerator - uses default which handles IPv6
});

/**
 * 2. AUTHENTICATION RATE LIMITER
 * For login and register endpoints
 * Strict limits to prevent brute force attacks
 * 
 * Limit: 5 attempts per 15 minutes
 * Use: Login, Register endpoints
 */
const authLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skipSuccessfulRequests: false, // Count all attempts
});

/**
 * 3. OTP RATE LIMITER
 * For OTP generation and sending
 * Prevents OTP spam
 * 
 * Limit: 3 requests per 10 minutes
 * Use: Send OTP endpoint
 */
const otpLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 OTP requests per 10 minutes
    message: 'Too many OTP requests. Please try again after 10 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

/**
 * 4. OTP VERIFICATION LIMITER
 * Separate limiter for OTP verification attempts
 * Prevents brute force of OTP codes
 * 
 * Limit: 10 verification attempts per 15 minutes
 * Use: Verify OTP endpoint
 */
const otpVerifyLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 verification attempts per 15 minutes
    message: 'Too many OTP verification attempts. Please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

/**
 * 5. PASSWORD RESET LIMITER
 * For password reset requests
 * Prevents abuse of password reset functionality
 * 
 * Limit: 3 attempts per hour
 * Use: Reset Password endpoint
 */
const passwordResetLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts. Please try again after 1 hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

/**
 * 6. API WRITE OPERATIONS LIMITER
 * For create/update/delete operations on income/expense
 * Prevents spam creation of records
 * 
 * Limit: 20 write operations per minute
 * Use: POST, PUT, DELETE endpoints
 */
const apiWriteLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 60 * 1000, // 1 minute
    max: 8, // 20 write operations per minute
    message: 'Too many create/update requests. Please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skipSuccessfulRequests: true, // Only count failed requests
});

/**
 * 7. API READ OPERATIONS LIMITER
 * For read operations (GET requests)
 * More lenient than write operations
 * 
 * Limit: 60 read operations per minute
 * Use: GET endpoints
 */
const apiReadLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 60 read operations per minute
    message: 'Too many requests. Please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

/**
 * 8. STRICT LIMITER
 * For highly sensitive operations
 * Very strict limits
 * 
 * Limit: 5 requests per hour
 * Use: Sensitive operations (account deletion, etc.)
 */
const strictLimiter = rateLimit({
    store: getRedisStore(),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: 'Too many requests for this sensitive operation. Please try again after 1 hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    generalLimiter,
    authLimiter,
    otpLimiter,
    otpVerifyLimiter,
    passwordResetLimiter,
    apiWriteLimiter,
    apiReadLimiter,
    strictLimiter,
};