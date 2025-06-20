const Joi = require('joi');

function validateTaskNote(data) {
  const schema = Joi.object({
    content: Joi.string().required()
  });
  return schema.validate(data);
}

module.exports = { validateTaskNote }; 