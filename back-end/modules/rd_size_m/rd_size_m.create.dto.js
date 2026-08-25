const Joi = require("joi");

const createAcInMMSchema= Joi.object({
  factory_code: Joi.string().max(30).required(),
  inm_no: Joi.string().max(200).required(),
  issued_date: Joi.date().allow(null).empty('').default(null).optional(),
  expire_date: Joi.date().allow(null).empty('').default(null).optional(),
  req_no: Joi.string().max(200).allow(null,'').default(null),
  commno: Joi.string().max(200).allow(null,'').default(null),
  note: Joi.string().max(600).allow(null,'').default(null),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  grt_user: Joi.string().max(20).allow(null).empty('').default(null).optional(),
  grt_date: Joi.date().allow(null).empty('').default(null).optional(),
  last_user: Joi.string().max(30).allow(null).empty('').default(null).optional(),
  last_date: Joi.date().allow(null).empty('').default(null).optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = createAcInMMSchema;