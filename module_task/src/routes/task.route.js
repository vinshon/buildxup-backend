const express = require("express");
const router = express.Router();
const multer = require("multer");
const logger = require("../../../utils/logger");
const { authMiddleware } = require("../../../middleware/auth.middleware");
const s3Service = require("../../../utils/s3");

// Configure unified S3 multer for tasks - uses 'images' field name for payloads
const uploadTaskUnified = s3Service.configureUnifiedMulter('tasks', 10);

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task routes with unified image upload
const taskHandler = require('../handlers/task.handler');
router.post("/", uploadTaskUnified, taskHandler.createTaskHandler);
router.get("/", taskHandler.getTasksHandler);
router.get("/:taskId", taskHandler.getTaskByIdHandler);
router.put("/:taskId", uploadTaskUnified, taskHandler.updateTaskHandler);
router.delete("/:taskId", taskHandler.deleteTaskHandler);
// Task attendance
const attendanceHandler = require('../handlers/task_attendance.handler');
router.post('/:taskId/attendance', attendanceHandler.createTaskAttendanceHandler);
router.post('/:taskId/attendance/bulk', attendanceHandler.createBulkTaskAttendanceHandler);
router.get('/:taskId/attendance', attendanceHandler.getTaskAttendancesHandler);
router.get('/:taskId/attendance/:attendanceId', attendanceHandler.getTaskAttendanceByIdHandler);
router.put('/:taskId/attendance/:attendanceId', attendanceHandler.updateTaskAttendanceHandler);
router.delete('/:taskId/attendance/:attendanceId', attendanceHandler.softDeleteTaskAttendanceHandler);
// Task miscellaneous
const miscHandler = require('../handlers/task_miscellaneous.handler');
router.post('/:taskId/miscellaneous', miscHandler.createTaskMiscellaneousHandler);
router.get('/:taskId/miscellaneous', miscHandler.getTaskMiscellaneousHandler);
router.get('/:taskId/miscellaneous/:miscId', miscHandler.getTaskMiscellaneousByIdHandler);
router.put('/:taskId/miscellaneous/:miscId', miscHandler.updateTaskMiscellaneousHandler);
router.delete('/:taskId/miscellaneous/:miscId', miscHandler.softDeleteTaskMiscellaneousHandler);
// Task images
const imageHandler = require('../handlers/task_image.handler');
router.post('/:taskId/images', uploadTaskUnified, imageHandler.createTaskImageHandler);
router.get('/:taskId/images', imageHandler.getTaskImagesHandler);
router.get('/:taskId/images/:imageId', imageHandler.getTaskImageByIdHandler);
router.put('/:taskId/images/:imageId', uploadTaskUnified, imageHandler.updateTaskImageHandler);
router.delete('/:taskId/images/:imageId', imageHandler.softDeleteTaskImageHandler);
// Task notes
const noteHandler = require('../handlers/task_note.handler');
router.post('/:taskId/notes', noteHandler.createTaskNoteHandler);
router.get('/:taskId/notes', noteHandler.getTaskNotesHandler);
router.get('/:taskId/notes/:noteId', noteHandler.getTaskNoteByIdHandler);
router.put('/:taskId/notes/:noteId', noteHandler.updateTaskNoteHandler);
router.delete('/:taskId/notes/:noteId', noteHandler.softDeleteTaskNoteHandler);

// 404 handler for task routes
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Task route not found',
    path: req.path,
    availableEndpoints: {
      tasks: {
        create: 'POST /tasks',
        getAll: 'GET /tasks',
        getById: 'GET /tasks/:taskId',
        update: 'PUT /tasks/:taskId',
        delete: 'DELETE /tasks/:taskId'
      }
    }
  });
});

module.exports = router; 