// validators/acSrcOrderM.validator.js
const Joi = require("joi");

const createAcSrcOrderMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  id: Joi.number().integer().required(),
  order_type: Joi.string().max(30).allow(null).empty("").optional(),
  order_no: Joi.string().max(30).allow(null).empty("").optional(),
  vend_no: Joi.string().max(30).allow(null).empty("").optional(),
  ac_send: Joi.string().max(30).allow(null).empty("").optional(),
  ac_code: Joi.string().max(30).allow(null).empty("").optional(),
  cont_no: Joi.string().max(200).allow(null).empty("").optional(),
  pr_unit: Joi.string().max(30).allow(null).empty("").optional(),
  req_ac: Joi.string().max(1).allow(null).empty("").optional(),
  item_acno: Joi.string().max(200).allow(null).empty("").optional(),
  currency: Joi.string().max(30).allow(null).empty("").optional(),
  ac_vend: Joi.string().max(30).allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  order_date: Joi.date().allow(null).empty("").optional(),
  vr_cfmday: Joi.date().allow(null).empty("").optional(),
  order_seq: Joi.number().integer().allow(null).empty("").optional(),
  pr_formula: Joi.number().integer().allow(null).empty("").optional(),
  order_qty: Joi.number().integer().allow(null).empty("").optional(),
  order_acqty: Joi.number().integer().allow(null).empty("").optional(),
  chge_qty: Joi.number().integer().allow(null).empty("").optional(),
  rcpt_qty: Joi.number().integer().allow(null).empty("").optional(),
  pass_qty: Joi.number().integer().allow(null).empty("").optional(),
  plan_seq: Joi.number().integer().allow(null).empty("").optional(),
  price: Joi.number().integer().allow(null).empty("").optional(),
  amount: Joi.number().integer().allow(null).empty("").optional(),
  req_acqty: Joi.number().integer().allow(null).empty("").optional(),
  chge_ordqty: Joi.number().integer().allow(null).empty("").optional(),
  status: Joi.number().integer().default(1).optional(),
});

module.exports = createAcSrcOrderMSchema;
