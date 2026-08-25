const Joi = require("joi");

const createRdSizeDSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  size_type: Joi.string().max(200).required(),
  size_no: Joi.string().max(30).required(),
  size_seq: Joi.string().max(30).empty("").default(null).optional(),
  size_shape: Joi.date().empty("").default(null).optional(),
});

module.exports = createRdSizeDSchema;
