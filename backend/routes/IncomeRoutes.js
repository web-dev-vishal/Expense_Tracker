const express = require("express");

// Import All controller
const { addIncome, getAllIncome, deleteIncome, downloadIncomeExcel } = require("../controllers/incomeController");

// Import Middleware
const { protect } = require("../middleware/authMiddleware");

// All Routes
const router = express.Router();

router.post('/add', protect, addIncome);
router.get('/get', protect, getAllIncome);
router.get('/downloadexcel', protect, deleteIncome);
router.delete('/:id', protect, downloadIncomeExcel);

// exporting this model
module.exports = router;