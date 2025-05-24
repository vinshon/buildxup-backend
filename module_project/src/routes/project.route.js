const express = require("express");
const router = express.Router();
const logger = require("../../../utils/logger");
const { authMiddleware } = require("../../../module_auth/src/middleware/auth.middleware");
const upload = require("../../../config/multer");

// Register authentication middleware for all project routes
router.use(authMiddleware);

const {
  createProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
  getProjectOverviewHandler
} = require("../handlers/project.handler");

// Project routes
router.post("/", upload.single('project_image'), createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/overview", getProjectOverviewHandler);
router.get("/:projectId", getProjectByIdHandler);
router.put("/:projectId", upload.single('project_image'), updateProjectHandler);
router.delete("/:projectId", deleteProjectHandler);

// 404 handler for project routes
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Project route not found',
    path: req.path,
    availableEndpoints: {
      projects: {
        create: 'POST /projects',
        getAll: 'GET /projects',
        getOverview: 'GET /projects/overview',
        getById: 'GET /projects/:projectId',
        update: 'PUT /projects/:projectId',
        delete: 'DELETE /projects/:projectId',
      }
    }
  });
});

module.exports = router; 