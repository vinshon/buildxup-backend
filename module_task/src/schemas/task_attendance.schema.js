const Joi = require('joi');

function validateTaskAttendance(data) {
  const schema = Joi.object({
    employee_id: Joi.string().required(),
    salary_for_task: Joi.number().required(),
    status: Joi.string().valid('present', 'half_day', 'absent').required()
  });
  return schema.validate(data);
}

module.exports = { validateTaskAttendance }; 