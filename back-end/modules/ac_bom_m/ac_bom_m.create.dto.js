const Joi = require("joi");

const createAcBomMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  prod_acno: Joi.string().max(120).required(),
  item_acno: Joi.string().max(120).required(),
  unit_qty: Joi.number().allow(null).empty("").default(null).optional(),
  loss_per: Joi.number().allow(null).empty("").default(null).optional(),
  fact_qty: Joi.number().allow(null).empty("").default(null).optional(),
  ac_type: Joi.string().max(30).allow(null,"").optional(),
  note: Joi.string().max(600).allow(null).empty("").optional(),
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

module.exports = createAcBomMSchema;
