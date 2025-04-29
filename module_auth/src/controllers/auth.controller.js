const prisma = require('../../../config/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../../../utils/jwt');
const { sendSMSOTP, sendEmailOTP } = require('../../../utils/twilio');
// const logger = require('../../../utils/logger');

async function signup({ name, phone, password, email = null }) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        verify_otp: otp,
        is_active: true,
        role: 'user'
      }
    });

    let otpResult;
    if (user?.phone) {
      otpResult = await sendSMSOTP(user.phone, otp);
    } else if (user?.email) {
      otpResult = await sendEmailOTP(user.email, otp);
    }

    if (!otpResult.success) {
      // logger.warn(`OTP sending failed for user ${user.id}: ${otpResult.message}`);
      return {
        message: 'User created but OTP could not be sent. Please contact support.',
        userId: user.id
      };
    }

    return {
      message: 'OTP sent to you successfully',
      userId: user.id
    };
  } catch (error) {
    // logger.error('Signup failed:', error);
    throw error;
  }
}

async function verifyOTP({ phone, email, otp }) {
  try {
    let user;

    if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user || user.verify_otp !== otp) {
      throw new Error('Invalid OTP');
    }

    let token = generateToken({ userId: user.id });
    let refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        token,
        refresh_token: refreshToken,
        verify_otp: null,
        is_active: true
      }
    });

    return {
      message: 'Verification successful',
      userId: user.id,
      token,
      refreshToken
    };
  } catch (error) {
    // logger.error('OTP verification failed:', error);
    throw error;
  }
}

async function verifyLogin({ phone, email }) {
  try {
    let user;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('Account not verified');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verify_otp: otp,
      }
    });
    let otpResult;
    if (user?.phone) {
      otpResult = await sendSMSOTP(user.phone, otp);
    } else if (user?.email) {
      otpResult = await sendEmailOTP(user.email, otp);
    }
    if (!otpResult.success) {
      // logger.warn(`OTP sending failed for user ${user.id}: ${otpResult.message}`);
      return {
        message: 'User created but OTP could not be sent. Please contact support.',
        userId: user.id
      };
    }
    return {
      message: 'OTP sent to you successfully',
      userId: user.id,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = { signup, verifyOTP, verifyLogin };