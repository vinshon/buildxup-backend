const express = require("express");
const router = express.Router();
const logger = require("../../../utils/logger");
const { authMiddleware } = require("../../../module_auth/src/middleware/auth.middleware");
const upload = require("../../../config/multer");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task routes
const taskHandler = require('../handlers/task.handler');
router.post("/", upload.single('task_image'), taskHandler.createTaskHandler);
router.get("/", taskHandler.getTasksHandler);
router.get("/:taskId", taskHandler.getTaskByIdHandler);
router.put("/:taskId", upload.single('task_image'), taskHandler.updateTaskHandler);
router.delete("/:taskId", taskHandler.deleteTaskHandler);
// Task attendance
const attendanceHandler = require('../handlers/task_attendance.handler');
router.post('/:taskId/attendance', attendanceHandler.createTaskAttendanceHandler);
router.post('/:taskId/attendance/bulk', attendanceHandler.createBulkTaskAttendanceHandler);
router.get('/:taskId/attendance', attendanceHandler.getTaskAttendancesHandler);
router.get('/:taskId/attendance/:attendanceId', attendanceHandler.getTaskAttendanceByIdHandler);
router.put('/:taskId/attendance/:attendanceId', attendanceHandler.updateTaskAttendanceHandler);
router.delete('/:taskId/attendance/:attendanceId', attendanceHandler.softDeleteTaskAttendanceHandler);

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
      },
      attendance: {
        create: 'POST /tasks/:taskId/attendance',
        createBulk: 'POST /tasks/:taskId/attendance/bulk',
        getAll: 'GET /tasks/:taskId/attendance',
        getById: 'GET /tasks/:taskId/attendance/:attendanceId',
        update: 'PUT /tasks/:taskId/attendance/:attendanceId',
        delete: 'DELETE /tasks/:taskId/attendance/:attendanceId'
      }
    }
  });
});

module.exports = router; 