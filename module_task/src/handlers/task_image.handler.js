const { validateTaskImage } = require('../schemas/task_image.schema');
const {
  createTaskImage,
  getTaskImages,
  getTaskImageById,
  updateTaskImage,
  softDeleteTaskImage
} = require('../controllers/task_image.controller');
const { handleError, validationError } = require('../../../utils/error');
const logger = require('../../../utils/logger');

exports.createTaskImageHandler = async (req, res) => {
  try {
    const { error } = validateTaskImage(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId } = req.params;
    
    // Map unified 'images' field to correct database fields
    const imageData = {
      ...req.body,
      task_images: req.files && req.files.length > 0 ? req.files : null, // Multiple images from S3
      task_image: req.files && req.files.length === 1 ? req.files[0] : undefined, // Single image from S3
      task_id: taskId
    };
    
    const result = await createTaskImage(taskId, imageData);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Create Task Image Error:', error);
    handleError(res, error, 'create task image');
  }
};

exports.getTaskImagesHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await getTaskImages(taskId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Images Error:', error);
    handleError(res, error, 'get task images');
  }
};

exports.getTaskImageByIdHandler = async (req, res) => {
  try {
    const { taskId, imageId } = req.params;
    const result = await getTaskImageById(taskId, imageId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Get Task Image By ID Error:', error);
    handleError(res, error, 'get task image by id');
  }
};

exports.updateTaskImageHandler = async (req, res) => {
  try {
    const { error } = validateTaskImage(req.body);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }
    const { taskId, imageId } = req.params;
    
    // Map unified 'images' field to correct database fields
    const imageData = {
      ...req.body,
      task_image: req.files && req.files.length > 0 ? req.files[0] : undefined // S3 file object from multer-s3
    };
    
    const result = await updateTaskImage(taskId, imageId, imageData);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Update Task Image Error:', error);
    handleError(res, error, 'update task image');
  }
};

exports.softDeleteTaskImageHandler = async (req, res) => {
  try {
    const { taskId, imageId } = req.params;
    const result = await softDeleteTaskImage(taskId, imageId);
    res.status(result.status_code).json(result);
  } catch (error) {
    logger.error('Soft Delete Task Image Error:', error);
    handleError(res, error, 'soft delete task image');
  }
}; 