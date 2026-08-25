const Joi = require("joi");

const createSePlanSizeSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  se_id: Joi.string().max(30).required(),
  se_ver: Joi.number().precision(2).required(),
  se_seq: Joi.string().max(20).required(),
  pack_gu: Joi.number().precision(2).required(),
  ship_seq: Joi.number().precision(2).required(),
  pk_seq: Joi.number().precision(2).required(),
  sizerun: Joi.string().max(200).allow(null, "").default(null).optional(),
  ctns_pairs: Joi.number().precision(4).allow(null, "").default(null).optional(),
  ctns: Joi.number().precision(4).allow(null, "").default(null).optional(),
  plan_ctns: Joi.number().precision(4).allow(null, "").default(null).optional(),
  unqc_ctns: Joi.number().precision(4).allow(null, "").default(null).optional(),
  un_desc: Joi.string().max(30).allow(null, "").default(null).optional(),
  unqc_pairs: Joi.number().precision(4).allow(null, "").default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null, "").default(null).optional(),
  grt_user: Joi.string().max(30).allow(null, "").default(null).optional(),
  grt_date: Joi.date().allow(null).empty("").default(null).optional(),
  last_user: Joi.string().max(30).allow(null, "").default(null).optional(),
  last_date: Joi.date().allow(null).empty("").default(null).optional(),
  locked_information: Joi.string().max(600).allow(null, "").default(null).optional(),
});

module.exports = {
  createSePlanSizeSchema,
};