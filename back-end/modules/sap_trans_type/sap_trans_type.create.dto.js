const Joi = require("joi");

const createSapTransTypeSchema = Joi.object({
  factory_code:       Joi.string().max(30).required(),
  type_no:            Joi.string().max(200).required(),
  type_name:          Joi.string().max(600).allow(null, "").optional(),
  material_out:       Joi.string().max(1).valid("Y", "N").allow(null, "").optional(),
  ship_out:           Joi.string().max(1).valid("Y", "N").allow(null, "").optional(),
  status:             Joi.number().integer().default(7).optional(),
  grt_dept:           Joi.string().max(30).allow(null, "").empty("").default(null).optional(),
  grt_user:           Joi.string().max(30).allow(null, "").empty("").default(null).optional(),
  grt_date:           Joi.date().allow(null).empty("").default(null).optional(),
  last_user:          Joi.string().max(30).allow(null, "").empty("").default(null).optional(),
  last_date:          Joi.date().allow(null).empty("").default(null).optional(),
  locked_information: Joi.string().max(600).allow(null, "").empty("").default(null).optional(),
});

module.exports = createSapTransTypeSchema;