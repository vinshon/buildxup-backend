const { Prisma } = require('@prisma/client');
const { responses } = require('./response');

// Common data parsing functions
const parseDate = (dateString) => {
  if (!dateString) return undefined;
  const d = new Date(dateString + 'T00:00:00.000Z');
  return isNaN(d) ? undefined : d;
};

const parseEndDate = (dateString) => {
  if (!dateString) return undefined;
  const d = new Date(dateString + 'T23:59:59.999Z');
  return isNaN(d) ? undefined : d;
};

const parseFloat = (value) => {
  if (!value) return undefined;
  return Number(value);
};

const parseImagePath = (file) => {
  if (!file) return undefined;
  return `/uploads/${file.filename}`;
};

// Common validation functions
const validateAuth = (req, res) => {
  if (!req.user || !req.user.id || !req.user.company_id) {
    res.status(401).json({
      status_code: 401,
      status: false,
      message: 'Unauthorized access',
      error: 'Invalid or missing authentication token'
    });
    return null;
  }
  return {
    user_id: req.user.id,
    company_id: req.user.company_id
  };
};

// Common data cleaning function
const cleanData = (data) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Common Prisma error handling
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return responses.conflict('A record with this data already exists');
      case 'P2003':
        return responses.badRequest('Invalid reference');
      case 'P2025':
        return responses.notFound('Record not found');
      default:
        return responses.internalError('Database operation failed');
    }
  }
  throw error;
};

module.exports = {
  parseDate,
  parseEndDate,
  parseFloat,
  parseImagePath,
  validateAuth,
  cleanData,
  handlePrismaError
}; 