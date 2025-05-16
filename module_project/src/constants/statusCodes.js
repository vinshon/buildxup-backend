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

const ERROR_MESSAGES = {
  // Project Related Errors
  PROJECT_NOT_FOUND: 'Project not found',
  INVALID_PROJECT_DATA: 'Invalid project data provided',
  PROJECT_CREATION_FAILED: 'Failed to create project',
  PROJECT_UPDATE_FAILED: 'Failed to update project',
  PROJECT_DELETE_FAILED: 'Failed to delete project',

  // Company Related Errors
  COMPANY_NOT_FOUND: 'Company not found',
  INVALID_COMPANY_DATA: 'Invalid company data provided',
  COMPANY_CREATION_FAILED: 'Failed to create company',
  COMPANY_UPDATE_FAILED: 'Failed to update company',
  COMPANY_DELETE_FAILED: 'Failed to delete company',
  UNAUTHORIZED_COMPANY_ACCESS: 'Unauthorized access to company',

  // System Errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed'
};

const SUCCESS_MESSAGES = {
  // Project Related Success Messages
  PROJECT_CREATED: 'Project created successfully',
  PROJECTS_RETRIEVED: 'Projects retrieved successfully',
  PROJECT_RETRIEVED: 'Project retrieved successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',

  // Company Related Success Messages
  COMPANY_CREATED: 'Company created successfully',
  COMPANY_RETRIEVED: 'Company retrieved successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  COMPANY_DELETED: 'Company deleted successfully'
};

module.exports = {
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 