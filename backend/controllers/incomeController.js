const Income = require('../models/Income.js');
const jwt = require("jsonwebtoken");

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    const { icon, source, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!source || !amount || !date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Validate date format
    const incomeDate = new Date(date);
    if (isNaN(incomeDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
    }

    try {
        const newIncome = new Income({
            userId,
            icon,
            source,
            amount: parseFloat(amount),
            date: incomeDate
        });

        await newIncome.save();
        res.status(201).json({
            message: "Income added successfully",
            income: newIncome
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get ALL income
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        
        res.status(200).json({
            message: "Income records retrieved successfully",
            count: income.length,
            income: income
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add Income Source
exports.deleteIncome = async (req, res) => {

};

// Download Excel Sheet
exports.downloadIncomeExcel = async (req, res) => {

};