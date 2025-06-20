const { validateTaskNote } = require('../schemas/task_note.schema');
const {
  createTaskNote,
  getTaskNotes,
  getTaskNoteById,
  updateTaskNote,
  softDeleteTaskNote
} = require('../controllers/task_note.controller');
const { handleError, validationError } = require('../../../utils/error');
const logger = require('../../../utils/logger');

exports.createTaskNoteHandler = async (req, res) => {
  try {
    const { error } = validateTaskNote(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId } = req.params;
    const result = await createTaskNote(taskId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Task Note Error:', error);
    handleError(res, error, 'create task note');
  }
};

exports.getTaskNotesHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await getTaskNotes(taskId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Notes Error:', error);
    handleError(res, error, 'get task notes');
  }
};

exports.getTaskNoteByIdHandler = async (req, res) => {
  try {
    const { taskId, noteId } = req.params;
    const result = await getTaskNoteById(taskId, noteId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Note By ID Error:', error);
    handleError(res, error, 'get task note by id');
  }
};

exports.updateTaskNoteHandler = async (req, res) => {
  try {
    const { error } = validateTaskNote(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId, noteId } = req.params;
    const result = await updateTaskNote(taskId, noteId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Task Note Error:', error);
    handleError(res, error, 'update task note');
  }
};

exports.softDeleteTaskNoteHandler = async (req, res) => {
  try {
    const { taskId, noteId } = req.params;
    const result = await softDeleteTaskNote(taskId, noteId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Soft Delete Task Note Error:', error);
    handleError(res, error, 'soft delete task note');
  }
}; 