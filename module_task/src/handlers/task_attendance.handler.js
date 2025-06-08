const { validateTaskAttendance } = require('../schemas/task_attendance.schema');
const {
  createTaskAttendance,
  getTaskAttendances,
  getTaskAttendanceById,
  updateTaskAttendance,
  softDeleteTaskAttendance,
  createBulkTaskAttendance
} = require('../controllers/task_attendance.controller');
const { handleError, validationError } = require('../../../utils/error');
const logger = require('../../../utils/logger');

exports.createTaskAttendanceHandler = async (req, res) => {
  try {
    const { error } = validateTaskAttendance(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId } = req.params;
    const result = await createTaskAttendance(taskId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Task Attendance Error:', error);
    handleError(res, error, 'create task attendance');
  }
};

exports.getTaskAttendancesHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await getTaskAttendances(taskId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Attendances Error:', error);
    handleError(res, error, 'get task attendances');
  }
};

exports.getTaskAttendanceByIdHandler = async (req, res) => {
  try {
    const { taskId, attendanceId } = req.params;
    const result = await getTaskAttendanceById(taskId, attendanceId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Attendance By ID Error:', error);
    handleError(res, error, 'get task attendance by id');
  }
};

exports.updateTaskAttendanceHandler = async (req, res) => {
  try {
    const { error } = validateTaskAttendance(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId, attendanceId } = req.params;
    const result = await updateTaskAttendance(taskId, attendanceId, req.body);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Task Attendance Error:', error);
    handleError(res, error, 'update task attendance');
  }
};

exports.softDeleteTaskAttendanceHandler = async (req, res) => {
  try {
    const { taskId, attendanceId } = req.params;
    const result = await softDeleteTaskAttendance(taskId, attendanceId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Soft Delete Task Attendance Error:', error);
    handleError(res, error, 'soft delete task attendance');
  }
};

exports.createBulkTaskAttendanceHandler = async (req, res) => {
  try {
    const { attendances } = req.body;
    
    // Validate that attendances is an array
    if (!Array.isArray(attendances)) {
      return validationError(res, 'Attendances must be an array');
    }

    // Validate each attendance object
    for (const attendance of attendances) {
      const { error } = validateTaskAttendance(attendance);
      if (error) {
        return validationError(res, `Validation failed for attendance: ${error.details[0].message}`);
      }
    }

    const { taskId } = req.params;
    const result = await createBulkTaskAttendance(taskId, attendances);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Bulk Task Attendance Error:', error);
    handleError(res, error, 'create bulk task attendance');
  }
}; 