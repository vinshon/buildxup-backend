const Joi = require('joi');

function validateTaskMiscellaneous(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.string().required(),
    price: Joi.number().required()
  });
  return schema.validate(data);
}

module.exports = { validateTaskMiscellaneous }; 