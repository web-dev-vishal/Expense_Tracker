const redis = require('redis');

let redisClient;

const connectRedis = async () => {
    try {
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

        await redisClient.connect();
        
    } catch (error) {
        console.error('❌ Redis Connection Error:', error.message);
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};

module.exports = { connectRedis, getRedisClient };