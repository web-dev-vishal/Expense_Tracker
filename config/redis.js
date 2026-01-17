/*
 * ========================================
 * REDIS CONFIGURATION
 * ========================================
 */

const redis = require('redis');

let redisClient = null;
let isConnecting = false;

/**
 * Connect to Redis
 * Safe to call multiple times - will only connect once
 */
const connectRedis = async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        console.log('⏳ Redis connection already in progress...');
        return;
    }

    // Return existing client if already connected
    if (redisClient && redisClient.isOpen) {
        console.log('✅ Redis already connected');
        return redisClient;
    }

    try {
        isConnecting = true;
        
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', (err) => {
            console.error('🔴 Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('🟢 Redis connecting...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis Connected Successfully');
        });

        redisClient.on('end', () => {
            console.log('🔴 Redis connection closed');
        });

        await redisClient.connect();
        isConnecting = false;
        
        return redisClient;
        
    } catch (error) {
        isConnecting = false;
        console.error('❌ Redis Connection Error:', error.message);
        throw error;
    }
};

/**
 * Get Redis client - SAFE VERSION
 * Returns null if not connected instead of throwing error
 * This allows graceful fallback to memory store
 */
const getRedisClient = () => {
    // Return client only if it exists and is connected
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }
    
    // Return null instead of throwing error
    // This allows rate limiter to fall back to memory store
    return null;
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
    return redisClient && redisClient.isOpen;
};

/**
 * Disconnect Redis client
 */
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('✅ Redis disconnected');
    }
};

module.exports = { 
    connectRedis, 
    getRedisClient, 
    isRedisConnected,
    disconnectRedis 
};