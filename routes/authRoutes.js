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

const router = express.Router();

// Auth routes with rate limiting
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', protect, getUserInfo);

// OTP routes with rate limiting
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPController);
router.post('/reset-password', resetPassword);

// Session management
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/sessions', protect, getActiveSessions);

module.exports = router;