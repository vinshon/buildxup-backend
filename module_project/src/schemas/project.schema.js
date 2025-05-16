const Joi = require('joi');

const projectSchema = Joi.object({
  project_name: Joi.string().required().min(2).max(100),
  project_location: Joi.string().required(),
  project_vaildation_amount: Joi.number().required().min(0),
  project_spent_amount: Joi.number().min(0).allow(null, 0).optional(),
  project_start_date: Joi.date().required(),
  project_end_date: Joi.date().required(),
  project_image: Joi.string().allow(null, '').optional()
});

const updateProjectSchema = Joi.object({
  project_name: Joi.string().min(2).max(100),
  project_location: Joi.string(),
  project_vaildation_amount: Joi.number().min(0),
  project_spent_amount: Joi.number().min(0),
  project_start_date: Joi.date(),
  project_end_date: Joi.date()
});

module.exports = {
  validateProject: (data) => projectSchema.validate(data),
  validateUpdateProject: (data) => updateProjectSchema.validate(data)
}; 