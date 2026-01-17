/**
 * ========================================
 * DASHBOARD ROUTES WITH RATE LIMITING
 * ========================================
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    apiReadLimiter 
} = require("../middleware/rateLimitMiddleware");

// Import dashboard controller functions (VERIFIED - these exist!)
const { 
    getDashboardData,
    refreshDashboard
} = require("../controllers/dashboardController");

const router = express.Router();

// ==========================================
// DASHBOARD ROUTES WITH RATE LIMITING
// ==========================================

/**
 * @route   GET /api/v1/dashboard
 * @desc    Get dashboard data (with Redis caching)
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller getDashboardData
 * @cache   Cached in Redis for 5 minutes
 */
router.get('/get', protect, apiReadLimiter, getDashboardData);

/**
 * @route   POST /api/v1/dashboard/refresh
 * @desc    Manually refresh dashboard cache and get fresh data
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller refreshDashboard
 * @cache   Clears cache and fetches fresh data
 */
router.post('/refresh', protect, apiReadLimiter, refreshDashboard);

module.exports = router;