/*
 * ========================================
 * INCOME ROUTES WITH RATE LIMITING
 * ========================================
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    apiWriteLimiter, 
    apiReadLimiter 
} = require("../middleware/rateLimitMiddleware");

// Import income controller functions (VERIFIED - these exist!)
const { 
    addIncome, 
    getAllIncome, 
    deleteIncome, 
    downloadIncomeExcel 
} = require("../controllers/incomeController");

const router = express.Router();

// ==========================================
// INCOME ROUTES WITH RATE LIMITING
// ==========================================

/**
 * @route   POST /api/v1/income/add
 * @desc    Add new income entry
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @controller addIncome
 */
router.post('/add', protect, apiWriteLimiter, addIncome);

/**
 * @route   GET /api/v1/income/get
 * @desc    Get all income entries for logged in user
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller getAllIncome
 */
router.get('/get', protect, apiReadLimiter, getAllIncome);

/**
 * @route   GET /api/v1/income/downloadexcel
 * @desc    Download income data as Excel file
 * @access  Private
 * @limit   60 requests per minute (apiReadLimiter)
 * @controller downloadIncomeExcel
 * @note    Must be BEFORE /:id to avoid route conflicts
 */
router.get('/downloadexcel', protect, apiReadLimiter, downloadIncomeExcel);

/**
 * @route   DELETE /api/v1/income/:id
 * @desc    Delete income entry by ID
 * @access  Private
 * @limit   20 requests per minute (apiWriteLimiter)
 * @controller deleteIncome
 */
router.delete('/:id', protect, apiWriteLimiter, deleteIncome);

module.exports = router;