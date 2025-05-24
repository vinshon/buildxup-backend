const Joi = require('joi');

const taskSchema = Joi.object({
  task_name: Joi.string().required().min(2).max(100),
  task_description: Joi.string().allow(null, ''),
  project_id: Joi.string().required(),
  due_date: Joi.date().required(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending'),
  assigned_to: Joi.string().allow(null, '')
});

const updateTaskSchema = Joi.object({
  task_name: Joi.string().min(2).max(100),
  task_description: Joi.string().allow(null, ''),
  due_date: Joi.date(),
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  assigned_to: Joi.string().allow(null, '')
});

const getTasksSchema = Joi.object({
  due_date: Joi.date(),
  start_date: Joi.date(),
  end_date: Joi.date().min(Joi.ref('start_date')),
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  project_id: Joi.string()
}).custom((obj, helpers) => {
  if (obj.start_date && obj.end_date && obj.due_date) {
    return helpers.error('any.invalid', { message: 'Cannot use due_date with start_date and end_date' });
  }
  return obj;
});


module.exports = {
  validateTask: (data) => taskSchema.validate(data),
  validateUpdateTask: (data) => updateTaskSchema.validate(data),
  validateGetTasks: (data) => getTasksSchema.validate(data)
}; 