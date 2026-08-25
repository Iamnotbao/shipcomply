const Joi = require("joi");

const createAcPlanSizeSchema = Joi.object({
  // Primary Keys
  factory_code: Joi.string().max(30).required(),
  ac_no: Joi.string().max(200).required(),
  se_id: Joi.string().max(200).required(),
  se_ver: Joi.number().precision(2).required(),
  se_seq: Joi.string().max(20).required(),
  pack_gu: Joi.number().precision(2).required(),
  ship_seq: Joi.number().precision(2).required(),
  size_no: Joi.string().max(200).required(),
  size_seq: Joi.number().precision(2).allow(null).empty("").optional(),
  price: Joi.number().precision(8).allow(null).empty("").optional(),
  pairs: Joi.number().precision(4).allow(null).empty("").optional(),
  money: Joi.number().precision(4).allow(null).empty("").optional(),
  prod_acno: Joi.string().max(200).allow(null).empty("").optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(30).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  locked_information: Joi.string().max(600).allow(null).empty("").default(null).optional(),
});

module.exports = createAcPlanSizeSchema;