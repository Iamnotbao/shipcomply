const Joi = require("joi");
const createProgramSchema = Joi.object({
  program_code: Joi.string().required(),
  program_name_t: Joi.string().allow(null, "").optional(),
  program_name_e: Joi.string().allow(null, "").optional(),
  program_name_l: Joi.string().allow(null, "").optional(),
  status: Joi.number().optional(),
  grt_dept: Joi.string().allow(null, "").optional(),
  grt_user: Joi.string().allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
});
module.exports = createProgramSchema;
