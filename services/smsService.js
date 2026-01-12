const twilio = require('twilio');

// Create Twilio client
const createTwilioClient = () => {
    return twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp, fullName) => {
    try {
        const client = createTwilioClient();

        const message = await client.messages.create({
            body: `Hi ${fullName}, Your Expense Tracker OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        console.log('✅ SMS sent successfully:', message.sid);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPSMS };