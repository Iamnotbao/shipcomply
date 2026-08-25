const Joi = require("joi");

const createAcContMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  cont_no: Joi.string().max(200).required(),
  cont_type: Joi.string().max(1).allow(null).empty('').default(null).optional(),         // 30 → 1
  issued_date: Joi.date().allow(null).empty('').default(null).optional(),
  expire_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_edate: Joi.date().allow(null).empty('').default(null).optional(),
  vend_no: Joi.string().max(200).allow(null).empty('').default(null).optional(),         // 30 → 200
  seller: Joi.string().max(600).allow(null).empty('').default(null).optional(),          // 200 → 600
  p_seller: Joi.string().max(600).allow(null).empty('').default(null).optional(),        // 200 → 600
  s_addr: Joi.string().max(600).allow(null).empty('').default(null).optional(),          // 500 → 600
  s_pic: Joi.string().max(600).allow(null).empty('').default(null).optional(),           // 100 → 600
  s_position: Joi.string().max(600).allow(null).empty('').default(null).optional(),      // 100 → 600
  s_accno: Joi.string().max(200).allow(null).empty('').default(null).optional(),         // 100 → 200
  bvend_no: Joi.string().max(200).allow(null).empty('').default(null).optional(),        // 30 → 200
  buyer: Joi.string().max(600).allow(null).empty('').default(null).optional(),           // 200 → 600
  b_addr: Joi.string().max(600).allow(null).empty('').default(null).optional(),          // 500 → 600
  b_pic: Joi.string().max(600).allow(null).empty('').default(null).optional(),           // 100 → 600
  b_position: Joi.string().max(600).allow(null).empty('').default(null).optional(),      // 100 → 600
  b_accno: Joi.string().max(200).allow(null).empty('').default(null).optional(),         // 100 → 200
  sum_qty: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  sum_money: Joi.number().precision(4).allow(null).empty('').default(null).optional(),
  currency: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  freight: Joi.number().max(100).allow(null).empty('').default(null).optional(),
  insurance: Joi.number().max(100).allow(null).empty('').default(null).optional(),
  term_pay: Joi.string().max(30).allow(null).empty('').default(null).optional(),         // 200 → 30
  pay_term: Joi.string().max(30).allow(null).empty('').default(null).optional(),         // 200 → 30
  time_delive: Joi.date().allow(null).empty('').default(null).optional(),                // string → date
  goods_origin: Joi.string().max(30).allow(null).empty('').default(null).optional(),     // 100 → 30
  port_dis: Joi.string().max(600).allow(null).empty('').default(null).optional(),        // 200 → 600
  note: Joi.string().max(600).allow(null).empty('').default(null).optional(),            // 1000 → 600
  bank: Joi.string().max(600).allow(null).empty('').default(null).optional(),            // 200 → 600
  bank_ic: Joi.string().max(600).allow(null).empty('').default(null).optional(),         // 200 → 600
  bank_addr: Joi.string().max(600).allow(null).empty('').default(null).optional(),       // 500 → 600
  d_type: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  cont_category: Joi.string().max(1).allow(null).empty('').default(null).optional(),     // 100 → 1
  big_contno: Joi.string().max(200).allow(null).empty('').default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  grt_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),         // 20 → 30
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = {
  createAcContMSchema,
};