const express = require('express');
require('dotenv').config();
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require('./routes/authRoutes.js');
const incomeRoutes = require('./routes/IncomeRoutes.js');
const expenseRoutes = require('./routes/expenseRoutes.js');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Expense Tracker Backend is Running');
});

const PORT = process.env.PORT || 5000;

connectDB();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/expense', expenseRoutes);

// Server upload folder
app.use('/uploads', express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () =>{ 
    console.log(`Example app listening at http://localhost:${PORT}`)
});