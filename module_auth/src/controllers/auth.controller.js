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

async function signup({ first_name, last_name, phone, password, email = null, company_name, company_description = null }) {
  try {
    // Validate JWT secret first
    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      return {
        status_code: 500,
        status: false,
        message: 'Authentication configuration error',
        error: 'JWT secret is not properly configured'
      };
    }

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

    // Generate tokens first to ensure JWT secret is available
    let token, refresh_token;
    try {
      // Test token generation with temporary data
      token = generateToken({ 
        first_name, 
        last_name, 
        phone, 
        email,
        user_id: 'temp',
        company_id: 'temp',
        role: 'admin'
      });
      refresh_token = generateRefreshToken({ 
        first_name, 
        last_name, 
        phone, 
        email,
        user_id: 'temp',
        company_id: 'temp',
        role: 'admin'
      });
    } catch (error) {
      console.error('Error generating tokens:', error);
      return {
        status_code: 500,
        status: false,
        message: 'Failed to generate authentication tokens',
        error: 'JWT secret is not properly configured'
      };
    }

    // Only proceed with user creation if token generation was successful
    const result = await prisma.$transaction(async (prisma) => {
      // Create company first
      const company = await prisma.company.create({
        data: {
          name: company_name,
          description: company_description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create user with company relationship
      const userData = {
        first_name,
        last_name: last_name || '',
        phone: phone || '',
        email,
        password: await bcrypt.hash(password, 10),
        verify_otp: true,
        is_active: true,
        role: 'admin',
        is_email_verified: !!verifiedOTP.email,
        is_phone_verified: !!verifiedOTP.phone,
        companies: {
          create: {
            company_id: company.id
          }
        }
      };

      const newUser = await prisma.user.create({
        data: userData,
        include: {
          companies: {
            include: {
              company: true
            }
          }
        }
      });

      return { user: newUser, company };
    });

    // Generate final tokens with actual IDs
    try {
      token = generateToken({ 
        first_name, 
        last_name, 
        phone, 
        email,
        user_id: result.user.id,
        company_id: result.company.id,
        role: 'admin'
      });
      refresh_token = generateRefreshToken({ 
        first_name, 
        last_name, 
        phone, 
        email,
        user_id: result.user.id,
        company_id: result.company.id,
        role: 'admin'
      });
    } catch (error) {
      console.error('Error generating final tokens:', error);
      // Rollback the transaction by deleting the created user and company
      await prisma.$transaction([
        prisma.user.delete({ where: { id: result.user.id } }),
        prisma.company.delete({ where: { id: result.company.id } })
      ]);
      return {
        status_code: 500,
        status: false,
        message: 'Failed to generate authentication tokens',
        error: 'JWT secret is not properly configured'
      };
    }

    // Update user with tokens
    await prisma.user.update({
      where: { id: result.user.id },
      data: { token, refresh_token }
    });

    // Delete temp OTP record
    await prisma.temp_otp.delete({
      where: {
        email: verifiedOTP.email || undefined,
        phone: verifiedOTP.phone || undefined
      },
    });

    return responses.userCreated({
      user_id: result.user.id,
      company_id: result.company.id,
      token,
      refresh_token,
      role: 'admin'
    });
  } catch (error) {
    console.error('Signup failed:', error);
    return {
      status_code: 500,
      status: false,
      message: 'Failed to create user',
      error: error.message || 'Internal server error'
    };
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

    // Get user's company and role
    const userCompany = await prisma.user_company.findFirst({
      where: { user_id: user.id },
      include: { company: true }
    });

    if (!userCompany) {
      return responses.unauthorizedAccess();
    }

    const token = generateToken({ 
      first_name: user.first_name, 
      last_name: user.last_name, 
      phone: user.phone, 
      email: user.email,
      user_id: user.id,
      company_id: userCompany.company_id,
      role: userCompany.role
    });
    const refresh_token = generateRefreshToken({ 
      first_name: user.first_name, 
      last_name: user.last_name, 
      phone: user.phone, 
      email: user.email,
      user_id: user.id,
      company_id: userCompany.company_id,
      role: userCompany.role
    });

    // Update user's tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { token, refresh_token }
    });

    return responses.loginSuccessful({ 
      user_id: user.id, 
      company_id: userCompany.company_id,
      role: userCompany.role,
      token, 
      refresh_token 
    });
  } catch (error) {
    throw error;
  }
}

module.exports = { signup, verifyOTP, verifyLogin, tempOTP };