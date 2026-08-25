const express = require("express");

const {
  getAllVwAcSum,
  searchVwAcSum,
  exportExcel,
} = require("./vw_ac_sum.controller");

const vwAcSumRouter = express.Router();

vwAcSumRouter.get("/list_of_ac_sum", getAllVwAcSum);
vwAcSumRouter.get("/excel", exportExcel);
vwAcSumRouter.post("/search", searchVwAcSum);
module.exports = vwAcSumRouter;
