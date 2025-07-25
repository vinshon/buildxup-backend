const { validateTask, validateUpdateTask, validateGetTasks } = require('../schemas/task.schema');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  softDeleteTask
} = require('../controllers/task.controller');
const { handleError, validationError } = require('../../../utils/error');
const { validateAuth } = require('../../../utils/data');
const logger = require('../../../utils/logger');

exports.createTaskHandler = async (req, res) => {
  try {
    const { error } = validateTask(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }

    const auth = validateAuth(req, res);
    if (!auth) return;

    // Map unified 'images' field to correct database fields
    const taskData = {
      ...req.body,
      // For database: task_images (multiple) or task_image (single)
      task_images: req.files && req.files.length > 0 ? req.files : null, // Multiple images from S3
      task_image: req.files && req.files.length === 1 ? req.files[0].location : null // Single image S3 URL
    };

    const result = await createTask({ ...taskData, ...auth });
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Task Error:', error);
    res.status(500).json(
      require('../../../utils/response').responses.internalError('Failed to create task', error.message)
    );
  }
};

exports.getTasksHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Validate query parameters if any are provided
    if (Object.keys(req.query).length > 0) {
      const { error } = validateGetTasks(req.query);
      if (error) {
        return validationError(res, `Validation failed: ${error.details[0].message}`);
      }
    }

    const result = await getTasks(auth.company_id, req.query);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Tasks Error:', error);
    handleError(res, error, 'retrieve tasks');
  }
};

exports.getTaskByIdHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { taskId } = req.params;
    if (!taskId) {
      return validationError(res, 'Task ID is required');
    }

    const result = await getTaskById(taskId, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task By ID Error:', error);
    handleError(res, error, 'retrieve task');
  }
};

exports.updateTaskHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { taskId } = req.params;
    if (!taskId) {
      return validationError(res, 'Task ID is required');
    }

    const { error } = validateUpdateTask(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }

    // Map unified 'images' field to correct database fields
    const taskData = {
      ...req.body,
      // For database: task_images (multiple) or task_image (single)
      task_images: req.files && req.files.length > 0 ? req.files : undefined, // Multiple images from S3
      task_image: req.files && req.files.length === 1 ? req.files[0].location : undefined // Single image S3 URL
    };

    const result = await updateTask(taskId, taskData, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Task Error:', error);
    handleError(res, error, 'update task');
  }
};

exports.deleteTaskHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { taskId } = req.params;
    if (!taskId) {
      return validationError(res, 'Task ID is required');
    }

    const result = await softDeleteTask(taskId, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Delete Task Error:', error);
    handleError(res, error, 'delete task');
  }
}; 