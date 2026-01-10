const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: '1h'});
}

// Register User
exports.registerUser = async (req,res) => {};

// Login User
exports.loginUser = async (req,res) => {};

// GetInfo User
exports.getUserInfo = async (req,res) => {};