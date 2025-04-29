const logger = require('./logger');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Load environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send Email OTP
async function sendEmailOTP(email, otpCode) {
  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // your verified SendGrid sender email
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otpCode}`,
    };
    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
    return {
      success: true,
      message: 'OTP sent successfully',
      messageId: message.sid
    };
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

// Function to send SMS OTP
async function sendSMSOTP(phoneNumber, otpCode) {
  if (!twilioClient) {
    logger.info(`[SIMULATED] OTP ${otp} would be sent to ${to}`);
    return {
      success: true,
      message: 'OTP sent successfully (simulated)',
      simulated: true
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    logger.info(`OTP sent successfully to ${to}`);
    return {
      success: true,
      message: 'OTP sent successfully',
      messageId: message.sid
    };
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
};