const Joi = require("joi");

const createAcPlanPackSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  pay_no: Joi.string().max(30).required(),
  name_s: Joi.string().max(600).allow(null,"").optional(),
  name_t: Joi.string().max(600).allow(null,"").optional(),
  name_e: Joi.string().max(600).allow(null,"").optional(),
  dt_pct: Joi.number().precision(2).min(0).max(100).allow(null).empty("").optional(),
  cal_days: Joi.number().integer().min(0).allow(null).empty("").optional(),
  note: Joi.string().max(600).allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(20).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  status: Joi.number().integer().default(1).optional(),
});

module.exports = createAcPlanPackSchema;