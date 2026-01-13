const User = require('../models/User.js');
const jwt = require("jsonwebtoken");
const { generateOTP, storeOTP, verifyOTP } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');

const { 
    createSession, 
    deleteSession, 
    deleteAllSessions, 
    getActiveSessions 
} = require('../services/sessionService');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Register User
exports.registerUser = async (req, res) => {

    const { fullName, email, phone, password, profileImageUrl } = req.body;

    // Validation: Check for missing fields
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if email alread exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use try different Email" });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        //Creating a user
        const user = await User.create({
            fullName,
            email,
            phone,
            password,
            profileImageUrl
        });

        // Generate token
        const token = generateToken(user._id);

        // Create session in Redis
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        };
        
        await createSession(user._id, token, deviceInfo);

        res.status(201).json({
            id: user._id,
            user,
            token: token,
        });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user._id);

        // Create session in Redis
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        };
        
        const sessionResult = await createSession(user._id, token, deviceInfo);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            id: user._id,
            message: "Login successful",
            user: userResponse,
            token: token,
            sessionId: sessionResult.sessionId
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in user", error: err.message });
    }
};

// GetInfo User
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User information retrieved successfully",
            user: user
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user information", error: error.message });
    }
};

// ============= OTP FEATURES - EMAIL ONLY =============

// Send OTP via Email Only
exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in Redis
        const stored = await storeOTP(email, otp);
        
        if (!stored) {
            return res.status(500).json({ message: "Failed to generate OTP. Please try again" });
        }

        console.log('📧 Sending OTP via Email...');

        // Send email
        const emailResult = await sendOTPEmail(email, otp, user.fullName);

        if (!emailResult.success) {
            return res.status(500).json({ 
                message: "Failed to send OTP email",
                error: emailResult.error
            });
        }

        console.log('✅ OTP sent successfully to email');

        res.status(200).json({
            message: "OTP sent successfully to your email",
            email: email
        });

    } catch (error) {
        console.error('❌ Error in sendOTP:', error.message);
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};


// Verify OTP
exports.verifyOTPController = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        const result = await verifyOTP(email, otp);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(200).json({
            message: result.message,
            verified: true
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
};

// Reset Password (after OTP verification)
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    // Password validation
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    try {
        // Verify OTP first
        const otpResult = await verifyOTP(email, otp);
        
        if (!otpResult.success) {
            return res.status(400).json({ message: otpResult.message });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update password (will be hashed by pre-save hook in User model)
        user.password = newPassword;
        await user.save();

        // Logout from all devices (delete all sessions) for security
        await deleteAllSessions(user._id);

        res.status(200).json({
            message: "Password reset successfully. Please login again with your new password"
        });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};

// ============= NEW SESSION MANAGEMENT FEATURES =============

// Logout (Delete current session)
exports.logout = async (req, res) => {
    try {
        const userId = req.user._id;
        const sessionId = req.sessionId;

        const result = await deleteSession(userId, sessionId);

        if (!result.success) {
            return res.status(500).json({ 
                message: "Error logging out",
                error: result.error 
            });
        }

        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await deleteAllSessions(userId);

        if (!result.success) {
            return res.status(500).json({ 
                message: "Error logging out from all devices",
                error: result.error 
            });
        }

        res.status(200).json({
            message: `Logged out from all devices successfully`,
            devicesLoggedOut: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging out from all devices", error: error.message });
    }
};

// Get active sessions
exports.getActiveSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await getActiveSessions(userId);

        if (!result.success) {
            return res.status(500).json({ 
                message: "Error fetching active sessions",
                error: result.error 
            });
        }

        res.status(200).json({
            message: "Active sessions retrieved successfully",
            activeSessions: result.sessions,
            totalSessions: result.count
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching active sessions", error: error.message });
    }
};
