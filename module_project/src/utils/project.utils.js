const { parseFloat, parseImagePath, cleanData, parseDate, parseEndDate } = require('../../../utils/data');
const { responses } = require('../../../utils/response');

// Project data parsing functions
const parseProjectData = (req) => {
  try {
    const projectData = {
      project_name: req.body.project_name,
      project_location: req.body.project_location,
      project_vaildation_amount: parseFloat(req.body.project_vaildation_amount),
      project_spent_amount: parseFloat(req.body.project_spent_amount),
      project_start_date: parseDate(req.body.project_start_date),
      project_end_date: parseEndDate(req.body.project_end_date),
      project_image: parseImagePath(req.file),
      project_status: req.body.project_status || 'in_progress',
      project_description: req.body.project_description
    };

    return cleanData(projectData);
  } catch (error) {
    throw new Error('Failed to parse project data: ' + error.message);
  }
};

const parseUpdateProjectData = (req) => {
  try {
    const projectData = {
      project_name: req.body.project_name,
      project_location: req.body.project_location,
      project_vaildation_amount: parseFloat(req.body.project_vaildation_amount),
      project_spent_amount: parseFloat(req.body.project_spent_amount),
      project_start_date: parseDate(req.body.project_start_date),
      project_end_date: parseEndDate(req.body.project_end_date),
      project_image: parseImagePath(req.file),
      project_status: req.body.project_status,
      project_description: req.body.project_description
    };

    return cleanData(projectData);
  } catch (error) {
    throw new Error('Failed to parse project update data: ' + error.message);
  }
};

// Project validation functions
const validateProjectDates = (startDate, endDate) => {
  if (startDate && endDate && startDate > endDate) {
    throw new Error('Project start date cannot be after end date');
  }
};

const validateProjectAmounts = (validationAmount, spentAmount) => {
  if (validationAmount && spentAmount && spentAmount > validationAmount) {
    throw new Error('Spent amount cannot exceed validation amount');
  }
};

module.exports = {
  parseProjectData,
  parseUpdateProjectData,
  validateProjectDates,
  validateProjectAmounts
}; 