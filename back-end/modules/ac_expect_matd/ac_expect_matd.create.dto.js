const Joi = require("joi");

const createAcExpectMATDSchema = Joi.object({
  factory_code:       Joi.string().max(30).required(),
  expect_id:          Joi.number().integer().required(),
  seq:                Joi.number().precision(2).required(),
  matd_no:            Joi.string().max(200).allow(null, "").default(null).optional(),
  loss_per:           Joi.number().precision(2).allow(null).default(null).optional(),
  expect_qty:         Joi.number().precision(4).allow(null).default(null).optional(),
  left_qty:           Joi.number().precision(4).allow(null).default(null).optional(),
  issue_qty:          Joi.number().precision(4).allow(null).default(null).optional(),
  draw_qty:           Joi.number().precision(4).allow(null).default(null).optional(),
  col1:               Joi.string().max(200).allow(null, "").default(null).optional(),
  col2:               Joi.string().max(200).allow(null, "").default(null).optional(),
  col3:               Joi.date().allow(null).empty("").default(null).optional(),
  col4:               Joi.date().allow(null).empty("").default(null).optional(),
  status:             Joi.number().integer().default(7).optional(),
  grt_dept:           Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_user:           Joi.string().max(30).allow(null).empty("").default(null).optional(),
  grt_date:           Joi.date().allow(null).empty("").default(null).optional(),
  last_user:          Joi.string().max(30).allow(null).empty("").default(null).optional(),
  last_date:          Joi.date().allow(null).empty("").default(null).optional(),
  locked_information: Joi.string().max(600).allow(null, "").default(null).optional(),
});

module.exports = {createAcExpectMATDSchema};