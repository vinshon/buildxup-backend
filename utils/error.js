const logger = require('./logger');
const { Prisma } = require('@prisma/client');
const { responses } = require('./response');

// Handle Prisma errors
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return responses.conflict('Duplicate entry');
    case 'P2003':
      return responses.badRequest('Invalid reference');
    case 'P2025':
      return responses.notFound('Record not found');
    default:
      return responses.internalError('Database operation failed');
  }
};

// Handle validation errors
const handleValidationError = (error) => {
  if (error.isJoi) {
    return responses.validationError(error.details[0].message);
  }
  return responses.badRequest(error.message);
};

// Handle authentication errors
const handleAuthError = (error) => {
  if (error.name === 'UnauthorizedError') {
    return responses.unauthorized('Invalid or missing authentication token');
  }
  return responses.forbidden(error.message);
};

// Main error handler
const handleError = (error, operation) => {
  logger.error(`${operation} error:`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error.isJoi) {
    return handleValidationError(error);
  }

  if (error.name === 'UnauthorizedError') {
    return handleAuthError(error);
  }

  return responses.internalError(
    process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  );
};

// Validation error response
const validationError = (message) => {
  return responses.validationError(message);
};

module.exports = {
  handleError,
  validationError,
  handlePrismaError,
  handleValidationError,
  handleAuthError
}; 