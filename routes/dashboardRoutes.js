const express = require("express");
const { getDashboardData, refreshDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// Import rate limiters
const { dashboardLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply rate limiter to dashboard routes
router.get('/get', protect, dashboardLimiter, getDashboardData);
router.get('/refresh', protect, dashboardLimiter, refreshDashboard);

module.exports = router;