const Joi = require("joi");

const createAcChkTSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  conf_seq: Joi.number().precision(2).required(),
  matd_seq: Joi.number().precision(2).required(),
  issue_seq: Joi.number().precision(2).required(),
  src: Joi.string().max(1).valid("0", "1", "2", "9").allow(null).empty("").default(null).optional(),
  in_acno: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  ac_date: Joi.date().allow(null).empty("").default(null).optional(),
  d_type: Joi.string().max(1).valid("1", "2", "3", "4", "9").allow(null).empty("").default(null).optional(),
  out_acno: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  prod_no: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  matd_no: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  unit: Joi.string().max(30).allow(null).empty("").default(null).optional(),
  price: Joi.number().precision(8).allow(null).empty("").default(null).optional(),
  pairs: Joi.number().precision(4).allow(null).empty("").default(null).optional(),
  unit_qty: Joi.number().precision(8).allow(null).empty("").default(null).optional(),
  loss_per: Joi.number().precision(2).allow(null).empty("").default(null).optional(),
  qty: Joi.number().precision(8).allow(null).empty("").default(null).optional(),
  over_qty: Joi.number().precision(8).allow(null).empty("").default(null).optional(),
  remark: Joi.string().max(600).allow(null).empty("").default(null).optional(),
  col1: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  col2: Joi.string().max(200).allow(null).empty("").default(null).optional(),
  col3: Joi.date().allow(null).empty("").default(null).optional(),
  money: Joi.number().precision(4).allow(null).empty("").default(null).optional(),
  locked_information: Joi.string().max(600).allow(null).empty("").default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_user: Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_date: Joi.date().allow(null).empty("").default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty("").default(null).optional(),
  last_date: Joi.date().allow(null).empty("").default(null).optional(),
});

module.exports = {
  createAcChkTSchema,
};