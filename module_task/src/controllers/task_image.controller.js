const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');
const s3Service = require('../../../utils/s3');

async function createTaskImage(taskId, data) {
  try {
    // Validate that the task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return responses.taskNotFound();

    // If there are image URLs from S3 upload, store them in task_images table
    if (data.task_images && data.task_images.length > 0) {
      const imageData = data.task_images.map(img => ({
        task_id: data.task_id,
        image_url: img.image_url || img.location, // Handle both formats
        description: 'Task Image'
      }));

      const images = await prisma.task_image.createMany({
        data: imageData
      });

      // Fetch the created images
      const createdImages = await prisma.task_image.findMany({
        where: { 
          task_id: taskId,
          image_url: { in: imageData.map(img => img.image_url) }
        }
      });

      return responses.created('Task images created successfully', createdImages);
    }

    // Handle single image
    if (!data.task_image) return responses.badRequest('Image is required');

    const image = await prisma.task_image.create({
      data: {
        task_id: taskId,
        image_url: data.task_image,
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
    // If there's a new image from S3 upload, delete the old one from S3 first
    if (data.task_image && data.task_image.location) {
      const existingImage = await prisma.task_image.findFirst({
        where: { id: imageId, task_id: taskId, is_deleted: false }
      });

      if (existingImage && existingImage.image_url) {
        try {
          // Extract key from URL and delete from S3
          const urlParts = existingImage.image_url.split('/');
          const key = urlParts.slice(-1)[0]; // Get the filename
          await s3Service.deleteFile(key);
        } catch (s3Error) {
          console.error('Failed to delete old image from S3:', s3Error);
          // Continue with update even if S3 deletion fails
        }
      }

      // Update with new S3 URL
      const updated = await prisma.task_image.updateMany({
        where: { id: imageId, task_id: taskId, is_deleted: false },
        data: { 
          image_url: data.task_image.location,
          description: data.description,
          updated_at: new Date() 
        }
      });
      if (updated.count === 0) return responses.notFound('Image not found or already deleted');
      return responses.updated('Task image updated');
    }

    // Regular update without new image
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
    // Get the image before deletion to delete from S3
    const image = await prisma.task_image.findFirst({
      where: { id: imageId, task_id: taskId, is_deleted: false }
    });

    if (!image) return responses.notFound('Image not found or already deleted');

    // Delete from S3
    if (image.image_url) {
      try {
        const urlParts = image.image_url.split('/');
        const key = urlParts.slice(-1)[0]; // Get the filename
        await s3Service.deleteFile(key);
      } catch (s3Error) {
        console.error('Failed to delete image from S3:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Soft delete from database
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