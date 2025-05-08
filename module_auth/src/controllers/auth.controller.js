const prisma = require('../../../config/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../../../utils/jwt');
const { sendSMSOTP, sendEmailOTP } = require('../../../utils/twilio');
const { responses } = require('../utils/response');
// const logger = require('../../../utils/logger');

async function tempOTP({ email, phone }) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: phone ? { phone } : { email }
    });

    if (existingUser) {
      return responses.userAlreadyExists();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpResult = email ?
      await sendEmailOTP(email, otp) :
      await sendSMSOTP(phone, otp);

    if (!otpResult) {
      return responses.otpSendFailed();
    }

    await prisma.temp_otp.upsert({
      where: {
        email: email || undefined,
        phone: phone || undefined
      },
      update: {
        otp,
        is_verified: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      create: { email, phone, otp }
    });

    return responses.otpSent();
  } catch (error) {
    throw error;
  }
}

async function signup({ first_name, last_name, phone, password, email = null }) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: phone ? { phone } : { email }
    });

    if (existingUser) {
      return responses.userAlreadyExists();
    }

    // Check if OTP is verified
    const verifiedOTP = await prisma.temp_otp.findFirst({
      where: {
        OR: [
          { phone, is_verified: true },
          { email, is_verified: true }
        ]
      }
    });

    if (!verifiedOTP) {
      return responses.unverifiedUser();
    }

    const token = generateToken({ first_name, last_name, phone, email });
    const refresh_token = generateRefreshToken({ first_name, last_name, phone, email });

    // Create new user
    const userData = {
      first_name,
      last_name,
      phone,
      email,
      password: await bcrypt.hash(password, 10),
      verify_otp: true,
      is_active: true,
      role: 'user',
      token,
      refresh_token,
      is_email_verified: !!verifiedOTP.email,
      is_phone_verified: !!verifiedOTP.phone,
    };

    const newUser = await prisma.user.create({ data: userData });

    // Delete temp OTP record
    await prisma.temp_otp.delete({
      where: {
        email: verifiedOTP.email || undefined,
        phone: verifiedOTP.phone || undefined
      },
    });

    return responses.userCreated({
      user_id: newUser.id,
      token,
      refresh_token
    });
  } catch (error) {
    // logger.error('Signup failed:', error);
    throw error;
  }
}

async function verifyOTP({ phone, email, otp }) {
  try {
    const user = await prisma.temp_otp.findUnique({
      where: email ? { email } : { phone }
    });

    if (!user || user.otp !== otp) {
      return responses.invalidOTP();
    }

    await prisma.temp_otp.update({
      where: { email: user.email },
      data: { is_verified: true }
    });

    return responses.otpVerified();
  } catch (error) {
    // logger.error('OTP verification failed:', error);
    throw error;
  }
}

async function verifyLogin({ phone, email, password }) {
  try {
    const where = phone ? { phone } : { email };
    where.verify_otp = true;

    const user = await prisma.user.findUnique({ where });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return responses.invalidCredentials();
    }

    if (!user.is_active) {
      return responses.accountNotVerified();
    }

    return responses.loginSuccessful({ user_id: user.id, token: user.token, refresh_token: user.refresh_token });
  } catch (error) {
    throw error;
  }
}

module.exports = { signup, verifyOTP, verifyLogin, tempOTP };