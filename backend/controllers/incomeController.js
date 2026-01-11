const User = require('../models/Income.js');
const jwt = require("jsonwebtoken");

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, source, amount, date } = req.body;

        // validation Check for missing fields
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get ALL income
exports.getAllIncome = async (req, res) => {

};

// Add Income Source
exports.deleteIncome = async (req, res) => {

};

// Download Excel Sheet
exports.downloadIncomeExcel = async (req, res) => {

};