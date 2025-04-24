const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sendOTP = (to, otp) => client.messages.create({ body: `Your OTP is ${otp}`, from: process.env.TWILIO_PHONE_NUMBER, to });
module.exports = { sendOTP };