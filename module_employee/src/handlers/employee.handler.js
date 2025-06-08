const { validateEmployee } = require('../schemas/employee.schema');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  softDeleteEmployee
} = require('../controllers/employee.controller');
const { handleError, validationError } = require('../../../utils/error');
const logger = require('../../../utils/logger');

exports.createEmployeeHandler = async (req, res) => {
  try {
    const { error } = validateEmployee(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const result = await createEmployee(req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Employee Error:', error);
    handleError(res, error, 'create employee');
  }
};

exports.getEmployeesHandler = async (req, res) => {
  try {
    const result = await getEmployees();
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Employees Error:', error);
    handleError(res, error, 'get employees');
  }
};

exports.getEmployeeByIdHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await getEmployeeById(employeeId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Employee By ID Error:', error);
    handleError(res, error, 'get employee by id');
  }
};

exports.updateEmployeeHandler = async (req, res) => {
  try {
    const { error } = validateEmployee(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { employeeId } = req.params;
    const result = await updateEmployee(employeeId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Employee Error:', error);
    handleError(res, error, 'update employee');
  }
};

exports.softDeleteEmployeeHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await softDeleteEmployee(employeeId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Soft Delete Employee Error:', error);
    handleError(res, error, 'soft delete employee');
  }
}; 