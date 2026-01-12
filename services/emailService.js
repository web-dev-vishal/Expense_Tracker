const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, fullName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP for Password Reset',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; color: #4CAF50; }
                        .otp-box { background-color: #4CAF50; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
                        .content { color: #333; line-height: 1.6; }
                        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
                        .warning { color: #ff5722; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="header">🔐 Password Reset OTP</h1>
                        <div class="content">
                            <p>Hello <strong>${fullName}</strong>,</p>
                            <p>You requested to reset your password for your Expense Tracker account.</p>
                            <p>Your One-Time Password (OTP) is:</p>
                            <div class="otp-box">${otp}</div>
                            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                            <p class="warning">⚠️ Do not share this OTP with anyone!</p>
                            <p>If you did not request this, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Expense Tracker. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail };