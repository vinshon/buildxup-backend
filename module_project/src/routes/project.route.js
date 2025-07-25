const express = require("express");
const router = express.Router();
const multer = require("multer");
const logger = require("../../../utils/logger");
const { authMiddleware } = require("../../../middleware/auth.middleware");
const s3Service = require("../../../utils/s3");

// Configure unified S3 multer for project images - uses 'images' field name for payloads
const uploadProjectUnified = s3Service.configureUnifiedMulter('projects', 10);

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

// Project routes with unified image upload
router.post("/", uploadProjectUnified, createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/overview", getProjectOverviewHandler);
router.get("/:projectId", getProjectByIdHandler);
router.put("/:projectId", uploadProjectUnified, updateProjectHandler);
router.delete("/:projectId", deleteProjectHandler);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: false,
        message: 'Too many files. Maximum is 10 files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: false,
        message: 'Unexpected file field. Use "images" field for both single and multiple uploads'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      status: false,
      message: 'Only image files are allowed'
    });
  }
  
  logger.error('Project upload error:', error);
  res.status(500).json({
    status: false,
    message: 'Upload failed'
  });
});

// 404 handler for project routes
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Project route not found',
    path: req.path,
    availableEndpoints: {
      projects: {
        create: 'POST /projects (with images field)',
        getAll: 'GET /projects',
        getOverview: 'GET /projects/overview',
        getById: 'GET /projects/:projectId',
        update: 'PUT /projects/:projectId (with images field)',
        delete: 'DELETE /projects/:projectId',
      }
    }
  });
});

module.exports = router; 