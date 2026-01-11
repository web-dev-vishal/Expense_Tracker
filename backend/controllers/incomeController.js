const xlsx = require('xlsx');
const Income = require('../models/Income.js');

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

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Download Excel Sheet
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");
    xlsx.writeFile(wb, 'income_details.xlsx');

    res.download('income_details.xlsx');
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};