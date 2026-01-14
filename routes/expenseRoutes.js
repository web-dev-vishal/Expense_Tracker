const express = require("express");
const { 
    addExpense, 
    getAllExpense, 
    deleteExpense, 
    downloadExpenseExcel 
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");

// Import rate limiters
const { strictLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply rate limiter to expensive operations
router.post('/add', protect, strictLimiter, addExpense);
router.get('/get', protect, getAllExpense);
router.delete('/:id', protect, strictLimiter, deleteExpense);
router.get('/downloadexcel', protect, downloadExpenseExcel);

module.exports = router;