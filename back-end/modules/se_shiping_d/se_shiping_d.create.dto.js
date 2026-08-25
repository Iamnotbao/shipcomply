const Joi = require("joi");

const createSeShippingDSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  cust_id: Joi.string().max(200).required(),
  si_seq: Joi.number().precision(2).required(),
  si_type: Joi.string()
    .max(2)
    .allow(null, "")
    .valid("1", "2", "3", "4")
    .optional(),
  bl: Joi.string().max(30).allow(null, "").optional(),
  bl_adress: Joi.string().max(600).allow(null, "").optional(),
  nb: Joi.string().max(30).allow(null, "").optional(),
  nb_adress: Joi.string().max(600).allow(null, "").optional(),
  two_nb: Joi.string().max(30).allow(null, "").optional(),
  co: Joi.string().max(600).allow(null, "").optional(),
  p_adress: Joi.string().max(600).allow(null, "").optional(),
  agent: Joi.string().max(200).allow(null, "").optional(),
  col1: Joi.string().max(200).allow(null, "").optional(),
  col2: Joi.string().max(200).allow(null, "").optional(),
  remark: Joi.string().max(600).allow(null, "").optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null, "").default(null).optional(),
  grt_user: Joi.string().max(20).allow(null, "").default(null).optional(),
  grt_date: Joi.date().allow(null, "").default(null).optional(),
  last_user: Joi.string().max(30).allow(null, "").default(null).optional(),
  last_date: Joi.date().allow(null, "").default(null).optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null, "")
    .default(null)
    .optional(),
});

module.exports = {
  createSeShippingDSchema,
};
