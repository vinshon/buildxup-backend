const logger = require('./logger');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Load environment variables
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Replace with your real credentials
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use 'smtp.mailtrap.io', etc.
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_EMAIL_PASSWORD, // Use App Password if using Gmail
  },
});

// Function to send Email OTP
async function sendEmailOTP(email, otpCode) {
  try {
    // const msg = {
    //   to: email,
    //   from: process.env.FROM_EMAIL, // your verified SendGrid sender email
    //   subject: 'Your OTP Code',
    //   text: `Your OTP is: ${otpCode}`,
    // };
    // await sgMail.send(msg);

    const msg = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otpCode}`,
      html: `<p>Your OTP code is: <strong>${otpCode}</strong></p>`,
    };
    const info = await transporter.sendMail(msg);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('Failed to send OTP:', error);
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
      body: `Your OTP is ${otpCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`OTP sent successfully to ${phoneNumber}`);
    return true;
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return false;
  }
}

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
};