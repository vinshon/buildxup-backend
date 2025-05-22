const logger = require('../../../utils/logger');
const { Prisma } = require('@prisma/client');

// Error handling utility
const handleError = (res, error, operation) => {
  logger.error(`${operation} error:`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      status_code: 400,
      status: false,
      message: 'Database operation failed',
      error: error.message
    });
  }

  return res.status(500).json({
    status_code: 500,
    status: false,
    message: `Failed to ${operation}`,
    error: error.message || 'Internal server error'
  });
};

// Validation error response
const validationError = (res, message) => {
  return res.status(400).json({
    status_code: 400,
    status: false,
    message
  });
};

// Authentication validation
const validateAuth = (req, res) => {
  const { company_id, user_id } = req.user;
  if (!company_id || !user_id) {
    validationError(res, 'Unauthorized: Missing company or user information');
    return null;
  }
  return { company_id, user_id };
};

// Project data parsing
const parseProjectData = (req) => ({
  project_name: req.body.project_name,
  project_location: req.body.project_location,
  project_vaildation_amount: parseFloat(req.body.project_vaildation_amount) || 0,
  project_spent_amount: parseFloat(req.body.project_spent_amount) || 0,
  project_start_date: req.body.project_start_date,
  project_end_date: req.body.project_end_date,
  project_image: req.file ? `/uploads/${req.file.filename}` : null
});

// Update project data parsing
const parseUpdateProjectData = (req) => {
  const projectData = {
    project_name: req.body.project_name,
    project_location: req.body.project_location,
    project_vaildation_amount: req.body.project_vaildation_amount ? parseFloat(req.body.project_vaildation_amount) : undefined,
    project_spent_amount: req.body.project_spent_amount ? parseFloat(req.body.project_spent_amount) : undefined,
    project_status: req.body.project_status,
    project_start_date: req.body.project_start_date,
    project_end_date: req.body.project_end_date,
    project_image: req.file ? `/uploads/${req.file.filename}` : undefined
  };

  // Remove undefined values
  Object.keys(projectData).forEach(key =>
    projectData[key] === undefined && delete projectData[key]
  );

  return projectData;
};

module.exports = {
  handleError,
  validationError,
  validateAuth,
  parseProjectData,
  parseUpdateProjectData
}; 