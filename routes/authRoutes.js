const express = require("express");
const { 
    registerUser, 
    loginUser, 
    getUserInfo,
    sendOTP,
    verifyOTPController,
    resetPassword,
    logout,
    logoutAllDevices,
    getActiveSessions
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Import rate limiters
const { 
    authLimiter, 
    otpLimiter, 
    passwordResetLimiter 
} = require("../middleware/rateLimiter");

const router = express.Router();

// Authentication routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/user', protect, getUserInfo);

// OTP routes with rate limiting
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOTPController);

// Password reset with rate limiting
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Session management routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/sessions', protect, getActiveSessions);

module.exports = router;