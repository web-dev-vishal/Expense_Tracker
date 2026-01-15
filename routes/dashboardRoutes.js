const express = require("express");
const { getDashboardData, refreshDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { dashboardLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Get dashboard data (with caching and rate limiting)
router.get('/get', protect, dashboardLimiter, getDashboardData);

// Manually refresh dashboard (clear cache and get fresh data)
router.get('/refresh', protect, dashboardLimiter, refreshDashboard);

module.exports = router;