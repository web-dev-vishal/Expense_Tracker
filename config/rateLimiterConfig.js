module.exports = {
    // Authentication endpoints
    auth: {
        login: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            maxRequests: 5,
            message: 'Too many login attempts. Please try again after 15 minutes.'
        },
        register: {
            windowMs: 60 * 60 * 1000,  // 1 hour
            maxRequests: 3,
            message: 'Too many registration attempts. Please try again later.'
        }
    },

    // OTP endpoints
    otp: {
        send: {
            windowMs: 5 * 60 * 1000,   // 5 minutes
            maxRequests: 3,
            message: 'Too many OTP requests. Please try again after 5 minutes.'
        },
        verify: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            maxRequests: 5,
            message: 'Too many OTP verification attempts.'
        }
    },

    // Password reset
    passwordReset: {
        windowMs: 60 * 60 * 1000,      // 1 hour
        maxRequests: 3,
        message: 'Too many password reset attempts. Please try again after 1 hour.'
    },

    // General API
    api: {
        general: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            maxRequests: 100,
            message: 'Too many requests. Please try again later.'
        },
        strict: {
            windowMs: 60 * 1000,       // 1 minute
            maxRequests: 10,
            message: 'Rate limit exceeded. Please slow down.'
        }
    },

    // Expense/Income operations
    transactions: {
        create: {
            windowMs: 60 * 1000,       // 1 minute
            maxRequests: 20,
            message: 'Too many transactions. Please slow down.'
        },
        delete: {
            windowMs: 60 * 1000,       // 1 minute
            maxRequests: 10,
            message: 'Too many delete operations.'
        }
    },

    // Dashboard
    dashboard: {
        windowMs: 60 * 1000,           // 1 minute
        maxRequests: 30,
        message: 'Too many dashboard requests. Please wait a moment.'
    },

    // File uploads
    upload: {
        windowMs: 60 * 60 * 1000,      // 1 hour
        maxRequests: 20,
        message: 'Too many file uploads. Please try again later.'
    }
};