const { getRedisClient } = require('../config/redis');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Redis with 10 minutes expiry
const storeOTP = async (email, otp) => {
    try {
        const redisClient = getRedisClient();
        const key = `otp:${email}`;
        
        // Store OTP with 10 minutes (600 seconds) expiry
        await redisClient.setEx(key, 600, otp);
        
        console.log(`✅ OTP stored for ${email}: ${otp}`);
        return true;
    } catch (error) {
        console.error('❌ Error storing OTP:', error.message);
        return false;
    }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
    try {
        const redisClient = getRedisClient();
        const key = `otp:${email}`;
        
        const storedOTP = await redisClient.get(key);
        
        if (!storedOTP) {
            return { success: false, message: 'OTP expired or not found' };
        }
        
        if (storedOTP !== otp) {
            return { success: false, message: 'Invalid OTP' };
        }
        
        // OTP is valid, delete it
        await redisClient.del(key);
        
        return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('❌ Error verifying OTP:', error.message);
        return { success: false, message: 'Error verifying OTP' };
    }
};

// Delete OTP manually
// const deleteOTP = async (email) => {
//     try {
//         const redisClient = getRedisClient();
//         const key = `otp:${email}`;
//         await redisClient.del(key);
//         return true;
//     } catch (error) {
//         console.error('❌ Error deleting OTP:', error.message);
//         return false;
//     }
// };

// Get remaining time for OTP
const getOTPExpiry = async (email) => {
    try {
        const redisClient = getRedisClient();
        const key = `otp:${email}`;
        const ttl = await redisClient.ttl(key);
        
        if (ttl === -2) {
            return { exists: false, message: 'OTP not found' };
        }
        
        if (ttl === -1) {
            return { exists: true, expiresIn: 'never', message: 'OTP has no expiry' };
        }
        
        return { exists: true, expiresIn: ttl, message: `OTP expires in ${ttl} seconds` };
    } catch (error) {
        console.error('❌ Error getting OTP expiry:', error.message);
        return { exists: false, message: 'Error checking OTP' };
    }
};

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    // deleteOTP,
    getOTPExpiry
};