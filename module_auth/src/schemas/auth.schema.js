const Joi = require('joi');

const signupSchema = Joi.object({
  first_name: Joi.string().required().min(2).max(50),
  last_name: Joi.string().min(2).max(50).allow(null, ''),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null, ''),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(20),
  company_name: Joi.string().min(2).max(100).allow(null, ''),
  company_description: Joi.string().allow(null, '')
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  otp: Joi.string().required().length(6)
}).or('phone', 'email').messages({
  'object.missing': 'Either phone or email is required'
});

const tempOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null, ''),
  email: Joi.string().email().allow(null, ''),
}).or('phone', 'email').messages({
  'object.missing': 'Either phone or email is required'
});

const loginSchema = Joi.object({
  password: Joi.string().required().min(6).max(20),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null, ''),
  email: Joi.string().email().allow(null, '')
}).or('phone', 'email').messages({
  'object.missing': 'Either phone or email is required'
});

module.exports = {
  validateSignup: (data) => signupSchema.validate(data),
  validateOTP: (data) => verifyOTPSchema.validate(data),
  validateLogin: (data) => loginSchema.validate(data),
  validateTempOTP: (data) => tempOTPSchema.validate(data),
}; 