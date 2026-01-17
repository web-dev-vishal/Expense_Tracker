

/**
 * ========================================
 * EXPENSE ROUTES WITH RATE LIMITING
 * ========================================
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    apiWriteLimiter, 
    apiReadLimiter 
} = require("../middleware/rateLimitMiddleware");

// Import expense controller functions (VERIFIED - these exist!)
const { 
    addExpense, 
    getAllExpense, 
    deleteExpense, 
    downloadExpenseExcel 
} = require("../controllers/expenseController");

const router = express.Router();

// ==========================================
// EXPENSE ROUTES WITH RATE LIMITING
// ==========================================

/**
 * @route   POST /api/v1/expense/add
 * @desc    Add new expense entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @controller addExpense
 */
router.post('/add', protect, apiWriteLimiter, addExpense);

/**
 * @route   GET /api/v1/expense/get
 * @desc    Get all expense entries for logged in user
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller getAllExpense
 */
router.get('/get', protect, apiReadLimiter, getAllExpense);

/**
 * @route   GET /api/v1/expense/downloadexcel
 * @desc    Download expense data as Excel file
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller downloadExpenseExcel
 * @note    Must be BEFORE /:id to avoid route conflicts
 */
router.get('/downloadexcel', protect, apiReadLimiter, downloadExpenseExcel);

/**
 * @route   DELETE /api/v1/expense/:id
 * @desc    Delete expense entry by ID
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @controller deleteExpense
 */
router.delete('/:id', protect, apiWriteLimiter, deleteExpense);

module.exports = router;