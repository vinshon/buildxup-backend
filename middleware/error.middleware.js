const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status_code: 409,
      status: false,
      message: 'Duplicate entry',
      error: 'A record with this data already exists'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      status_code: 400,
      status: false,
      message: 'Invalid reference',
      error: 'The referenced record does not exist'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status_code: 404,
      status: false,
      message: 'Record not found',
      error: 'The requested record does not exist'
    });
  }

  // Handle validation errors
  if (err.isJoi) {
    return res.status(400).json({
      status_code: 400,
      status: false,
      message: 'Validation error',
      error: err.details[0].message
    });
  }

  // Handle authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: 'Unauthorized',
      error: 'Invalid or missing authentication token'
    });
  }

  // Handle other errors
  res.status(500).json({
    status_code: 500,
    status: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler; 