const { signup, verifyOTP, verifyLogin, tempOTP } = require('../controllers/auth.controller');
const { validateSignup, validateOTP, validateLogin, validateTempOTP } = require('../schemas/auth.schema');
const logger = require('../../../utils/logger');
const emailService = require('../../../utils/email');

exports.tempOTPHandler = async (req, res) => {
  try {
    const { error } = validateTempOTP(req.body);
    if (error) {
      return res.status(400).json({
        status_code: 400,
        status: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { email, phone } = req.body;
    const result = await tempOTP({ email, phone });
    if (result.status_code === 200) {
      res.status(200).json(result);
    } else {
      res.status(result.status_code).json(result);
    }
  } catch (error) {
    logger.error('Temp OTP handler error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate temp OTP',
      error: error.message || 'Internal server error'
    });
  }
};

exports.signupHandler = async (req, res) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        status_code: 400,
        status: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    let { first_name, last_name, phone, password, email, company_name, company_description } = req.body;
    if (!company_name || company_name.trim() === '') {
      company_name = `${first_name}${last_name ? ' ' + last_name : ''}`;
    }
    const result = await signup({ first_name, last_name, phone, password, email, company_name, company_description });
    if (result.status_code === 200) {
      res.status(200).json(result);
    } else {
      res.status(result.status_code).json(result);
    }
  } catch (error) {
    logger.error('Signup handler error:', error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        status_code: 409,
        status: false,
        message: 'User already exists',
        error: 'A user with this phone number or email already exists'
      });
    }

    // Handle other errors
    res.status(500).json({
      status_code: 500,
      status: false,
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
        status_code: 400,
        status: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { phone, email, otp } = req.body;
    const result = await verifyOTP({ phone, email, otp });
    if (result.status_code === 200) {
      res.status(200).json(result);
    } else {
      res.status(result.status_code).json(result);
    }
  } catch (error) {
    logger.error('OTP verification handler error:', error);
    res.status(400).json({
      status_code: 400,
      status: false,
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
        status_code: 400,
        status: false,
        message: 'Validation failed',
        error: error.details[0].message
      });
    }

    const { phone, email, password } = req.body;
    const result = await verifyLogin({ phone, email, password });
    if (result.status_code === 200) {
      res.status(200).json(result);
    } else {
      res.status(result.status_code).json(result);
    }
  } catch (error) {
    logger.error('Login handler error:', error);
    res.status(401).json({
      status_code: 401,
      status: false,
      message: 'Login failed',
      error: error.message || 'Invalid credentials'
    });
  }
};

async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    const otp = generateOTP(); // Your OTP generation logic
    
    await emailService.sendOTPEmail(email, otp);
    
    // Rest of your code...
  } catch (error) {
    logger.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}