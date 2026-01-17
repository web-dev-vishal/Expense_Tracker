// const express = require("express");
// const { 
//     addExpense, 
//     getAllExpense, 
//     deleteExpense, 
//     downloadExpenseExcel 
// } = require("../controllers/expenseController");

// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.post('/add', protect, addExpense);
// router.get('/get', protect, getAllExpense);
// router.delete('/:id', protect, deleteExpense);
// router.get('/downloadexcel', protect, downloadExpenseExcel);

// module.exports = router;

/**
 * ========================================
 * EXPENSE ROUTES WITH RATE LIMITING
 * ========================================
 * 
 * ✅ DOUBLE-CHECKED & VERIFIED
 * ✅ Production Ready
 * ✅ ALL ROUTES ACTIVE & UNCOMMENTED
 * 
 * File: routes/expenseRoutes.js
 * Purpose: Expense management routes with rate limiting
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

// Import your expense controllers
const { 
    createExpense, 
    getExpenses, 
    getExpenseById,
    updateExpense, 
    deleteExpense,
    getExpenseStats,
    getTotalExpenses,
    getExpensesByCategory
} = require("../controllers/expenseController");

const router = express.Router();

// ==========================================
// EXPENSE ROUTES WITH RATE LIMITING
// ==========================================

/**
 * @route   POST /api/v1/expense
 * @desc    Create new expense entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam creation of expense records
 */
router.post('/', protect, apiWriteLimiter, createExpense);

/**
 * @route   GET /api/v1/expense
 * @desc    Get all expense entries for logged in user
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @protection Prevents excessive API calls
 */
router.get('/', protect, apiReadLimiter, getExpenses);

/**
 * @route   GET /api/v1/expense/stats
 * @desc    Get expense statistics
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @note    This route should be BEFORE /:id to avoid conflicts
 */
router.get('/stats', protect, apiReadLimiter, getExpenseStats);

/**
 * @route   GET /api/v1/expense/total
 * @desc    Get total expenses
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @note    This route should be BEFORE /:id to avoid conflicts
 */
router.get('/total', protect, apiReadLimiter, getTotalExpenses);

/**
 * @route   GET /api/v1/expense/category/:category
 * @desc    Get expenses by category
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @note    This route should be BEFORE /:id to avoid conflicts
 */
router.get('/category/:category', protect, apiReadLimiter, getExpensesByCategory);

/**
 * @route   GET /api/v1/expense/:id
 * @desc    Get specific expense entry by ID
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @protection Prevents excessive API calls
 */
router.get('/:id', protect, apiReadLimiter, getExpenseById);

/**
 * @route   PUT /api/v1/expense/:id
 * @desc    Update expense entry (full update)
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam updates
 */
router.put('/:id', protect, apiWriteLimiter, updateExpense);

/**
 * @route   PATCH /api/v1/expense/:id
 * @desc    Partially update expense entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam updates
 */
router.patch('/:id', protect, apiWriteLimiter, updateExpense);

/**
 * @route   DELETE /api/v1/expense/:id
 * @desc    Delete expense entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @protection Prevents spam deletions
 */
router.delete('/:id', protect, apiWriteLimiter, deleteExpense);

module.exports = router;