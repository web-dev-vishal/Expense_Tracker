const express = require('express');
require('dotenv').config();
const connectDB = require("./config/db.js")

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Expense Tracker Backend is Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{ 
    console.log(`Example app listening at http://localhost:${PORT}`)
});