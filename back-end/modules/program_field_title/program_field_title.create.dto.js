const Joi = require("joi");
const createPFTSchema = Joi.object({
  program_code: Joi.string().required(),
  field_code: Joi.string().required(),
  title_name_t: Joi.string().allow(null, "").optional(),
  title_name_e: Joi.string().allow(null, "").optional(),
  title_name_l: Joi.string().allow(null, "").optional(),
  grt_dept: Joi.string().allow(null, "").optional(),
  grt_user: Joi.string().allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
  status: Joi.number().allow(null, "").optional(),
});
module.exports = createPFTSchema;
