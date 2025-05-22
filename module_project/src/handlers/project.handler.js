const { validateProject, validateUpdateProject } = require('../schemas/project.schema');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  softDeleteProject,
  getProjectStats
} = require('../controllers/project.controller');
const {
  handleError,
  validationError,
  validateAuth,
  parseProjectData,
  parseUpdateProjectData
} = require('../utils/project.utils');

// Handler functions
exports.createProjectHandler = async (req, res) => {
  try {
    if (!req.body.project_name || !req.body.project_location) {
      return validationError(res, 'Project name and location are required');
    }

    const projectData = parseProjectData(req);
    const { error } = validateProject(projectData);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }

    const auth = validateAuth(req, res);
    if (!auth) return;

    const result = await createProject({ ...projectData, ...auth });
    res.status(result.status_code).json(result);
  } catch (error) {
    handleError(res, error, 'create project');
  }
};

exports.getProjectsHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    // Get filters from query parameters
    const filters = {
      status: req.query.status // This will be undefined if not provided
    };

    const result = await getProjects(auth.company_id, filters);
    res.status(result.status_code).json(result);
  } catch (error) {
    handleError(res, error, 'retrieve projects');
  }
};

exports.getProjectByIdHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { projectId } = req.params;
    if (!projectId) {
      return validationError(res, 'Project ID is required');
    }

    const result = await getProjectById(projectId, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    handleError(res, error, 'retrieve project');
  }
};

exports.updateProjectHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { projectId } = req.params;
    if (!projectId) {
      return validationError(res, 'Project ID is required');
    }

    const projectData = parseUpdateProjectData(req);

    if (Object.keys(projectData).length === 0) {
      return validationError(res, 'No update data provided');
    }

    const { error } = validateUpdateProject(projectData);
    if (error) {
      return validationError(res, `Validation failed: ${error.details[0].message}`);
    }

    const result = await updateProject(projectId, projectData, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    handleError(res, error, 'update project');
  }
};

exports.deleteProjectHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const { projectId } = req.params;
    if (!projectId) {
      return validationError(res, 'Project ID is required');
    }

    const result = await softDeleteProject(projectId, auth.company_id);
    res.status(result.status_code).json(result);
  } catch (error) {
    handleError(res, error, 'delete project');
  }
};

exports.getProjectOverviewHandler = async (req, res) => {
  try {
    const auth = validateAuth(req, res);
    if (!auth) return;

    const result = await getProjectStats(auth.company_id);
    res.status(result.status_code || 200).json(result);
  } catch (error) {
    handleError(res, error, 'retrieve project overview');
  }
};