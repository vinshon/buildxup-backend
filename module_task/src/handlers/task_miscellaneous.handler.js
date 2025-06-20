const { validateTaskMiscellaneous } = require('../schemas/task_miscellaneous.schema');
const {
  createTaskMiscellaneous,
  getTaskMiscellaneous,
  getTaskMiscellaneousById,
  updateTaskMiscellaneous,
  softDeleteTaskMiscellaneous
} = require('../controllers/task_miscellaneous.controller');
const { handleError, validationError } = require('../../../utils/error');
const logger = require('../../../utils/logger');

exports.createTaskMiscellaneousHandler = async (req, res) => {
  try {
    const { error } = validateTaskMiscellaneous(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId } = req.params;
    const result = await createTaskMiscellaneous(taskId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Task Miscellaneous Error:', error);
    handleError(res, error, 'create task miscellaneous');
  }
};

exports.getTaskMiscellaneousHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await getTaskMiscellaneous(taskId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Miscellaneous Error:', error);
    handleError(res, error, 'get task miscellaneous');
  }
};

exports.getTaskMiscellaneousByIdHandler = async (req, res) => {
  try {
    const { taskId, miscId } = req.params;
    const result = await getTaskMiscellaneousById(taskId, miscId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Miscellaneous By ID Error:', error);
    handleError(res, error, 'get task miscellaneous by id');
  }
};

exports.updateTaskMiscellaneousHandler = async (req, res) => {
  try {
    const { error } = validateTaskMiscellaneous(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId, miscId } = req.params;
    const result = await updateTaskMiscellaneous(taskId, miscId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Task Miscellaneous Error:', error);
    handleError(res, error, 'update task miscellaneous');
  }
};

exports.softDeleteTaskMiscellaneousHandler = async (req, res) => {
  try {
    const { taskId, miscId } = req.params;
    const result = await softDeleteTaskMiscellaneous(taskId, miscId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Soft Delete Task Miscellaneous Error:', error);
    handleError(res, error, 'soft delete task miscellaneous');
  }
}; 