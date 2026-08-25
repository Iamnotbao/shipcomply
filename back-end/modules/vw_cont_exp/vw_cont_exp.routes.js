const express = require("express");

const {
  searchVwAcContImp,
  exportExcelVwAcCI,
  getCIContract,
  copyCont,
  extendCont,
  confirmExtendCont,
  getCont,
  fetchFieldDropdown,
  fetchMinCont,
  fetchInCont,
  updateLastExpDate,
} = require("./vw_cont_exp.controller");

const vwAcContExpRouter = express.Router();

vwAcContExpRouter.get("/list_of_setting_cont_exp", getCIContract);
vwAcContExpRouter.get("/cont_no", getCont);
vwAcContExpRouter.get("/min_cont", fetchMinCont);
vwAcContExpRouter.get("/in_cont", fetchInCont);
vwAcContExpRouter.get("/dropdown_field", fetchFieldDropdown);
vwAcContExpRouter.post("/search", searchVwAcContImp);
vwAcContExpRouter.post("/excel", exportExcelVwAcCI);
vwAcContExpRouter.get("/copy", copyCont);
vwAcContExpRouter.post("/extend", extendCont);
vwAcContExpRouter.post("/update_last_exp_date", updateLastExpDate);
vwAcContExpRouter.get("/confirm-extend", confirmExtendCont);
module.exports = vwAcContExpRouter;
