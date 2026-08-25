const Joi = require("joi");

const createSdPriceItemSchema = Joi.object({
  org_id: Joi.string().max(6).required(),
  se_id: Joi.string().max(30).required(),
  se_seq: Joi.number().integer().required(),
  se_ver: Joi.number().integer().required(),
  curr_no: Joi.string().max(8).allow(null, "").optional(),
  std_price: Joi.number().precision(4).allow(null).empty("").optional(),
  adj_price: Joi.number().precision(4).allow(null).empty("").optional(),
  se_price: Joi.number().precision(4).allow(null).empty("").optional(),
  se_money: Joi.number().precision(4).allow(null).empty("").optional(),
  remark: Joi.string().max(300).allow(null, "").optional(),
  col1: Joi.string().max(36).allow(null, "").optional(),
  col2: Joi.string().max(20).allow(null, "").optional(),
  col3: Joi.string().max(36).allow(null, "").optional(),
  col4: Joi.string().max(20).allow(null, "").optional(),
  status: Joi.number().integer().required(),
  grt_dept: Joi.string().max(8).required(),
  grt_user: Joi.string().max(10).required(),
  last_user: Joi.string().max(10).required(),
  last_date: Joi.date().required(),
});

module.exports = createSdPriceItemSchema;