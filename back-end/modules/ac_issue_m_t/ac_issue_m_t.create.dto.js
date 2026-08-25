const Joi = require("joi");

const createAcIssueMSchema = Joi.object({
  factory_code:       Joi.string().max(30).required(),
  conf_seq:           Joi.number().precision(2).required(),
  ac_no:              Joi.string().max(200).allow(null, "").default(null).optional(),
  conf_date:          Joi.date().allow(null).empty("").default(null).optional(),
  lock_date:          Joi.date().allow(null).empty("").default(null).optional(),
  lock_seq:           Joi.number().precision(2).allow(null).default(null).optional(),
  acbom_no:           Joi.string().max(200).allow(null, "").default(null).optional(),
  col1:               Joi.string().max(200).allow(null, "").default(null).optional(),
  col2:               Joi.string().max(200).allow(null, "").default(null).optional(),
  col3:               Joi.string().max(200).allow(null, "").default(null).optional(),
  col4:               Joi.date().allow(null).empty("").default(null).optional(),
  col5:               Joi.date().allow(null).empty("").default(null).optional(),
  ac_shoeid:          Joi.string().max(200).allow(null, "").default(null).optional(),
  money:              Joi.number().precision(4).allow(null).default(null).optional(),
  prod_money:         Joi.number().precision(4).allow(null).default(null).optional(),
  percent:            Joi.number().precision(2).allow(null).default(null).optional(),
  status:             Joi.number().integer().default(1).optional(),
  grt_dept:           Joi.string().max(30).allow(null, "").default(null).optional(),
  grt_user:           Joi.string().max(30).allow(null, "").default(null).optional(),
  grt_date:           Joi.date().allow(null).empty("").default(null).optional(),
  last_user:          Joi.string().max(30).allow(null, "").default(null).optional(),
  last_date:          Joi.date().allow(null).empty("").default(null).optional(),
  locked_information: Joi.string().max(600).allow(null, "").default(null).optional(),
});

module.exports = createAcIssueMSchema;