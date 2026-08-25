const Joi = require("joi");

const createSeShipingMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  cust_id: Joi.string().max(200).required(),
  si_seq: Joi.number().precision(2).allow(null, "").default(null),
  start_date: Joi.date().allow(null).empty("").default(null).optional(),
  end_date: Joi.date().allow(null).empty("").default(null).optional(),
  note: Joi.string().max(600).allow(null, "").default(null),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_user: Joi.string().max(20).allow(null).empty("").default(null).optional(),
  grt_date: Joi.date().allow(null).empty("").default(null).optional(),
  last_user: Joi.string()
    .max(30)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
  last_date: Joi.date().allow(null).empty("").default(null).optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
});

module.exports = createSeShipingMSchema;
