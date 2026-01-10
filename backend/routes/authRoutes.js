const express = require("express");

// import all controller
const { registerUser, loginUser, getUserInfo } = require("../controllers/authController.js");

// import middleware
const { protect } = require("../middleware/authMiddleware.js")

// all routes
const router = express.Router();

router.post('/register',registerUser);

router.post('/login',loginUser);

router.get('/getUser', protect,getUserInfo);

module.exports = router;