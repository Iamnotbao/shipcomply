const Joi = require("joi");

const createAcProdMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  customs_shoe_id: Joi.string().max(120).required(),
  prod_acno: Joi.string().max(120).required(),
  start_size: Joi.string().max(30).allow(null).empty("").optional(),
  s_seq: Joi.number()
    .precision(2)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  end_size: Joi.string().max(30).allow(null, "").optional(),
  e_seq: Joi.number()
    .precision(2)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  pt_per: Joi.number()
    .precision(2)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  note: Joi.string().max(600).allow(null, "").optional(),
  bang_ke_size: Joi.string().max(30).allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  grt_dept: Joi.string().max(30).allow(null, "").optional(),
  grt_user: Joi.string().max(30).allow(null, "").optional(),
  grt_date: Joi.date().allow(null).optional(),
  last_user: Joi.string().max(30).allow(null, "").optional(),
  last_date: Joi.date().allow(null).optional(),
  status: Joi.number().integer().default(1).optional(),
});

module.exports = createAcProdMSchema;
