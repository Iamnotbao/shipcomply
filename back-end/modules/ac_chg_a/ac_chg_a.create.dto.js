const Joi = require("joi");

const createAcChgASchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  ac_no: Joi.string().max(200).required(),
  seq: Joi.number().precision(2).optional(),
  desc_item: Joi.string().max(600).allow(null).empty('').default(null).optional(),
  ori: Joi.string().max(600).allow(null).empty('').default(null).optional(),
  addo: Joi.string().max(600).allow(null).empty('').default(null).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  grt_user: Joi.string().max(20).allow(null).empty('').default(null).optional(),
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = {
  createAcChgASchema,
};