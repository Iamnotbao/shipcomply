const Joi = require("joi");

const createAcContDSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  cont_no: Joi.string().max(200).required(),
  seq: Joi.number().precision(2).optional(),
  goods_code: Joi.string().max(200).allow(null).empty('').default(null).optional(),
  color: Joi.string().max(200).allow(null).empty('').default(null).optional(),
  cont_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  cont_price: Joi.number().precision(8).allow(null).empty('').default(null).optional(),
  cont_money: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  used_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  stock_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  unit: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  shoe_id: Joi.string().max(200).allow(null).empty('').default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  grt_user: Joi.string().max(20).allow(null).empty('').default(null).optional(),
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = {
  createAcContDSchema,
};
