const express = require("express");

const {
  exportExcelVwAcCI,
  copyCont,
  extendCont,
  confirmExtendCont,
  getCont,
  fetchFieldDropdown,
  fetchInCont,
  fetchInAcno,
  getAllVwAcChgsum,
  searchVwAcChgSum,
  exportExcelOutVwAcChgsum,
  verifyRemain,
  updateQty,
  restoreS,
} = require("./vw_ac_chgsum.controller");

const vwAcChgSumRouter = express.Router();

vwAcChgSumRouter.get("/list_of_chg_sum", getAllVwAcChgsum);
vwAcChgSumRouter.get("/cont_no", getCont);
vwAcChgSumRouter.get("/in_acno", fetchInAcno);
vwAcChgSumRouter.get("/in_cont", fetchInCont);
vwAcChgSumRouter.get("/dropdown_field", fetchFieldDropdown);
vwAcChgSumRouter.post("/search", searchVwAcChgSum);
vwAcChgSumRouter.post("/excel", exportExcelVwAcCI);
vwAcChgSumRouter.post("/out_excel", exportExcelOutVwAcChgsum);
vwAcChgSumRouter.get("/copy", copyCont);
vwAcChgSumRouter.post("/extend", extendCont);
vwAcChgSumRouter.get("/confirm-extend", confirmExtendCont);
vwAcChgSumRouter.get("/verify_remain", verifyRemain);
vwAcChgSumRouter.get("/update_qty", updateQty);
vwAcChgSumRouter.get("/restore_status", restoreS);
module.exports = vwAcChgSumRouter;
