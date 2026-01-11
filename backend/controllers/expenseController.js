const xlsx = require('xlsx');
const Expense = require('../models/Expense.js');

// Add Income Source
exports.addExpense = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get ALL income
exports.getAllExpense = async (req, res) => {

    try {
      

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete Income Source
exports.deleteExpense = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Download Excel Sheet
exports.downloadExpenseExcel = async (req, res) => {

    try {
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};