const xlsx = require('xlsx');
const expenseService = require('../services/expenseService');

/**
 * Add Expense with Redis cache invalidation
 */
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { icon, category, amount, date } = req.body;

        // Validation
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Call service to add expense
        const newExpense = await expenseService.addExpense(userId, {
            icon,
            category,
            amount,
            date
        });

        res.status(200).json(newExpense);

    } catch (error) {
        console.error('❌ Add Expense Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Get All Expenses with Redis caching
 */
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Call service to get expenses (with caching)
        const expenses = await expenseService.getAllExpenses(userId);
        
        res.status(200).json({
            message: "Expenses records retrieved successfully",
            count: expenses.length,
            expenses: expenses
        });

    } catch (error) {
        console.error('❌ Get All Expenses Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Delete Expense with Redis cache invalidation
 */
exports.deleteExpense = async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    
    try {
        // Call service to delete expense
        const result = await expenseService.deleteExpense(expenseId, userId);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Delete Expense Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Download Expense Excel Sheet
 * Note: Uses fresh data (bypasses cache) for accuracy
 */
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get fresh data for Excel download
        const expenses = await expenseService.getExpensesForExcel(userId);
        
        // Prepare data for Excel
        const data = expenses.map((item) => ({
            Category: item.category,
            Icon: item.icon,
            Amount: item.amount,
            Date: item.date,
        }));
    
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        
        const filename = 'expense_details.xlsx';
        xlsx.writeFile(wb, filename);
    
        res.download(filename);

    } catch (error) {
        console.error('❌ Download Expense Excel Error:', error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};