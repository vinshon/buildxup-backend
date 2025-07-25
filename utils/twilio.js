const logger = require('./logger');
const emailService = require('./email');
require('dotenv').config();
const twilio = require('twilio');

// Load environment variables
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
  if (!twilioClient) {
    logger.info(`[SIMULATED] OTP ${otpCode} would be sent to ${phoneNumber}`);
    return {
      success: true,
      message: 'OTP sent successfully (simulated)',
      simulated: true
    };
  }

  try {
    const message = await twilioClient.messages.create({
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