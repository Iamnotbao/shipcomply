const Joi = require("joi");
const createAcReqOrderSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  req_no: Joi.string().max(30).required(),
  req_seq: Joi.number().precision(4).required(),
  order_type: Joi.string().max(2).allow(null).empty("").optional(),
  src_id: Joi.number().integer().allow(null).empty("").optional(),
  order_date: Joi.date().allow(null).empty("").optional(),
  order_no: Joi.string().max(30).allow(null).empty("").optional(),
  order_seq: Joi.number().integer().allow(null).empty("").optional(),
  ac_send: Joi.string().max(30).allow(null).empty("").optional(),
  cont_no: Joi.string().max(200).allow(null).empty("").optional(), 
  ac_code: Joi.string().max(30).allow(null).empty("").optional(),
  item_acno: Joi.string().max(30).allow(null).empty("").optional(),
  order_acqty: Joi.number().allow(null).empty("").optional(),
  req_acqty: Joi.number().allow(null).empty("").optional(),
  chge_qty: Joi.number().allow(null).empty("").optional(),
  rcpt_qty: Joi.number().allow(null).empty("").optional(),
  pass_qty: Joi.number().allow(null).empty("").optional(),
  req_qc: Joi.string().max(1).allow(null).empty("").optional(),
  req_qty: Joi.number().allow(null).empty("").optional(),
  currency: Joi.string().max(30).allow(null).empty("").optional(),
  price: Joi.number().allow(null).empty("").optional(),
  amount: Joi.number().allow(null).empty("").optional(),
  chk_no: Joi.string().max(30).allow(null).empty("").optional(),
  chk_seq: Joi.number().allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
status: Joi.number().integer().default(1).optional(),
grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
grt_user: Joi.string().max(20).allow(null).empty("").optional(),
grt_date: Joi.date().allow(null).empty("").optional(),
last_user: Joi.string().max(30).allow(null).empty("").optional(),
last_date: Joi.date().allow(null).empty("").optional(),
});

module.exports = createAcReqOrderSchema;
