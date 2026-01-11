const express = require("express");

// Import all middleware
const { protect } = require('../middleware/authMiddleware');

// Import all controller
const { getDashboardData } = require("../controllers/destopContoller");

// Import all dashborddata routes
const router = express.Router();

router.get("/" ,protect, getDashboardData );

// exporting module
module.exports = router;