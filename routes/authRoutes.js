// const express = require("express");

// // import all controller
// const { registerUser, loginUser, getUserInfo } = require("../controllers/authController.js");

// // import all middleware
// const { protect } = require("../middleware/authMiddleware.js");
// const upload = require("../middleware/uploadMiddleware.js");

// // all routes
// const router = express.Router();

// router.post('/register',registerUser);

// router.post('/login',loginUser);

// router.get('/getUser', protect,getUserInfo);

// router.post("/upload-image", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }
//   const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//   res.status(200).json({ imageUrl });
// });

// module.exports = router;

const express = require("express");

// import all controller
const { 
    registerUser, 
    loginUser, 
    getUserInfo,
    sendOTP,
    verifyOTPController,
    resetPassword,
    logout,
    logoutAllDevices,
    getActiveSessions
} = require("../controllers/authController.js");

// import all middleware
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");

// all routes
const router = express.Router();

// Existing routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUser', protect, getUserInfo);

// New OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPController);
router.post('/reset-password', resetPassword);

// Session management routes (NEW)
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/active-sessions', protect, getActiveSessions);

// Image upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

module.exports = router;