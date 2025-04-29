const logger = require('../../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler; 