const logger = require('./logger');
const emailService = require('./email');
require('dotenv').config();
const twilio = require('twilio');

// Lazy initialization of Twilio client
let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) {
    return twilioClient;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Check if Twilio credentials are properly configured
  if (!accountSid || !authToken) {
    logger.warn('Twilio credentials not configured. SMS OTP will be simulated.');
    return null;
  }

  // Validate Account SID format
  if (!accountSid.startsWith('AC')) {
    logger.error('Invalid Twilio Account SID format. Must start with "AC"');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    logger.info('Twilio client initialized successfully');
    return twilioClient;
  } catch (error) {
    logger.error('Failed to initialize Twilio client:', error);
    return null;
  }
}

// Function to send Email OTP
async function sendEmailOTP(email, otpCode) {
  try {
    const result = await emailService.sendOTPEmail(email, otpCode);
    logger.info(`Email OTP sent successfully to ${email}`);
    return result;
  } catch (error) {
    logger.error('Failed to send email OTP:', error);
    return false;
  }
}

// Function to send SMS OTP
async function sendSMSOTP(phoneNumber, otpCode) {
  const client = getTwilioClient();
  
  if (!client) {
    logger.info(`[SIMULATED] OTP ${otpCode} would be sent to ${phoneNumber}`);
    return {
      success: true,
      message: 'OTP sent successfully (simulated)',
      simulated: true
    };
  }

  try {
    const message = await client.messages.create({
      body: `Your BuildXUp OTP is ${otpCode}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`SMS OTP sent successfully to ${phoneNumber}`, {
      messageId: message.sid,
      status: message.status
    });
    return true;
  } catch (error) {
    logger.error('Failed to send SMS OTP:', error);
    return false;
  }
}

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
};