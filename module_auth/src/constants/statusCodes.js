/**
 * Standard HTTP Status Codes and Messages for the application
 */
const STATUS_CODES = {
  // Success Codes
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Error Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error Codes
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Standard error messages for common scenarios
 */
const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  ACCOUNT_NOT_VERIFIED: 'Account not verified',
  INVALID_OTP: 'Invalid OTP provided',
  OTP_EXPIRED: 'OTP has expired',
  OTP_SEND_FAILED: 'Failed to send OTP',

  // User Related Errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_USER_DATA: 'Invalid user data provided',
  UNVERIFIED_USER: 'Unverified user',

  // Validation Errors
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELDS: 'Required fields are missing',
  INVALID_FORMAT: 'Invalid format provided',

  // System Errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed'
};

/**
 * Standard success messages
 */
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  OPERATION_SUCCESSFUL: 'Operation completed successfully'
};

module.exports = {
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 