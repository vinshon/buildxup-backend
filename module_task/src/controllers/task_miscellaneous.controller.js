const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');

async function createTaskMiscellaneous(taskId, data) {
  try {
    // Validate that the task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return responses.taskNotFound();

    const misc = await prisma.task_miscellaneous.create({
      data: {
        task_id: taskId,
        name: data.name,
        quantity: data.quantity,
        price: data.price
      }
    });
    return responses.created('Task miscellaneous info created', misc);
  } catch (error) {
    return responses.internalError('Failed to create task miscellaneous info', error.message);
  }
}

async function getTaskMiscellaneous(taskId) {
  try {
    const items = await prisma.task_miscellaneous.findMany({
      where: { task_id: taskId, is_deleted: false }
    });
    return responses.retrieved('Task miscellaneous retrieved', items);
  } catch (error) {
    return responses.internalError('Failed to get task miscellaneous', error.message);
  }
}

async function getTaskMiscellaneousById(taskId, miscId) {
  try {
    const item = await prisma.task_miscellaneous.findFirst({
      where: { id: miscId, task_id: taskId, is_deleted: false }
    });
    if (!item) return responses.notFound('Miscellaneous item not found');
    return responses.retrieved('Task miscellaneous item retrieved', item);
  } catch (error) {
    return responses.internalError('Failed to get task miscellaneous item', error.message);
  }
}

async function updateTaskMiscellaneous(taskId, miscId, data) {
  try {
    const updated = await prisma.task_miscellaneous.updateMany({
      where: { id: miscId, task_id: taskId, is_deleted: false },
      data: { ...data, updated_at: new Date() }
    });
    if (updated.count === 0) return responses.notFound('Miscellaneous item not found or already deleted');
    return responses.updated('Task miscellaneous item updated');
  } catch (error) {
    return responses.internalError('Failed to update task miscellaneous item', error.message);
  }
}

async function softDeleteTaskMiscellaneous(taskId, miscId) {
  try {
    const deleted = await prisma.task_miscellaneous.updateMany({
      where: { id: miscId, task_id: taskId, is_deleted: false },
      data: { is_deleted: true, deleted_at: new Date() }
    });
    if (deleted.count === 0) return responses.notFound('Miscellaneous item not found or already deleted');
    return responses.deleted('Task miscellaneous item deleted');
  } catch (error) {
    return responses.internalError('Failed to delete task miscellaneous item', error.message);
  }
}

module.exports = {
  createTaskMiscellaneous,
  getTaskMiscellaneous,
  getTaskMiscellaneousById,
  updateTaskMiscellaneous,
  softDeleteTaskMiscellaneous
}; 