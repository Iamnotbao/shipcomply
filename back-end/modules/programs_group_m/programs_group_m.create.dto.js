const Joi = require("joi");

const createProgramsGroupMSchema = Joi.object({
  group_code: Joi.string().max(30).required(),
  group_name_e: Joi.string().max(600).allow(null).empty("").optional(),
  group_name_l: Joi.string().max(600).allow(null).empty("").optional(),
  group_name_t: Joi.string().max(600).allow(null).empty("").optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(20).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
});

module.exports = createProgramsGroupMSchema;
