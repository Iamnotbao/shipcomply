const Joi = require("joi");

const searchVwSalesShSchema = Joi.object({
  // Filters (tất cả optional cho search)
  send_corp:  Joi.string().max(30).allow(null, "").default(null).optional(),
  sales_no:   Joi.string().max(30).allow(null, "").default(null).optional(), // col2
  send_type:  Joi.string().max(36).allow(null, "").default(null).optional(),
  se_id:      Joi.string().allow(null, "").default(null).optional(),
  status:     Joi.number().integer().allow(null, "").default(null).optional(),
  s_date_1:   Joi.date().allow(null).empty("").default(null).optional(),
  e_date_1:   Joi.date().allow(null).empty("").default(null).optional(),
});

module.exports = searchVwSalesShSchema;