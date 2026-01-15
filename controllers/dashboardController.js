const dashboardService = require('../services/dashboardService');
const { isValidObjectId } = require('mongoose');

/**
 * Get Dashboard Data with Redis caching
 */
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate userId
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid user ID" 
            });
        }

        // Get dashboard data from service (with caching)
        const dashboardData = await dashboardService.getDashboardData(userId);

        // Return success response
        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('❌ Dashboard Controller Error:', error);

        // Handle specific error types
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: "Invalid data format" 
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                errors: error.errors 
            });
        }

        // Generic error response
        res.status(500).json({ 
            success: false,
            message: "Server error while fetching dashboard data",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Manually refresh dashboard cache
 */
exports.refreshDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate userId
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid user ID" 
            });
        }

        // Invalidate cache first
        await dashboardService.invalidateDashboardCache(userId);

        // Get fresh data
        const dashboardData = await dashboardService.getDashboardData(userId);

        res.status(200).json({
            success: true,
            message: "Dashboard refreshed successfully",
            data: dashboardData
        });

    } catch (error) {
        console.error('❌ Dashboard Refresh Error:', error);
        res.status(500).json({ 
            success: false,
            message: "Server error while refreshing dashboard",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};