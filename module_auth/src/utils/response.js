const { STATUS_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants/statusCodes');

const createResponse = (status_code, success, message, data = null) => {
  const response = {
    status_code,
    success,
    message
  };

  if (data) {
    response.data = data;
  }

  return response;
};

const successResponse = (message, data = null, status_code = STATUS_CODES.OK) => {
  return createResponse(status_code, true, message, data);
};

const errorResponse = (message, status_code = STATUS_CODES.BAD_REQUEST) => {
  return createResponse(status_code, false, message);
};

/**
 * Predefined response helpers
 */
const responses = {
  // Success Responses
  userCreated: (data = null) => successResponse(SUCCESS_MESSAGES.USER_CREATED, data, STATUS_CODES.CREATED),
  loginSuccessful: (data = null) => successResponse(SUCCESS_MESSAGES.LOGIN_SUCCESSFUL, data),
  otpSent: () => successResponse(SUCCESS_MESSAGES.OTP_SENT),
  otpVerified: () => successResponse(SUCCESS_MESSAGES.OTP_VERIFIED),

  // Error Responses
  invalidCredentials: () => errorResponse(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED),
  unauthorizedAccess: () => errorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, STATUS_CODES.UNAUTHORIZED),
  accountNotVerified: () => errorResponse(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, STATUS_CODES.FORBIDDEN),
  invalidOTP: () => errorResponse(ERROR_MESSAGES.INVALID_OTP, STATUS_CODES.BAD_REQUEST),
  otpExpired: () => errorResponse(ERROR_MESSAGES.OTP_EXPIRED, STATUS_CODES.BAD_REQUEST),
  otpSendFailed: () => errorResponse(ERROR_MESSAGES.OTP_SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR),
  userNotFound: () => errorResponse(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND),
  userAlreadyExists: () => errorResponse(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT),
  unverifiedUser: () => errorResponse(ERROR_MESSAGES.UNVERIFIED_USER, STATUS_CODES.FORBIDDEN),
  invalidInput: () => errorResponse(ERROR_MESSAGES.INVALID_INPUT, STATUS_CODES.UNPROCESSABLE_ENTITY),
  internalError: () => errorResponse(ERROR_MESSAGES.INTERNAL_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR)
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  responses,
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 