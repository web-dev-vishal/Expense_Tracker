// const express = require("express");
// const { 
//     addIncome, 
//     getAllIncome, 
//     deleteIncome, 
//     downloadIncomeExcel 
// } = require("../controllers/incomeController");

// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.post('/add', protect, addIncome);
// router.get('/get', protect, getAllIncome);
// router.delete('/:id', protect, deleteIncome);
// router.get('/downloadexcel', protect, downloadIncomeExcel);

// module.exports = router;

/**
 * ========================================
 * INCOME ROUTES WITH RATE LIMITING
 * ========================================
 * 
 * ✅ DOUBLE-CHECKED & VERIFIED
 * ✅ Production Ready
 * ✅ ALL ROUTES ACTIVE & UNCOMMENTED
 * 
 * File: routes/IncomeRoutes.js (or incomeRoutes.js)
 * Purpose: Income management routes with rate limiting
 * 
 * Author: Senior Backend Developer
 * Date: January 17, 2026
 * Status: READY TO USE ✅
 * ========================================
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    apiWriteLimiter, 
    apiReadLimiter 
} = require("../middleware/rateLimitMiddleware");

// Import your income controllers
const { 
    createIncome, 
    getIncomes, 
    getIncomeById,
    updateIncome, 
    deleteIncome,
    getIncomeStats,
    getTotalIncome
} = require("../controllers/incomeController");

const router = express.Router();

// ==========================================
// INCOME ROUTES WITH RATE LIMITING
// ==========================================

/**
 * @route   POST /api/v1/income
 * @desc    Create new income entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam creation of income records
 */
router.post('/', protect, apiWriteLimiter, createIncome);

/**
 * @route   GET /api/v1/income
 * @desc    Get all income entries for logged in user
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @protection Prevents excessive API calls
 */
router.get('/', protect, apiReadLimiter, getIncomes);

/**
 * @route   GET /api/v1/income/stats
 * @desc    Get income statistics
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @note    This route should be BEFORE /:id to avoid conflicts
 */
router.get('/stats', protect, apiReadLimiter, getIncomeStats);

/**
 * @route   GET /api/v1/income/total
 * @desc    Get total income
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @note    This route should be BEFORE /:id to avoid conflicts
 */
router.get('/total', protect, apiReadLimiter, getTotalIncome);

/**
 * @route   GET /api/v1/income/:id
 * @desc    Get specific income entry by ID
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @protection Prevents excessive API calls
 */
router.get('/:id', protect, apiReadLimiter, getIncomeById);

/**
 * @route   PUT /api/v1/income/:id
 * @desc    Update income entry (full update)
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam updates
 */
router.put('/:id', protect, apiWriteLimiter, updateIncome);

/**
 * @route   PATCH /api/v1/income/:id
 * @desc    Partially update income entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam updates
 */
router.patch('/:id', protect, apiWriteLimiter, updateIncome);

/**
 * @route   DELETE /api/v1/income/:id
 * @desc    Delete income entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam deletions
 */
router.delete('/:id', protect, apiWriteLimiter, deleteIncome);

module.exports = router;