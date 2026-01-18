/*
 * ========================================
 * AUTHENTICATION ROUTES WITH RATE LIMITING
 * ========================================
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    authLimiter,
    otpLimiter,
    otpVerifyLimiter,
    passwordResetLimiter,
    apiReadLimiter,
    strictLimiter
} = require("../middleware/rateLimitMiddleware");

// Import authentication controller functions (VERIFIED - these exist!)
const { 
    registerUser, 
    loginUser, 
    getUserInfo,
    sendOTP,
    verifyOTPController,
    resetPassword,
    logout,
    logoutAllDevices,
    getActiveSessions,
    createSession  
} = require("../controllers/authController");

const router = express.Router();

// ==========================================
// PUBLIC AUTH ROUTES (WITH STRICT RATE LIMITING)
// ==========================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 * @limit   5 attempts per 15 minutes (authLimiter)
 * @controller registerUser
 */
router.post('/register', authLimiter, registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @limit   5 attempts per 15 minutes (authLimiter)
 * @controller loginUser
 */
router.post('/login', authLimiter, loginUser);

// ==========================================
// OTP ROUTES (WITH SPECIFIC RATE LIMITING)
// ==========================================

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to user's email
 * @access  Public
 * @limit   3 requests per 10 minutes (otpLimiter)
 * @controller sendOTP
 */
router.post('/sendotp', otpLimiter, sendOTP);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 * @limit   10 attempts per 15 minutes (otpVerifyLimiter)
 * @controller verifyOTPController
 */
router.post('/verifyotp', otpVerifyLimiter, verifyOTPController);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password (requires valid OTP)
 * @access  Public
 * @limit   3 attempts per hour (passwordResetLimiter)
 * @controller resetPassword
 */
router.post('/resetpassword', passwordResetLimiter, resetPassword);

// ==========================================
// PROTECTED USER ROUTES
// ==========================================

/**
 * @route   GET /api/v1/auth/user
 * @desc    Get current user information
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller getUserInfo
 */
router.get('/user', protect, apiReadLimiter, getUserInfo);

// ==========================================
// SESSION MANAGEMENT ROUTES
// ==========================================

/**
 * @route   POST /api/v1/auth/session
 * @desc    Create a new session (manual session creation)
 * @access  Private
 * @limit   5 attempts per 15 minutes (authLimiter)
 * @controller createSession
 */
router.post('/createsession', protect, authLimiter, createSession);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout from current session
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller logout
 */
router.post('/logout', protect, apiReadLimiter, logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices/sessions
 * @access  Private
 * @limit   5 requests per hour (strictLimiter)
 * @controller logoutAllDevices
 */
router.post('/logout-all', protect, strictLimiter, logoutAllDevices);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller getActiveSessions
 */
router.get('/sessions', protect, apiReadLimiter, getActiveSessions);

module.exports = router;