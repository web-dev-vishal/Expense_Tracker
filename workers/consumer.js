require('dotenv').config();
const messageConsumer = require('../services/messageConsumer');
const rabbitmqConfig = require('../config/rabbitmq');
const { connectRedis } = require('../config/redis');

/**
 * ==========================================
 * RABBITMQ CONSUMER WORKER
 * ==========================================
 * Standalone worker process for consuming messages
 * Run this separately from main server
 */

let isShuttingDown = false;

/**
 * Start the consumer worker
 */
async function startWorker() {
    try {
        console.log('🚀 Starting RabbitMQ Consumer Worker...');
        console.log('═══════════════════════════════════════');
        console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Connect to Redis (needed for cache updates)
        console.log('🔴 Connecting to Redis...');
        await connectRedis();
        console.log('✅ Redis Connected');

        // Initialize RabbitMQ connection
        console.log('🐰 Connecting to RabbitMQ...');
        await rabbitmqConfig.connect();
        console.log('✅ RabbitMQ Connected');
        
        // Start all message consumers
        console.log('👂 Starting message consumers...');
        await messageConsumer.start();
        
        console.log('═══════════════════════════════════════');
        console.log('✅ Consumer Worker is running');
        console.log('📥 Listening for messages...');
        console.log('Press CTRL+C to stop the worker');
        console.log('═══════════════════════════════════════');
        
    } catch (error) {
        console.error('❌ Failed to start consumer worker:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
    if (isShuttingDown) {
        console.log('⚠️ Shutdown already in progress...');
        return;
    }
    
    isShuttingDown = true;
    console.log(`\n📢 Received ${signal}. Starting graceful shutdown...`);
    
    try {
        // Stop all consumers
        console.log('🛑 Stopping message consumers...');
        await messageConsumer.stop();
        console.log('✅ All consumers stopped');
        
        // Close RabbitMQ connection
        console.log('🔌 Closing RabbitMQ connection...');
        await rabbitmqConfig.close();
        console.log('✅ RabbitMQ connection closed');
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
}

/**
 * Error handlers
 */
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
});

/**
 * Shutdown signals
 */
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

/**
 * Start the worker
 */
startWorker();