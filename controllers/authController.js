const User = require('../models/User.js');
const jwt = require("jsonwebtoken");
const { generateOTP, storeOTP, verifyOTP } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const { sendOTPSMS } = require('../services/smsService');

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

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
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
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in user", error: err.message });
    }
};

// ============================================================= //

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

// ============= OTP FEATURES WITH EMAIL & SMS (AUTOMATIC) =============

// Send OTP via Email and SMS (Both Automatic)
// exports.sendOTP = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ message: "Email is required" });
//     }

//     try {
//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found with this email" });
//         }

//         // Generate OTP
//         const otp = generateOTP();

//         // Store OTP in Redis
//         const stored = await storeOTP(email, otp);
        
//         if (!stored) {
//             return res.status(500).json({ message: "Failed to generate OTP. Please try again" });
//         }

//         console.log('📧📱 Sending OTP via Email and SMS...');

//         // Send Email and SMS in parallel (both automatic)
//         const emailPromise = sendOTPEmail(email, otp, user.fullName);
//         const smsPromise = user.phone ? sendOTPSMS(user.phone, otp, user.fullName) : null;

//         // Wait for both to complete
//         const [emailResult, smsResult] = await Promise.all([
//             emailPromise,
//             smsPromise
//         ]);

//         // Check results
//         const emailSent = emailResult && emailResult.success;
//         const smsSent = smsResult && smsResult.success;

//         // Log results
//         console.log('📊 Delivery Status:');
//         console.log('   Email:', emailSent ? '✅ Sent' : '❌ Failed');
//         console.log('   SMS:', user.phone ? (smsSent ? '✅ Sent' : '❌ Failed') : '⚠️ No phone number');

//         // Prepare response
//         let responseMessage = '';
//         let deliveryDetails = {
//             email: {
//                 sent: emailSent,
//                 address: email
//             }
//         };

//         if (user.phone) {
//             deliveryDetails.sms = {
//                 sent: smsSent,
//                 phone: user.phone
//             };
//         }

//         // Determine response message
//         if (emailSent && smsSent) {
//             responseMessage = "OTP sent successfully to your email and phone";
//         } else if (emailSent && !user.phone) {
//             responseMessage = "OTP sent successfully to your email";
//         } else if (emailSent && user.phone && !smsSent) {
//             responseMessage = "OTP sent to your email. SMS delivery failed";
//         } else if (!emailSent && smsSent) {
//             responseMessage = "OTP sent to your phone. Email delivery failed";
//         } else {
//             return res.status(500).json({ 
//                 message: "Failed to send OTP via email and SMS",
//                 details: deliveryDetails,
//                 emailError: emailResult ? emailResult.error : 'Unknown error',
//                 smsError: smsResult ? smsResult.error : 'Unknown error'
//             });
//         }

//         res.status(200).json({
//             message: responseMessage,
//             delivery: deliveryDetails
//         });

//     } catch (error) {
//         console.error('❌ Error in sendOTP:', error.message);
//         res.status(500).json({ message: "Error sending OTP", error: error.message });
//     }
// };

// ================================================================== //

// Send OTP via Email and SMS (Both Automatic)
// exports.sendOTP = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ message: "Email is required" });
//     }

//     try {
//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found with this email" });
//         }

//         // Generate OTP
//         const otp = generateOTP();

//         // Store OTP in Redis
//         const stored = await storeOTP(email, otp);
        
//         if (!stored) {
//             return res.status(500).json({ message: "Failed to generate OTP. Please try again" });
//         }

//         console.log('📧📱 Sending OTP via Email and SMS...');
//         console.log('   User:', user.fullName);
//         console.log('   Email:', email);
//         console.log('   Phone:', user.phone || 'Not provided');
//         console.log('   OTP:', otp);

//         // Send Email and SMS in parallel (both automatic)
//         const emailPromise = sendOTPEmail(email, otp, user.fullName);
//         const smsPromise = user.phone ? sendOTPSMS(user.phone, otp, user.fullName) : null;

//         // Wait for both to complete
//         const [emailResult, smsResult] = await Promise.all([
//             emailPromise,
//             smsPromise
//         ]);

//         // Check results
//         const emailSent = emailResult && emailResult.success;
//         const smsSent = smsResult && smsResult.success;

//         // Log results
//         console.log('\n📊 Delivery Status:');
//         console.log('   Email:', emailSent ? '✅ Sent' : '❌ Failed');
//         if (emailResult && !emailResult.success) {
//             console.log('   Email Error:', emailResult.error);
//         }
//         console.log('   SMS:', user.phone ? (smsSent ? '✅ Sent' : '❌ Failed') : '⚠️ No phone number');
//         if (smsResult && !smsResult.success) {
//             console.log('   SMS Error:', smsResult.error);
//             if (smsResult.solution) {
//                 console.log('   SMS Solution:', smsResult.solution);
//             }
//         }

//         // Prepare response
//         let responseMessage = '';
//         let deliveryDetails = {
//             email: {
//                 sent: emailSent,
//                 address: email
//             }
//         };

//         if (user.phone) {
//             deliveryDetails.sms = {
//                 sent: smsSent,
//                 phone: user.phone
//             };
            
//             // Add error details if SMS failed
//             if (!smsSent && smsResult) {
//                 deliveryDetails.sms.error = smsResult.error;
//                 deliveryDetails.sms.errorCode = smsResult.code;
//                 if (smsResult.solution) {
//                     deliveryDetails.sms.solution = smsResult.solution;
//                 }
//             }
//         }

//         // Determine response message
//         if (emailSent && smsSent) {
//             responseMessage = "OTP sent successfully to your email and phone";
//         } else if (emailSent && !user.phone) {
//             responseMessage = "OTP sent successfully to your email";
//         } else if (emailSent && user.phone && !smsSent) {
//             responseMessage = "OTP sent to your email. SMS delivery failed - check solution in response";
//         } else if (!emailSent && smsSent) {
//             responseMessage = "OTP sent to your phone. Email delivery failed";
//         } else {
//             return res.status(500).json({ 
//                 message: "Failed to send OTP via email and SMS",
//                 delivery: deliveryDetails
//             });
//         }

//         res.status(200).json({
//             message: responseMessage,
//             delivery: deliveryDetails
//         });

//     } catch (error) {
//         console.error('❌ Error in sendOTP:', error.message);
//         res.status(500).json({ message: "Error sending OTP", error: error.message });
//     }
// };

exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email) {
        return res.status(400).json({ 
            success: false,
            message: "Email is required" 
        });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found with this email" 
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in Redis
        const stored = await storeOTP(email, otp);
        
        if (!stored) {
            return res.status(500).json({ 
                success: false,
                message: "Failed to generate OTP. Please try again" 
            });
        }

        console.log('📧 Sending OTP via Email...');
        console.log('   User:', user.fullName);
        console.log('   Email:', email);
        console.log('   OTP:', otp);

        // Send Email
        const emailResult = await sendOTPEmail(email, otp, user.fullName);
        
        if (!emailResult || !emailResult.success) {
            console.error('❌ Email sending failed:', emailResult?.error);
            return res.status(500).json({ 
                success: false,
                message: "Failed to send OTP via email. Please try again.",
                error: emailResult?.error
            });
        }

        console.log('✅ OTP sent successfully to:', email);

        // Success response
        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email",
            email: email
        });

    } catch (error) {
        console.error('❌ Error in sendOTP:', error.message);
        res.status(500).json({ 
            success: false,
            message: "Error sending OTP", 
            error: error.message 
        });
    }
};

// ================================================================= //

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

// ========================================================== //

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

        res.status(200).json({
            message: "Password reset successfully. You can now login with your new password"
        });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};