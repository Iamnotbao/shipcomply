const Joi = require("joi");

const createAcItemMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  item_acno: Joi.string().max(120).required(),
  item_acname_l: Joi.string().max(600).allow(null, "").optional(),
  item_acname_t: Joi.string().max(600).allow(null, "").optional(),
  item_acname_e: Joi.string().max(600).allow(null, "").optional(),
  ac_item: Joi.string().max(200).allow(null,"").optional(),
  unit: Joi.string().max(30).allow(null, "").optional(),
  tax_per: Joi.number().allow(null).empty("").default(null).optional(),
  loss_per: Joi.number().allow(null).empty("").default(null).optional(),
  ac_type: Joi.string().max(30).allow(null, "").optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null, "").optional(),
  grt_user: Joi.string().max(20).allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().max(30).allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
});

module.exports = createAcItemMSchema;
