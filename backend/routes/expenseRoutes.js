const express = require("express");

// Import All controller
const { addExpense, 
    getAllExpense, 
    deleteExpense, 
    downloadExpenseExcel } = require("../controllers/expenseController");

// Import Middleware
const { protect } = require("../middleware/authMiddleware");

// All Expense Routes
const router = express.Router();

router.post('/add', protect, addExpense);
router.get('/get', protect, getAllExpense);
router.delete('/:id', protect, deleteExpense ) ;
router.get('/downloadexcel', protect, downloadExpenseExcel);

// exporting this model
module.exports = router;