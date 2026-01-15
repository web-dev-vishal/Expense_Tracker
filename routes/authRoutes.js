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
const { authLimiter, otpLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Auth routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/user', protect, getUserInfo);

// OTP routes with rate limiting
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOTPController);
router.post('/reset-password', otpLimiter, resetPassword);

// Session management
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/sessions', protect, getActiveSessions);

module.exports = router;