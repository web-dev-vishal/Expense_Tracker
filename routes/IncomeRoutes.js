const express = require("express");
const { 
    addIncome, 
    getAllIncome, 
    deleteIncome, 
    downloadIncomeExcel 
} = require("../controllers/incomeController");

const { protect } = require("../middleware/authMiddleware");

// Import rate limiters
const { strictLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply rate limiter to expensive operations
router.post('/add', protect, strictLimiter, addIncome);
router.get('/get', protect, getAllIncome);
router.delete('/:id', protect, strictLimiter, deleteIncome);
router.get('/downloadexcel', protect, downloadIncomeExcel);

module.exports = router;