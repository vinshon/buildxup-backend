/**
 * Standard HTTP Status Codes
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
 * Standard Error Messages
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

  // Project Related Errors
  PROJECT_NOT_FOUND: 'Project not found',
  INVALID_PROJECT_DATA: 'Invalid project data provided',
  PROJECT_CREATION_FAILED: 'Failed to create project',
  PROJECT_UPDATE_FAILED: 'Failed to update project',
  PROJECT_DELETE_FAILED: 'Failed to delete project',
  UNAUTHORIZED_PROJECT_ACCESS: 'Unauthorized access to project',

  // Task Related Errors
  TASK_NOT_FOUND: 'Task not found',
  INVALID_TASK_DATA: 'Invalid task data provided',
  TASK_CREATION_FAILED: 'Failed to create task',
  TASK_UPDATE_FAILED: 'Failed to update task',
  TASK_DELETE_FAILED: 'Failed to delete task',
  UNAUTHORIZED_TASK_ACCESS: 'Unauthorized access to task',

  // Validation Errors
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELDS: 'Required fields are missing',
  INVALID_FORMAT: 'Invalid format provided',

  // System Errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'A record with this data already exists',
  INVALID_REFERENCE: 'The referenced record does not exist'
};

/**
 * Standard Success Messages
 */
const SUCCESS_MESSAGES = {
  // Auth Related Success Messages
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',

  // Project Related Success Messages
  PROJECT_CREATED: 'Project created successfully',
  PROJECTS_RETRIEVED: 'Projects retrieved successfully',
  PROJECT_RETRIEVED: 'Project retrieved successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',

  // Task Related Success Messages
  TASK_CREATED: 'Task created successfully',
  TASKS_RETRIEVED: 'Tasks retrieved successfully',
  TASK_RETRIEVED: 'Task retrieved successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',

  // Generic Success Messages
  OPERATION_SUCCESSFUL: 'Operation completed successfully'
};

module.exports = {
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 