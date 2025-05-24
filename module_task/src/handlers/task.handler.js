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

    // Add image path if file was uploaded
    const taskData = {
      ...req.body,
      task_image: req.file ? `/uploads/${req.file.filename}` : null
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

    // Add image path if file was uploaded
    const taskData = {
      ...req.body,
      task_image: req.file ? `/uploads/${req.file.filename}` : undefined
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