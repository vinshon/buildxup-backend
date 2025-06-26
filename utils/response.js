const { STATUS_CODES } = require('./constants');

// Create response object
const createResponse = (status, message, data = null, status_code = 200) => ({
  status_code,
  status,
  message,
  data
});

// Success response
const successResponse = (message, data = null, status_code = STATUS_CODES.OK) =>
  createResponse(true, message, data, status_code);

// Error response (now supports details)
const errorResponse = (message, status_code = STATUS_CODES.INTERNAL_SERVER_ERROR, details = null) => {
  const response = {
    status_code,
    status: false,
    message
  };
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  return response;
};

// Predefined response helpers
const responses = {
  // Auth Responses
  userCreated: (data = null) => successResponse('User created successfully', data, STATUS_CODES.CREATED),
  loginSuccessful: (data = null) => successResponse('Login successful', data, STATUS_CODES.OK),
  otpSent: () => successResponse('OTP sent successfully', null, STATUS_CODES.OK),
  otpVerified: () => successResponse('OTP verified successfully', null, STATUS_CODES.OK),
  invalidCredentials: (details = null) => errorResponse('Invalid credentials provided', STATUS_CODES.UNAUTHORIZED, details),
  unauthorizedAccess: (details = null) => errorResponse('Unauthorized access', STATUS_CODES.UNAUTHORIZED, details),
  accountNotVerified: (details = null) => errorResponse('Account not verified', STATUS_CODES.FORBIDDEN, details),
  invalidOTP: (details = null) => errorResponse('Invalid OTP provided', STATUS_CODES.BAD_REQUEST, details),
  otpExpired: (details = null) => errorResponse('OTP has expired', STATUS_CODES.BAD_REQUEST, details),
  otpSendFailed: (details = null) => errorResponse('Failed to send OTP', STATUS_CODES.INTERNAL_SERVER_ERROR, details),
  userNotFound: (details = null) => errorResponse('User not found', STATUS_CODES.NOT_FOUND, details),
  userAlreadyExists: (details = null) => errorResponse('User already exists', STATUS_CODES.CONFLICT, details),
  unverifiedUser: (details = null) => errorResponse('Unverified user', STATUS_CODES.FORBIDDEN, details),
  invalidInput: (details = null) => errorResponse('Invalid input provided', STATUS_CODES.UNPROCESSABLE_ENTITY, details),
  internalError: (message = 'Internal server error', details = null) => errorResponse(message, STATUS_CODES.INTERNAL_SERVER_ERROR, details),

    // Generic
  created: (message, data = null) => successResponse(message, data, STATUS_CODES.CREATED),
  retrieved: (message, data = null) => successResponse(message, data),
  updated: (message, data = null) => successResponse(message, data),
  deleted: (message) => successResponse(message),

  // Error Responses
  notFound: (message, details = null) => errorResponse(message, STATUS_CODES.NOT_FOUND, details),
  badRequest: (message, details = null) => errorResponse(message, STATUS_CODES.BAD_REQUEST, details),
  unauthorized: (message, details = null) => errorResponse(message, STATUS_CODES.UNAUTHORIZED, details),
  forbidden: (message, details = null) => errorResponse(message, STATUS_CODES.FORBIDDEN, details),
  conflict: (message, details = null) => errorResponse(message, STATUS_CODES.CONFLICT, details),
  validationError: (message, details = null) => errorResponse(message, STATUS_CODES.UNPROCESSABLE_ENTITY, details),

  projectNotFound: (details = null) => errorResponse('Project not found', STATUS_CODES.NOT_FOUND, details),
  companyNotFound: (details = null) => errorResponse('Company not found', STATUS_CODES.NOT_FOUND, details),
  taskNotFound: (details = null) => errorResponse('Task not found', STATUS_CODES.NOT_FOUND, details),
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  responses
}; 