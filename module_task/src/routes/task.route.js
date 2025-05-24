const express = require("express");
const router = express.Router();
const logger = require("../../../utils/logger");
const { authMiddleware } = require("../../../module_auth/src/middleware/auth.middleware");
const upload = require("../../../config/multer");

const {
  createTaskHandler,
  getTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler
} = require("../handlers/task.handler");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task routes
router.post("/", upload.single('task_image'), createTaskHandler);
router.get("/", getTasksHandler);
router.get("/:taskId", getTaskByIdHandler);
router.put("/:taskId", upload.single('task_image'), updateTaskHandler);
router.delete("/:taskId", deleteTaskHandler);

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