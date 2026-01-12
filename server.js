// require('dotenv').config();
// const express = require('express');
// const path = require("path");
// const connectDB = require("./config/db.js");
// const { connectRedis } = require('./config/redis.js');
// const authRoutes = require('./routes/authRoutes.js');
// const incomeRoutes = require('./routes/IncomeRoutes.js');
// const expenseRoutes = require('./routes/expenseRoutes.js');
// const dashboardRoutes = require('./routes/dashboardRoutes.js');

// const app = express();

// app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('Expense Tracker Backend is Running');
// });

// const PORT = process.env.PORT || 5000;

// connectDB();
// connectRedis();

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/income', incomeRoutes);
// app.use('/api/v1/expense', expenseRoutes);
// app.use('/api/v1/dashboard', dashboardRoutes);

// // Server upload folder
// app.use('/uploads', express.static(path.join(__dirname, "uploads")));

// app.listen(PORT, () =>{ 
//     console.log(`Example app listening at http://localhost:${PORT}`)
// });

require('dotenv').config();
const express = require('express');
const path = require("path");
const connectDB = require("./config/db.js");
const { connectRedis } = require('./config/redis.js');
const authRoutes = require('./routes/authRoutes.js');
const incomeRoutes = require('./routes/IncomeRoutes.js');
const expenseRoutes = require('./routes/expenseRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('✅ Expense Tracker Backend is Running with Redis!');
});

const PORT = process.env.PORT || 5000;

// Initialize Database and Redis Connections
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Connect to Redis
        await connectRedis();
        
        // Mount Routes
        app.use('/api/v1/auth', authRoutes);
        app.use('/api/v1/income', incomeRoutes);
        app.use('/api/v1/expense', expenseRoutes);
        app.use('/api/v1/dashboard', dashboardRoutes);

        // Server upload folder
        app.use('/uploads', express.static(path.join(__dirname, "uploads")));

        // Start Server
        app.listen(PORT, () => { 
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📊 Expense Tracker API is ready!`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();