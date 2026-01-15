const express = require("express");
const { 
    addIncome, 
    getAllIncome, 
    deleteIncome, 
    downloadIncomeExcel 
} = require("../controllers/incomeController");

const { protect } = require("../middleware/authMiddleware");
const { strictLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post('/add', protect, strictLimiter, addIncome);
router.get('/get', protect, getAllIncome);
router.delete('/:id', protect, strictLimiter, deleteIncome);
router.get('/downloadexcel', protect, downloadIncomeExcel);

module.exports = router;