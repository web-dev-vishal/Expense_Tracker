// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// exports.protect = async (req, res, next) => {
//     let token;

//     // Check if authorization header exists and starts with "Bearer"
//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//         token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//         return res.status(401).json({ message: "Not authorized, no token" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id).select('-password');

//         if (!req.user) {
//             return res.status(401).json({ message: "Not authorized, user not found" });
//         }

//         next();
//     } catch (err) {
//         return res.status(401).json({ message: "Not authorized, token failed" });
//     }
// };

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifySession } = require("../services/sessionService");

exports.protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        // Verify session exists in Redis
        const sessionCheck = await verifySession(decoded.id, token);

        if (!sessionCheck.valid) {
            return res.status(401).json({ 
                message: "Session expired or invalid. Please login again",
                reason: sessionCheck.message 
            });
        }

        // Attach session info to request
        req.sessionId = sessionCheck.sessionId;
        req.session = sessionCheck.session;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired, please login again" });
        }
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};