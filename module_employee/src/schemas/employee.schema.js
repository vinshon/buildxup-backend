const Joi = require('joi');

function validateEmployee(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    phone: Joi.string().optional(),
    aadhar_number: Joi.string().optional(),
    basic_salary: Joi.number().required()
  });
  return schema.validate(data);
}

module.exports = { validateEmployee }; 