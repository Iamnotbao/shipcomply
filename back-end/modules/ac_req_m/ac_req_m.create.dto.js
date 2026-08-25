const Joi = require("joi");

const createAcReqMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  req_no: Joi.string().max(30).required(),
  req_date: Joi.date().allow(null).empty("").optional(),
  invoice_no: Joi.string().max(200).allow(null).empty("").optional(),
  ac_no:  Joi.string().max(200).allow(null).empty("").optional(),
  vend_no: Joi.string().max(200).allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(20).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  status: Joi.number().optional(),
});

module.exports = createAcReqMSchema;
