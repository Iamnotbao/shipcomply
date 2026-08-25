const express = require("express");

const {
  getListOfCI,
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
  fetchGroupFieldDataDropdown,
  updateLastExpDate,
} = require("./vw_cont_imp.controller");

const vwAcContImpRouter = express.Router();

vwAcContImpRouter.post("/list_of_cont_imp", getListOfCI);
vwAcContImpRouter.get("/list_of_setting_cont_imp", getCIContract);
vwAcContImpRouter.get("/cont_no", getCont);
vwAcContImpRouter.get("/min_cont", fetchMinCont);
vwAcContImpRouter.get("/in_cont", fetchInCont);
vwAcContImpRouter.get("/dropdown_field", fetchFieldDropdown);
vwAcContImpRouter.get("/dropdown_group_field", fetchGroupFieldDataDropdown);
vwAcContImpRouter.post("/search", searchVwAcContImp);
vwAcContImpRouter.post("/excel", exportExcelVwAcCI);
vwAcContImpRouter.get("/copy", copyCont);
vwAcContImpRouter.post("/update_last_exp_date", updateLastExpDate);
vwAcContImpRouter.post("/extend", extendCont);
vwAcContImpRouter.get("/confirm-extend", confirmExtendCont);
module.exports = vwAcContImpRouter;
