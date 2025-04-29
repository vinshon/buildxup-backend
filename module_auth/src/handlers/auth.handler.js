const { signup, verifyOTP, verifyLogin } = require('../controllers/auth.controller');
const { validateSignup, validateOTP, validateLogin } = require('../schemas/auth.schema');
const logger = require('../../../utils/logger');

exports.signupHandler = async (req, res) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { name, phone, password, email } = req.body;
    const result = await signup({ name, phone, password, email });
    res.status(201).json(result);
  } catch (error) {
    logger.error('Signup handler error:', error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists',
        error: 'A user with this phone number or email already exists'
      });
    }

    // Handle other errors
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: error.message || 'Internal server error'
    });
  }
};

exports.verifyOTPHandler = async (req, res) => {
  try {
    const { error } = validateOTP(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { phone, email, otp } = req.body;
    const result = await verifyOTP({ phone, email, otp });
    res.status(200).json(result);
  } catch (error) {
    logger.error('OTP verification handler error:', error);
    res.status(400).json({
      status: 'error',
      message: 'OTP verification failed',
      error: error.message || 'Invalid OTP'
    });
  }
};

exports.verifyLoginHandler = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { phone, email } = req.body;
    const result = await verifyLogin({ phone, email });
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login handler error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Login failed',
      error: error.message || 'Invalid credentials'
    });
  }
};