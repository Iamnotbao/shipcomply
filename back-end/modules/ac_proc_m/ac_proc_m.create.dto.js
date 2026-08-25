const Joi = require("joi");

const createAcProcMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  ac_no: Joi.string().max(200).required(),
  d_type: Joi.string()
    .max(1)
    .allow(null, "")
    .optional(),
  in_cont: Joi.string().max(200).allow(null, "").optional(),
  in_crate: Joi.number().precision(4).allow(null).optional(),
  out_type: Joi.string().max(30).allow(null, "").optional(),
  out_cont: Joi.string().max(200).allow(null, "").optional(),
  in_type: Joi.string().max(30).allow(null, "").optional(),
  in_date: Joi.date().allow(null).empty('').default(null).optional(),
  sort: Joi.string().max(200).allow(null, "").optional(),
  out_settle: Joi.string().max(30).allow(null, "").optional(),
  out_curr: Joi.string().max(30).allow(null, "").optional(),
  out_crate: Joi.number().precision(4).allow(null).optional(),
  gross: Joi.number().precision(4).allow(null).optional(),

  stoc_type: Joi.string()
    .max(1)
    .allow(null, "")
    .optional(),

  in_license: Joi.string().max(30).allow(null, "").optional(),
  tax: Joi.number().precision(4).allow(null).optional(),
  add_tax: Joi.number().precision(4).allow(null).optional(),
  sum_qty: Joi.number().precision(4).allow(null).optional(),
  sum_money: Joi.number().precision(4).allow(null).optional(),
  peice: Joi.number().precision(4).allow(null).optional(),
  ac_chgeno: Joi.string().max(200).allow(null, "").optional(),
  mark: Joi.string().max(1).default("A").optional(),

  // ========== USER INPUT FIELDS ==========
  ac_date: Joi.date().allow(null).empty('').default(null).optional(),
  ac_outer: Joi.string().max(600).allow(null, "").optional(),
  rec_addr: Joi.string().max(600).allow(null, "").optional(),
  rec_person: Joi.string().max(600).allow(null, "").optional(),
  in_curr: Joi.string().max(30).allow(null, "").optional(),
  in_settle: Joi.string().max(30).allow(null, "").optional(),
  out_org: Joi.string().max(600).allow(null, "").optional(),
  out_license: Joi.string().max(30).allow(null, "").optional(),
  out_date: Joi.date().allow(null).empty('').default(null).optional(),
  out_vdate: Joi.date().allow(null).empty('').default(null).optional(),
  in_vdate: Joi.date().allow(null).empty('').default(null).optional(),
  vat_invoice: Joi.string().max(200).allow(null, "").optional(),
  com_invoice: Joi.string().max(200).allow(null, "").optional(),
  ac_chgo: Joi.string().max(60).allow(null, "").optional(),
  ac_chgn: Joi.string().max(60).allow(null, "").optional(),
  ac_chgs: Joi.string().max(60).allow(null, "").optional(),
  ex_user: Joi.string().max(200).allow(null, "").optional(),
  col1: Joi.string().max(200).allow(null, "").optional(),
  col2: Joi.string().max(200).allow(null, "").optional(),
  com_date: Joi.date().allow(null).empty('').default(null).optional(),
  vat_date: Joi.date().allow(null).empty('').default(null).optional(),
  min_cont: Joi.string().max(200).allow(null, "").optional(),
  js_no: Joi.string().max(200).allow(null, "").optional(),
  js_date: Joi.date().allow(null).empty('').default(null).optional(),
  soso: Joi.string().max(200).allow(null, "").optional(),

  // ========== UNUSED FIELDS ==========
  oth_cost: Joi.number().precision(4).allow(null).optional(),
  suttle: Joi.number().precision(4).allow(null).optional(),
  col3: Joi.string().max(200).allow(null, "").optional(),
  col4: Joi.string().max(200).allow(null, "").optional(),
  col6: Joi.string().max(200).allow(null, "").optional(),
  in_port: Joi.string().max(200).allow(null, "").optional(),
  unload_port: Joi.string().max(200).allow(null, "").optional(),
  b_unit: Joi.string().max(30).allow(null, "").optional(),
  trans_date: Joi.date().allow(null).empty('').default(null).optional(),
  arr_date: Joi.date().allow(null).empty('').default(null).optional(),
  out_country: Joi.string().max(200).allow(null, "").optional(),
  deliver: Joi.string().max(600).allow(null, "").optional(),
  complete_type: Joi.string().max(1).allow(null, "").optional(),
  ac_type: Joi.string().max(1).allow(null, "").optional(),
  ac_inner: Joi.string().max(600).allow(null, "").optional(),
  vend_no: Joi.string().max(200).allow(null, "").optional(),

  // ========== SYSTEM FIELDS ==========
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null, "").optional(),
  grt_user: Joi.string().max(30).allow(null, "").optional(),
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null, "").optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  locked_information: Joi.string().max(600).allow(null, "").optional(),
});

module.exports = createAcProcMSchema;
