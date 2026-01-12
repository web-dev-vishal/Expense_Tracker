const xlsx = require('xlsx');
const incomeService = require('../services/incomeService');

/**
 * Add Income with Redis cache invalidation
 */
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    const { icon, source, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!source || !amount || !date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Call service to add income (validation happens in service)
        const newIncome = await incomeService.addIncome(userId, {
            icon,
            source,
            amount,
            date
        });

        res.status(201).json({
            message: "Income added successfully",
            income: newIncome
        });

    } catch (error) {
        console.error('❌ Add Income Error:', error.message);
        
        // Return specific error messages from service
        if (error.message.includes('Amount must be') || error.message.includes('Invalid date')) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Get All Income with Redis caching
 */
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        // Call service to get income (with caching)
        const income = await incomeService.getAllIncome(userId);

        res.status(200).json({
            message: "Income records retrieved successfully",
            count: income.length,
            income: income
        });

    } catch (error) {
        console.error('❌ Get All Income Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Delete Income with Redis cache invalidation
 */
exports.deleteIncome = async (req, res) => {
    const userId = req.user.id;
    const incomeId = req.params.id;

    try {
        // Call service to delete income
        const result = await incomeService.deleteIncome(incomeId, userId);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Delete Income Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Download Income Excel Sheet
 * Note: Uses fresh data (bypasses cache) for accuracy
 */
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get fresh data for Excel download
        const income = await incomeService.getIncomeForExcel(userId);

        // Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        
        const filename = 'income_details.xlsx';
        xlsx.writeFile(wb, filename);

        res.download(filename);

    } catch (error) {
        console.error('❌ Download Income Excel Error:', error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};