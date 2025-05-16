const { STATUS_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants/statusCodes');

const createResponse = (status_code, status, message, data = null) => ({
  status_code,
  status,
  message,
  data
});

const successResponse = (message, data = null, status_code = STATUS_CODES.OK) => {
  return createResponse(status_code, true, message, data);
};

const errorResponse = (message, status_code = STATUS_CODES.BAD_REQUEST) => {
  return createResponse(status_code, false, message);
};

const responses = {
  // Success Responses
  projectCreated: (data = null) => successResponse(SUCCESS_MESSAGES.PROJECT_CREATED, data, STATUS_CODES.CREATED),
  projectsRetrieved: (data = null) => successResponse(SUCCESS_MESSAGES.PROJECTS_RETRIEVED, data),
  projectRetrieved: (data = null) => successResponse(SUCCESS_MESSAGES.PROJECT_RETRIEVED, data),
  projectUpdated: (data = null) => successResponse(SUCCESS_MESSAGES.PROJECT_UPDATED, data),
  projectDeleted: (data = null) => successResponse(SUCCESS_MESSAGES.PROJECT_DELETED, data),

  // Error Responses
  projectNotFound: () => errorResponse(ERROR_MESSAGES.PROJECT_NOT_FOUND, STATUS_CODES.NOT_FOUND),
  companyNotFound: () => errorResponse(ERROR_MESSAGES.COMPANY_NOT_FOUND, STATUS_CODES.NOT_FOUND),
  invalidProjectData: () => errorResponse(ERROR_MESSAGES.INVALID_PROJECT_DATA, STATUS_CODES.BAD_REQUEST),
  projectCreationFailed: () => errorResponse(ERROR_MESSAGES.PROJECT_CREATION_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR),
  projectUpdateFailed: () => errorResponse(ERROR_MESSAGES.PROJECT_UPDATE_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR),
  projectDeleteFailed: () => errorResponse(ERROR_MESSAGES.PROJECT_DELETE_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR),
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  responses
}; 