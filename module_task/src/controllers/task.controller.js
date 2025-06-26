const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');
const { Prisma } = require('@prisma/client');
const { handlePrismaError } = require('../../../utils/data');

async function createTask(data) {
  try {
    // Verify project exists and belongs to the company
    const project = await prisma.project.findFirst({
      where: {
        id: data.project_id,
        company_id: data.company_id,
        is_deleted: false
      }
    });

    if (!project) {
      return responses.projectNotFound();
    }

    const taskData = {
      task_name: data.task_name,
      task_description: data.task_description,
      project_id: data.project_id,
      due_date: new Date(data.due_date + 'T00:00:00.000Z'),
      status: data.status || 'pending',
      assigned_to: data.assigned_to,
      task_image: data.task_image,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    };

    const task = await prisma.task.create({
      data: taskData,
      include: {
        project: true
      }
    });

    return responses.created('Task created successfully', task);
  } catch (error) {
    console.error('createTask error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return responses.badRequest('Invalid project reference', error.message);
      }
    }
    throw error;
  }
}

async function getTasks(companyId, filters = {}) {
  try {
    // Build where clause based on filters
    const whereClause = {
      project: {
        company_id: companyId,
        is_deleted: false
      },
      is_deleted: false
    };

    // Add date range filter if provided
    if (filters.start_date && filters.end_date) {
      try {
        const startDate = new Date(filters.start_date);
        const endDate = new Date(filters.end_date);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return responses.badRequest('Invalid date format. Use YYYY-MM-DD');
        }


        // Set start date to beginning of day
        startDate.setHours(0, 0, 0, 0);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);

        whereClause.due_date = {
          gte: startDate,
          lte: endDate
        };
      } catch (error) {
        return responses.badRequest('Invalid date format. Use YYYY-MM-DD');
      }
    }
    // Add single date filter if provided
    else if (filters.due_date) {
      try {
        const dueDate = new Date(filters.due_date);

        // Validate date
        if (isNaN(dueDate.getTime())) {
          return responses.badRequest('Invalid date format. Use YYYY-MM-DD');
        }


        // Set to beginning of day
        const startOfDay = new Date(dueDate);
        startOfDay.setHours(0, 0, 0, 0);

        // Set to end of day
        const endOfDay = new Date(dueDate);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.due_date = {
          gte: startOfDay,
          lte: endOfDay
        };
      } catch (error) {
        return responses.badRequest('Invalid date format. Use YYYY-MM-DD');
      }
    }

    // Add status filter if provided
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Add priority filter if provided
    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    // Add project filter if provided
    if (filters.project_id) {
      whereClause.project_id = filters.project_id;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return responses.retrieved('Tasks retrieved successfully', tasks);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error retrieving tasks: ' + error.message);
    }
    throw error;
  }
}


async function getTaskById(taskId, companyId) {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          company_id: companyId,
          is_deleted: false
        },
        is_deleted: false
      },
      include: {
        project: true
      }
    });

    if (!task) {
      return responses.taskNotFound();
    }

    return responses.retrieved('Task retrieved successfully', task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error retrieving task');
    }
    throw error;
  }
}

async function updateTask(taskId, data, companyId) {
  try {
    // First verify the task exists and belongs to the company
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          company_id: companyId,
          is_deleted: false
        },
        is_deleted: false
      }
    });

    if (!existingTask) {
      return responses.taskNotFound();
    }

    // Format date if it exists in the update data
    const updateData = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00.000Z') : undefined,
      updated_at: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const task = await prisma.task.update({
      where: {
        id: taskId
      },
      data: updateData,
      include: {
        project: true
      }
    });

    return responses.updated('Task updated successfully', task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return responses.taskNotFound();
      }
    }
    throw error;
  }
}

async function softDeleteTask(taskId, companyId) {
  try {
    // First verify the task exists and belongs to the company
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          company_id: companyId,
          is_deleted: false
        },
        is_deleted: false
      }
    });

    if (!existingTask) {
      return responses.taskNotFound();
    }

    await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        is_deleted: true,
        updated_at: new Date()
      }
    });

    return responses.deleted('Task deleted successfully');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error deleting task');
    }
    throw error;
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  softDeleteTask
}; 