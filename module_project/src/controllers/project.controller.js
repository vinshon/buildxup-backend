const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');
const { Prisma } = require('@prisma/client');
const { handlePrismaError } = require('../../../utils/data');

async function createProject(data) {
  try {
    // Verify company exists and user has access
    const company = await prisma.company.findUnique({
      where: { id: data.company_id },
      include: {
        users: {
          where: {
            user_id: data.user_id
          },
          include: {
            user: true
          }
        }
      }
    });

    if (!company) {
      return responses.companyNotFound();
    }

    if (company.users.length === 0) {
      return responses.unauthorizedAccess();
    }

    // Format dates from YYYY-MM-DD to start and end of day
    const projectData = {
      project_name: data.project_name,
      project_description: data.project_description,
      project_location: data.project_location,
      project_vaildation_amount: data.project_vaildation_amount,
      project_spent_amount: data.project_spent_amount,
      project_start_date: data.project_start_date,
      project_end_date: data.project_end_date,
      project_image: data.project_image,
      project_status: data.project_status || 'in_progress',
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
      company: {
        connect: {
          id: data.company_id
        }
      }
    };

    const project = await prisma.project.create({
      data: projectData,
      include: {
        company: true,
        project_images: true
      }
    });
    return responses.projectCreated(project);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return responses.badRequest('A project with this name already exists');
      }
      if (error.code === 'P2003') {
        return responses.badRequest('Invalid company reference');
      }
    }
    throw error;
  }
}

async function getProjects(companyId, filters = {}) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return responses.companyNotFound();
    }

    // Build where clause based on filters
    const whereClause = {
      company_id: companyId,
      is_deleted: false
    };

    // Add status filter if provided
    if (filters.status) {
      whereClause.project_status = filters.status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        project_images: true,
        company: true
      }
    });
    return responses.projectsRetrieved(projects);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error retrieving projects');
    }
    throw error;
  }
}

async function getProjectById(projectId, companyId) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return responses.companyNotFound();
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        is_deleted: false
      },
      include: {
        project_images: true,
        company: true
      }
    });

    if (!project) {
      return responses.projectNotFound();
    }

    return responses.projectRetrieved(project);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error retrieving project');
    }
    throw error;
  }
}

async function updateProject(projectId, data, companyId) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return responses.companyNotFound();
    }
    // First verify the project exists and belongs to the company
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        is_deleted: false
      }
    });

    if (!existingProject) {
      return responses.projectNotFound();
    }

    // Format dates if they exist in the update data
    const updateData = {
      ...data,
      project_start_date: data.project_start_date ? data.project_start_date : undefined,
      project_end_date: data.project_end_date ? data.project_end_date : undefined,
      updated_at: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const project = await prisma.project.update({
      where: {
        id: projectId,
        is_deleted: false
      },
      data: updateData,
      include: {
        company: true,
        project_images: true
      }
    });
    return responses.projectUpdated(project);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return responses.projectNotFound();
      }
      if (error.code === 'P2002') {
        return responses.badRequest('A project with this name already exists');
      }
    }
    throw error;
  }
}

async function softDeleteProject(projectId, companyId) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return responses.companyNotFound();
    }
    // First verify the project exists
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        is_deleted: false
      }
    });

    if (!existingProject) {
      return responses.projectNotFound();
    }

    const project = await prisma.project.update({
      where: {
        id: projectId,
        is_deleted: false
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date()
      },
      include: {
        company: true
      }
    });
    return responses.projectDeleted(project);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return responses.projectNotFound();
      }
    }
    throw error;
  }
}

async function getProjectStats(companyId) {
  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return responses.companyNotFound();
    }

    // Get all non-deleted projects for the company
    const projects = await prisma.project.findMany({
      where: {
        company_id: companyId,
        is_deleted: false
      }
    });

    // Calculate statistics
    const stats = {
      total_projects: projects.length,
      total_validation_amount: projects.reduce((sum, project) =>
        sum + Number(project.project_vaildation_amount), 0),
      total_spent_amount: projects.reduce((sum, project) =>
        sum + Number(project.project_spent_amount), 0),
      status_counts: {
        in_progress: projects.filter(p => p.project_status === 'in_progress').length,
        pending: projects.filter(p => p.project_status === 'pending').length,
        closed: projects.filter(p => p.project_status === 'closed').length
      }
    };

    return {
      success: true,
      message: 'Project statistics retrieved successfully',
      data: stats
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return responses.badRequest('Error retrieving project statistics');
    }
    throw error;
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  softDeleteProject,
  getProjectStats
}; 