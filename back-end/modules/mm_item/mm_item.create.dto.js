const Joi = require("joi");

const createMmItemSchema = Joi.object({
  // ========== PRIMARY KEY ==========
  item_no: Joi.string().max(30).required(),
  org_id: Joi.string().max(30).required(),

  // ========== BASIC INFO ==========
  name_s: Joi.string().max(200).allow(null, "").optional(),
  name_t: Joi.string().max(200).allow(null, "").optional(),
  name_e: Joi.string().max(200).allow(null, "").optional(),
  name_j_t: Joi.string().max(200).allow(null, "").optional(),
  name_j_s: Joi.string().max(200).allow(null, "").optional(),
  name_j_e: Joi.string().max(200).allow(null, "").optional(),

  // ========== UNIT INFO ==========
  unit: Joi.string().max(30).required(),
  bom_unit: Joi.string().max(30).allow(null, "").optional(),
  b_u: Joi.number().precision(4).allow(null, "").optional(),

  // ========== TYPE & CLASSIFICATION ==========
  source_type: Joi.string().max(30).allow(null, "").optional(),
  kind_type: Joi.string().max(30).allow(null, "").optional(),
  item_type: Joi.string().max(30).allow(null, "").optional(),
  purpose: Joi.string().max(30).allow(null, "").optional(),
  item_group: Joi.string().max(30).allow(null, "").optional(),
  item_attribute: Joi.string().max(30).allow(null, "").optional(),
  item_brand: Joi.string().max(30).allow(null, "").optional(),

  // ========== PHOTO ==========
  photo: Joi.string().allow(null, "").optional(),

  // ========== PRICING INFO ==========
  money_unit: Joi.string().max(30).allow(null, "").optional(),
  unit_price: Joi.number().precision(4).allow(null, "").optional(),

  // ========== VERSION & VALIDITY ==========
  ver: Joi.string().max(30).allow(null, "").optional(),
  valid_date: Joi.date().allow(null, "").optional(),
  unval_date: Joi.date().allow(null, "").optional(),

  // ========== WORKWAY & CUSTOM COLUMNS ==========
  wkwy_id: Joi.string().max(30).allow(null, "").optional(),
  column1: Joi.string().max(200).allow(null, "").optional(),
  column2: Joi.string().max(200).allow(null, "").optional(),
  column3: Joi.string().max(200).allow(null, "").optional(),
  column4: Joi.string().max(200).allow(null, "").optional(),
  column5: Joi.string().max(200).allow(null, "").optional(),
  column6: Joi.string().max(200).allow(null, "").optional(),
  column7: Joi.string().max(200).allow(null, "").optional(),
  column8: Joi.string().max(200).allow(null, "").optional(),
  column9: Joi.string().max(200).allow(null, "").optional(),
  column10: Joi.string().max(200).allow(null, "").optional(),

  // ========== RECORD & STATUS ==========
  rec_id: Joi.string().max(30).allow(null, "").optional(),
  status: Joi.number().integer().default(1).optional(),

  // ========== AUDIT INFO ==========
  grt_dept: Joi.string().max(30).allow(null, "").optional(),
  grt_user: Joi.string().max(30).allow(null, "").optional(),
  last_user: Joi.string().max(30).allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),

  // ========== ACCOUNTING ==========
  acct_id: Joi.string().max(30).allow(null, "").optional(),
  is_cost: Joi.number().integer().allow(null, "").optional(),

  // ========== VENDOR & CUSTOMER ==========
  vend_no: Joi.string().max(30).allow(null, "").optional(),
  cust_id: Joi.string().max(30).allow(null, "").optional(),
  cust_prod: Joi.string().max(30).allow(null, "").optional(),

  // ========== COLOR & MOLD ==========
  src: Joi.string().max(30).allow(null, "").optional(),
  cust_color: Joi.string().max(30).allow(null, "").optional(),
  color_no: Joi.string().max(30).allow(null, "").optional(),
  d_color: Joi.string().max(30).allow(null, "").optional(),
  t_color: Joi.string().max(30).allow(null, "").optional(),
  mold: Joi.string().max(30).allow(null, "").optional(),

  // ========== DIMENSIONS & WEIGHT ==========
  size_group: Joi.string().max(30).allow(null, "").optional(),
  size_kind: Joi.string().max(30).allow(null, "").optional(),
  unit_weight: Joi.number().precision(4).allow(null, "").optional(),
  weight: Joi.number().precision(4).allow(null, "").optional(),
  length: Joi.number().precision(4).allow(null, "").optional(),
  width: Joi.number().precision(4).allow(null, "").optional(),
  high: Joi.number().precision(4).allow(null, "").optional(),

  // ========== NOTES & REMARKS ==========
  note: Joi.string().max(600).allow(null, "").optional(),
  remark: Joi.string().max(600).allow(null, "").optional(),
  r_note: Joi.string().max(600).allow(null, "").optional(),

  // ========== DATES ==========
  last_proddate: Joi.date().allow(null, "").optional(),
  operation_date: Joi.date().allow(null, "").optional(),
  create_date: Joi.date().allow(null, "").optional(),
  cr_date: Joi.date().allow(null, "").optional(),

  // ========== CONFIRMATION ==========
  is_confirm: Joi.number().integer().allow(null, "").optional(),
  confirm_date: Joi.date().allow(null, "").optional(),
  confirm_user: Joi.string().max(30).allow(null, "").optional(),

  // ========== PRODUCT INFO ==========
  out_itemno: Joi.string().max(30).allow(null, "").optional(),
  rb_prod: Joi.string().max(30).allow(null, "").optional(),
  rpu_prod: Joi.string().max(30).allow(null, "").optional(),
  is_xn: Joi.number().integer().allow(null, "").optional(),
  attr_no: Joi.string().max(30).allow(null, "").optional(),

  // ========== INVENTORY ==========
  safe_qty: Joi.number().precision(4).allow(null, "").optional(),

  // ========== TARIFF & CODES ==========
  tariffs: Joi.string().max(30).allow(null, "").optional(),
  mk_type: Joi.string().max(30).allow(null, "").optional(),
  ts_code: Joi.string().max(30).allow(null, "").optional(),
  other_code: Joi.string().max(30).allow(null, "").optional(),

  // ========== MISC ==========
  zipname: Joi.string().max(200).allow(null, "").optional(),
  spg_no: Joi.string().max(30).allow(null, "").optional(),
  order_sizerange: Joi.string().max(30).allow(null, "").optional(),

  // ========== SAP INTEGRATION ==========
  sap_dispo: Joi.string().max(30).allow(null, "").optional(),
  sap_dismm: Joi.string().max(30).allow(null, "").optional(),
  sap_sbdkz: Joi.string().max(30).allow(null, "").optional(),
  sap_lgpro: Joi.string().max(30).allow(null, "").optional(),
  sap_status: Joi.string().max(30).allow(null, "").optional(),
  sap_rgekz: Joi.string().max(30).allow(null, "").optional(),
  sap_item_type: Joi.string().max(30).allow(null, "").optional(),
  sap_last_no: Joi.string().max(30).allow(null, "").optional(),
  sap_art_remark: Joi.string().max(600).allow(null, "").optional(),
  sap_midsole: Joi.string().max(30).allow(null, "").optional(),
  sap_art_remark2: Joi.string().max(600).allow(null, "").optional(),
});

module.exports = createMmItemSchema;
