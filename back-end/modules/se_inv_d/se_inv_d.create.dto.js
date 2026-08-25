
const Joi = require("joi");

const createSeInvMSchema = Joi.object({
  factory_code:      Joi.string().max(30).required(),
  ac_no:             Joi.string().max(200).required(),
  invoice_id:        Joi.string().max(200).required(),
  invoice_no:        Joi.string().max(200).allow(null, "").default(null).optional(),
  invoice_date:      Joi.date().allow(null).empty("").default(null).optional(),
  account_addr:      Joi.string().max(600).allow(null, "").default(null).optional(),
  per:               Joi.string().max(200).allow(null, "").default(null).optional(),
  fcr_date:          Joi.date().allow(null).empty("").default(null).optional(),
  sailing_date:      Joi.date().allow(null).empty("").default(null).optional(),
  exp_port:          Joi.string().max(30).allow(null, "").default(null).optional(),
  dest_port:         Joi.string().max(30).allow(null, "").default(null).optional(),
  bank_name:         Joi.string().max(600).allow(null, "").default(null).optional(),
  payment:           Joi.string().max(30).allow(null, "").default(null).optional(),
  trade:             Joi.string().max(30).allow(null, "").default(null).optional(),
  sort:              Joi.string().max(30).allow(null, "").default(null).optional(),
  nw:                Joi.number().precision(4).allow(null, "").default(null).optional(),
  gw:                Joi.number().precision(4).allow(null, "").default(null).optional(),
  goods_desc:        Joi.string().max(600).allow(null, "").default(null).optional(),
  shipment_no:       Joi.string().max(30).allow(null, "").default(null).optional(),
  submission_date:   Joi.date().allow(null).empty("").default(null).optional(),
  hs_code:           Joi.string().max(200).allow(null, "").default(null).optional(),
  cdc_no:            Joi.string().max(200).allow(null, "").default(null).optional(),
  cdc_date:          Joi.date().allow(null).empty("").default(null).optional(),
  via:               Joi.string().max(30).allow(null, "").default(null).optional(),
  status:            Joi.number().integer().default(1).optional(),
  grt_dept:          Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_user:          Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_date:          Joi.date().allow(null).empty("").default(null).optional(),
  last_user:         Joi.string().max(30).allow(null).empty("").default(null).optional(),
  last_date:         Joi.date().allow(null).empty("").default(null).optional(),
  locked_information:Joi.string().max(600).allow(null).empty("").default(null).optional(),
});

module.exports = createSeInvMSchema;