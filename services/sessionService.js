const { getRedisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

// Create session in Redis
const createSession = async (userId, token, deviceInfo = {}) => {
    try {
        const redisClient = getRedisClient();
        const sessionId = uuidv4();
        
        const sessionData = {
            userId: userId.toString(),
            sessionId: sessionId,
            token: token,
            deviceInfo: {
                userAgent: deviceInfo.userAgent || 'Unknown',
                ip: deviceInfo.ip || 'Unknown'
            },
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        // Store session with 1 hour expiry (same as JWT)
        const sessionKey = `session:${userId}:${sessionId}`;
        await redisClient.setEx(sessionKey, 3600, JSON.stringify(sessionData));

        // Add to user's active sessions set
        const userSessionsKey = `user_sessions:${userId}`;
        await redisClient.sAdd(userSessionsKey, sessionId);
        await redisClient.expire(userSessionsKey, 3600);

        console.log(`✅ Session created for user ${userId}`);
        return { success: true, sessionId, sessionData };
    } catch (error) {
        console.error('❌ Error creating session:', error.message);
        return { success: false, error: error.message };
    }
};

// Verify session exists in Redis
const verifySession = async (userId, token) => {
    try {
        const redisClient = getRedisClient();
        
        // Get all session IDs for this user
        const userSessionsKey = `user_sessions:${userId}`;
        const sessionIds = await redisClient.sMembers(userSessionsKey);

        if (!sessionIds || sessionIds.length === 0) {
            console.log(`⚠️ No active sessions found for user ${userId}`);
            return { valid: false, message: 'No active session found' };
        }

        // Check each session to find matching token
        for (const sessionId of sessionIds) {
            const sessionKey = `session:${userId}:${sessionId}`;
            const sessionData = await redisClient.get(sessionKey);

            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                if (session.token === token) {
                    // Update last active time
                    session.lastActive = new Date().toISOString();
                    await redisClient.setEx(sessionKey, 3600, JSON.stringify(session));
                    
                    return { 
                        valid: true, 
                        sessionId: sessionId,
                        session: session 
                    };
                }
            }
        }

        console.log(`⚠️ Token not found in active sessions for user ${userId}`);
        return { valid: false, message: 'Session not found or expired' };
    } catch (error) {
        console.error('❌ Error verifying session:', error.message);
        return { valid: false, error: error.message };
    }
};

// Delete specific session (logout)
const deleteSession = async (userId, sessionId) => {
    try {
        const redisClient = getRedisClient();
        
        // Delete session data
        const sessionKey = `session:${userId}:${sessionId}`;
        await redisClient.del(sessionKey);

        // Remove from user's active sessions set
        const userSessionsKey = `user_sessions:${userId}`;
        await redisClient.sRem(userSessionsKey, sessionId);

        console.log(`✅ Session ${sessionId} deleted for user ${userId}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting session:', error.message);
        return { success: false, error: error.message };
    }
};

// Delete all sessions for a user (logout from all devices)
const deleteAllSessions = async (userId) => {
    try {
        const redisClient = getRedisClient();
        
        // Get all session IDs
        const userSessionsKey = `user_sessions:${userId}`;
        const sessionIds = await redisClient.sMembers(userSessionsKey);

        if (!sessionIds || sessionIds.length === 0) {
            return { success: true, deletedCount: 0 };
        }

        // Delete each session
        const deletePromises = sessionIds.map(sessionId => {
            const sessionKey = `session:${userId}:${sessionId}`;
            return redisClient.del(sessionKey);
        });

        await Promise.all(deletePromises);

        // Delete the sessions set
        await redisClient.del(userSessionsKey);

        console.log(`✅ All ${sessionIds.length} sessions deleted for user ${userId}`);
        return { success: true, deletedCount: sessionIds.length };
    } catch (error) {
        console.error('❌ Error deleting all sessions:', error.message);
        return { success: false, error: error.message };
    }
};

// Get all active sessions for a user
const getActiveSessions = async (userId) => {
    try {
        const redisClient = getRedisClient();
        
        const userSessionsKey = `user_sessions:${userId}`;
        const sessionIds = await redisClient.sMembers(userSessionsKey);

        if (!sessionIds || sessionIds.length === 0) {
            return { success: true, sessions: [] };
        }

        const sessions = [];
        for (const sessionId of sessionIds) {
            const sessionKey = `session:${userId}:${sessionId}`;
            const sessionData = await redisClient.get(sessionKey);

            if (sessionData) {
                const session = JSON.parse(sessionData);
                sessions.push({
                    sessionId: sessionId,
                    deviceInfo: session.deviceInfo,
                    createdAt: session.createdAt,
                    lastActive: session.lastActive
                });
            }
        }

        return { success: true, sessions, count: sessions.length };
    } catch (error) {
        console.error('❌ Error getting active sessions:', error.message);
        return { success: false, error: error.message };
    }
};

// Get session TTL (time remaining)
const getSessionTTL = async (userId, sessionId) => {
    try {
        const redisClient = getRedisClient();
        const sessionKey = `session:${userId}:${sessionId}`;
        const ttl = await redisClient.ttl(sessionKey);
        
        return { 
            success: true, 
            ttl: ttl,
            expiresIn: ttl > 0 ? `${Math.floor(ttl / 60)} minutes` : 'expired'
        };
    } catch (error) {
        console.error('❌ Error getting session TTL:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    createSession,
    verifySession,
    deleteSession,
    deleteAllSessions,
    getActiveSessions,
    getSessionTTL
};