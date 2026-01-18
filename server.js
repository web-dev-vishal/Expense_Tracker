// require('dotenv').config();
// const express = require('express');
// const path = require("path");
// const mongoose = require('mongoose');
// const connectDB = require("./config/db.js");
// const { connectRedis, getRedisClient } = require('./config/redis.js');
// const authRoutes = require('./routes/authRoutes.js');
// const incomeRoutes = require('./routes/IncomeRoutes.js');
// const expenseRoutes = require('./routes/expenseRoutes.js');
// const dashboardRoutes = require('./routes/dashboardRoutes.js');
// const { generalLimiter } = require('./middleware/rateLimitMiddleware.js');

// const app = express();

// // ==========================================
// // TRUST PROXY CONFIGURATION
// // ==========================================
// // CRITICAL: Required for rate limiting behind proxies
// // This ensures req.ip contains the real client IP address
// // Works with: Nginx, AWS ELB, Heroku, Docker, Kubernetes
// app.set('trust proxy', 1);

// // ==========================================
// // MIDDLEWARE
// // ==========================================
// app.use(express.json());

// // Apply general rate limiter to all API routes
// // This provides baseline protection for all endpoints
// // Limit: 100 requests per 15 minutes per IP
// app.use('/api', generalLimiter);

// // ==========================================
// // HEALTH CHECK ROUTE
// // ==========================================
// app.get('/', (req, res) => {
//     res.json({
//         status: 'success',
//         message: '✅ Expense Tracker Backend is Running',
//         services: {
//             mongodb: mongoose.connection.readyState === 1,
//             redis: getRedisClient() ? true : false
//         },
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV || 'development'
//     });
// });

// const PORT = process.env.PORT || 5000;

// // Store server instance for graceful shutdown
// let server;

// // ==========================================
// // SERVER INITIALIZATION
// // ==========================================
// const startServer = async () => {
//     try {
//         console.log('🚀 Starting Expense Tracker Server...');
//         console.log('═══════════════════════════════════════');

//         // Connect to MongoDB
//         await connectDB();
//         console.log('✅ MongoDB Connected');

//         // Connect to Redis
//         await connectRedis();
//         console.log('✅ Redis Connected');
//         console.log('✅ Rate Limiting Enabled (Redis Store)');

//         // Mount Routes AFTER all connections are established
//         app.use('/api/v1/auth', authRoutes);
//         app.use('/api/v1/income', incomeRoutes);
//         app.use('/api/v1/expense', expenseRoutes);
//         app.use('/api/v1/dashboard', dashboardRoutes);

//         // Serve upload folder for static files
//         app.use('/uploads', express.static(path.join(__dirname, "uploads")));

//         // 404 handler for unknown routes
//         app.use((req, res) => {
//             res.status(404).json({
//                 success: false,
//                 message: 'Route not found',
//                 path: req.originalUrl
//             });
//         });

//         // Error handling middleware (must be last)
//         app.use((err, req, res, next) => {
//             console.error('❌ Server Error:', err.stack);

//             // Handle specific error types
//             if (err.name === 'ValidationError') {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Validation error',
//                     errors: err.errors
//                 });
//             }

//             if (err.name === 'UnauthorizedError') {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'Unauthorized access'
//                 });
//             }

//             // Default error response
//             res.status(err.status || 500).json({
//                 success: false,
//                 message: err.message || 'Internal server error',
//                 error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//             });
//         });

//         // Start HTTP Server
//         server = app.listen(PORT, () => {
//             console.log('═══════════════════════════════════════');
//             console.log(`🚀 Server running at http://localhost:${PORT}`);
//             console.log(`📊 Expense Tracker API is ready!`);
//             console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
//             console.log(`🛡️  Rate Limiting: ENABLED`);
//             console.log(`🔴 Redis: ${getRedisClient() ? 'CONNECTED' : 'DISCONNECTED'}`);
//             console.log('═══════════════════════════════════════');
//         });

//         // Handle server errors
//         server.on('error', (error) => {
//             if (error.code === 'EADDRINUSE') {
//                 console.error(`❌ Port ${PORT} is already in use`);
//             } else {
//                 console.error('❌ Server Error:', error);
//             }
//             process.exit(1);
//         });

//         // Setup graceful shutdown handlers
//         setupGracefulShutdown();

//     } catch (error) {
//         console.error('❌ Failed to start server:', error.message);
//         console.error('Error details:', error);
//         process.exit(1);
//     }
// };

// // ==========================================
// // GRACEFUL SHUTDOWN SETUP
// // ==========================================
// const setupGracefulShutdown = () => {
//     // Handle SIGTERM signal (e.g., from Docker, Kubernetes)
//     process.on('SIGTERM', async () => {
//         console.log('\n🛑 SIGTERM signal received: initiating graceful shutdown');
//         await gracefulShutdown();
//     });

//     // Handle SIGINT signal (Ctrl+C)
//     process.on('SIGINT', async () => {
//         console.log('\n🛑 SIGINT signal received: initiating graceful shutdown');
//         await gracefulShutdown();
//     });

//     // Handle uncaught exceptions
//     process.on('uncaughtException', async (error) => {
//         console.error('❌ Uncaught Exception:', error);
//         await gracefulShutdown(1);
//     });

//     // Handle unhandled promise rejections
//     process.on('unhandledRejection', async (reason, promise) => {
//         console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//         await gracefulShutdown(1);
//     });
// };

// // ==========================================
// // GRACEFUL SHUTDOWN FUNCTION
// // ==========================================
// const gracefulShutdown = async (exitCode = 0) => {
//     console.log('📋 Initiating graceful shutdown...');

//     // Prevent new connections
//     if (server) {
//         server.close(async () => {
//             console.log('✅ HTTP server closed (no new connections accepted)');
//         });
//     }

//     try {
//         // Close Redis connection
//         console.log('🔴 Closing Redis connection...');
//         try {
//             const redisClient = getRedisClient();
//             if (redisClient) {
//                 await redisClient.quit();
//                 console.log('✅ Redis connection closed');
//             }
//         } catch (error) {
//             console.warn('⚠️ Redis cleanup warning:', error.message);
//         }

//         // Close MongoDB connection
//         console.log('🍃 Closing MongoDB connection...');
//         await mongoose.connection.close();
//         console.log('✅ MongoDB connection closed');

//         console.log('✅ All connections closed successfully');
//         console.log('👋 Graceful shutdown completed');

//         // Exit process
//         process.exit(exitCode);

//     } catch (error) {
//         console.error('❌ Error during graceful shutdown:', error);
//         // Force exit even if cleanup fails
//         process.exit(1);
//     }
// };

// // Handle unexpected errors
// process.on('warning', (warning) => {
//     console.warn('⚠️ Warning:', warning.name, warning.message);
// });

// // Start the server
// startServer();

