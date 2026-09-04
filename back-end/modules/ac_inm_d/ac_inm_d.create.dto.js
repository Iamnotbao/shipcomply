const Joi = require("joi");

const createAcInMDSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  inm_no: Joi.string().max(200).required(),
  seq: Joi.number().integer().optional(),
  item_no: Joi.string().allow(null).empty('').max(200).optional(),
  in_unit: Joi.string().allow(null).empty('').max(30).optional(),
  in_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  in_money: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  hs_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  n_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  grt_user: Joi.string().max(20).allow(null).empty('').default(null).optional(),
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = createAcInMDSchema;
