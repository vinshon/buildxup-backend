const { validateProject, validateUpdateProject } = require('../schemas/project.schema');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  softDeleteProject,
  getProjectStats
} = require('../controllers/project.controller');
const { handleError, validationError } = require('../../../utils/error');
const { validateAuth } = require('../../../utils/data');
const { parseProjectData, parseUpdateProjectData } = require('../utils/project.utils');
const { responses } = require('../../../utils/response');

// Handler functions
exports.createProjectHandler = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.project_name || !req.body.project_location) {
      return res.status(400).json(
        responses.badRequest('Project name and location are required')
      );
    }

    // Validate project_start_date and project_end_date
    if (!req.body.project_start_date || isNaN(new Date(req.body.project_start_date))) {
      return res.status(400).json(
        responses.badRequest('Invalid or missing project_start_date. Expected format: YYYY-MM-DD')
      );
    }
    if (!req.body.project_end_date || isNaN(new Date(req.body.project_end_date))) {
      return res.status(400).json(
        responses.badRequest('Invalid or missing project_end_date. Expected format: YYYY-MM-DD')
      );
    }

    // Parse and validate project data
    const projectData = parseProjectData(req);
    const { error } = validateProject(projectData);
    if (error) {
      return res.status(400).json(
        responses.validationError(error.details[0].message)
      );
    }

    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Create project
    const result = await createProject({ ...projectData, ...auth });
    return res.status(result.status_code).json(result);
  } catch (error) {
    return handleError(res, error, 'create project');
  }
};

exports.getProjectsHandler = async (req, res) => {
  try {
    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Parse filters
    const filters = {
      status: req.query.status,
      search: req.query.search,
      sort: req.query.sort,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await getProjects(auth.company_id, filters);
    return res.status(result.status_code).json(result);
  } catch (error) {
    return handleError(res, error, 'retrieve projects');
  }
};

exports.getProjectByIdHandler = async (req, res) => {
  try {
    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Validate project ID
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json(
        responses.badRequest('Project ID is required')
      );
    }

    const result = await getProjectById(projectId, auth.company_id);
    return res.status(result.status_code).json(result);
  } catch (error) {
    return handleError(res, error, 'retrieve project');
  }
};

exports.updateProjectHandler = async (req, res) => {
  try {
    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Validate project ID
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json(
        responses.badRequest('Project ID is required')
      );
    }

    // Parse and validate update data
    const projectData = parseUpdateProjectData(req);
    if (Object.keys(projectData).length === 0) {
      return res.status(400).json(
        responses.badRequest('No update data provided')
      );
    }

    const { error } = validateUpdateProject(projectData);
    if (error) {
      return res.status(400).json(
        responses.validationError(error.details[0].message)
      );
    }

    const result = await updateProject(projectId, projectData, auth.company_id);
    return res.status(result.status_code).json(result);
  } catch (error) {
    return handleError(res, error, 'update project');
  }
};

exports.deleteProjectHandler = async (req, res) => {
  try {
    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Validate project ID
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json(
        responses.badRequest('Project ID is required')
      );
    }

    const result = await softDeleteProject(projectId, auth.company_id);
    return res.status(result.status_code).json(result);
  } catch (error) {
    return handleError(res, error, 'delete project');
  }
};

exports.getProjectOverviewHandler = async (req, res) => {
  try {
    // Validate authentication
    const auth = validateAuth(req, res);
    if (!auth) return;

    const result = await getProjectStats(auth.company_id);
    return res.status(result.status_code || 200).json(result);
  } catch (error) {
    return handleError(res, error, 'retrieve project overview');
  }
};