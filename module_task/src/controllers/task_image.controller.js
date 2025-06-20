const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');

async function createTaskImage(taskId, data) {
  try {
    // Validate that the task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return responses.taskNotFound();
    if (!data.image_url) return responses.badRequest('Image is required');

    const image = await prisma.task_image.create({
      data: {
        task_id: taskId,
        image_url: data.image_url,
        description: data.description
      }
    });
    return responses.created('Task image created', image);
  } catch (error) {
    return responses.internalError('Failed to create task image', error.message);
  }
}

async function getTaskImages(taskId) {
  try {
    const images = await prisma.task_image.findMany({
      where: { task_id: taskId, is_deleted: false }
    });
    return responses.retrieved('Task images retrieved', images);
  } catch (error) {
    return responses.internalError('Failed to get task images', error.message);
  }
}

async function getTaskImageById(taskId, imageId) {
  try {
    const image = await prisma.task_image.findFirst({
      where: { id: imageId, task_id: taskId, is_deleted: false }
    });
    if (!image) return responses.notFound('Image not found');
    return responses.retrieved('Task image retrieved', image);
  } catch (error) {
    return responses.internalError('Failed to get task image', error.message);
  }
}

async function updateTaskImage(taskId, imageId, data) {
  try {
    const updated = await prisma.task_image.updateMany({
      where: { id: imageId, task_id: taskId, is_deleted: false },
      data: { ...data, updated_at: new Date() }
    });
    if (updated.count === 0) return responses.notFound('Image not found or already deleted');
    return responses.updated('Task image updated');
  } catch (error) {
    return responses.internalError('Failed to update task image', error.message);
  }
}

async function softDeleteTaskImage(taskId, imageId) {
  try {
    const deleted = await prisma.task_image.updateMany({
      where: { id: imageId, task_id: taskId, is_deleted: false },
      data: { is_deleted: true, deleted_at: new Date() }
    });
    if (deleted.count === 0) return responses.notFound('Image not found or already deleted');
    return responses.deleted('Task image deleted');
  } catch (error) {
    return responses.internalError('Failed to delete task image', error.message);
  }
}

module.exports = {
  createTaskImage,
  getTaskImages,
  getTaskImageById,
  updateTaskImage,
  softDeleteTaskImage
}; 