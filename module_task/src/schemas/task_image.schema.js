const Joi = require('joi');

function validateTaskImage(data) {
  const schema = Joi.object({
    description: Joi.string().optional()
  });
  return schema.validate(data);
}

module.exports = { validateTaskImage }; 