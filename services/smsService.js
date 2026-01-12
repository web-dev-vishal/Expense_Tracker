const twilio = require('twilio');

// Create Twilio client
const createTwilioClient = () => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio credentials not found in environment variables');
    }
    
    return twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp, fullName) => {
    try {
        // Validate phone number format
        if (!phone) {
            console.warn('⚠️ No phone number provided');
            return { success: false, error: 'No phone number provided' };
        }

        if (!phone.startsWith('+')) {
            console.warn('⚠️ Phone number must start with + (E.164 format)');
            console.warn('   Current:', phone);
            console.warn('   Should be: +' + phone);
            return { success: false, error: 'Invalid phone number format. Must start with +' };
        }

        console.log('📱 Attempting to send SMS...');
        console.log('   From:', process.env.TWILIO_PHONE_NUMBER);
        console.log('   To:', phone);
        console.log('   OTP:', otp);

        const client = createTwilioClient();

        const messageBody = `Hi ${fullName},\n\nYour Expense Tracker OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nDo not share this code with anyone.\n\n- Expense Tracker Team`;

        const message = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        console.log('✅ SMS sent successfully via Twilio');
        console.log('📱 To:', phone);
        console.log('📄 SID:', message.sid);
        console.log('📊 Status:', message.status);
        console.log('💰 Price:', message.price, message.priceUnit);
        
        return { 
            success: true, 
            sid: message.sid,
            status: message.status,
            to: phone
        };
    } catch (error) {
        console.error('❌ Error sending SMS via Twilio');
        console.error('   Error Message:', error.message);
        console.error('   Error Code:', error.code);
        console.error('   Status:', error.status);
        console.error('   More Info:', error.moreInfo);
        
        // Specific error handling with solutions
        if (error.code === 21211) {
            console.error('\n🔴 UNVERIFIED PHONE NUMBER');
            console.error('   Phone:', phone);
            console.error('   Solution: Verify this number in Twilio Console');
            console.error('   URL: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.error('   Steps:');
            console.error('   1. Click "Add a new Caller ID"');
            console.error('   2. Enter: ' + phone);
            console.error('   3. Verify with SMS code\n');
            
            return { 
                success: false, 
                error: 'Phone number not verified in Twilio trial account',
                code: error.code,
                solution: 'Verify phone at https://console.twilio.com/us1/develop/phone-numbers/manage/verified'
            };
        } else if (error.code === 21408) {
            console.error('\n🔴 PERMISSION DENIED');
            console.error('   Your Twilio account may need verification or upgrade');
            
            return { 
                success: false, 
                error: 'Permission denied - check Twilio account status',
                code: error.code
            };
        } else if (error.code === 20003) {
            console.error('\n🔴 AUTHENTICATION ERROR');
            console.error('   Check your Twilio credentials in .env file');
            console.error('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...');
            console.error('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '(set)' : '(missing)');
            console.error('   TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
            
            return { 
                success: false, 
                error: 'Invalid Twilio credentials',
                code: error.code
            };
        } else if (error.code === 21606) {
            console.error('\n🔴 INVALID PHONE NUMBER FORMAT');
            console.error('   Phone provided:', phone);
            console.error('   Must be in E.164 format: +[country code][number]');
            console.error('   Example: +919321981267');
            
            return { 
                success: false, 
                error: 'Invalid phone number format',
                code: error.code
            };
        } else if (error.code === 21614) {
            console.error('\n🔴 INVALID FROM NUMBER');
            console.error('   Your Twilio phone number may be invalid');
            console.error('   Current:', process.env.TWILIO_PHONE_NUMBER);
            
            return { 
                success: false, 
                error: 'Invalid Twilio phone number',
                code: error.code
            };
        }
        
        return { 
            success: false, 
            error: error.message,
            code: error.code,
            details: error.moreInfo
        };
    }
};

module.exports = { sendOTPSMS };