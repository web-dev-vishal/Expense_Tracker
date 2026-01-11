const xlsx = require('xlsx');
const Expense = require('../models/Expense.js');

// Add Expense Source
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;

        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
        });

        await newExpense.save();
        res.status(200).json(newExpense);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Expense income
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expense);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete Expense Source
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Download Expense Excel Sheet
exports.downloadExpenseExcel = async (req, res) => {

    try {

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};