const express = require("express");
const {
  generateAcno,
  addAcChgM,
  editAcChgM,
  getAcChgMByID,
  activateAcCM,
  cancelActivateAcCM,
  closeAcCM,
  voidAllAcCM,
  exportExcelAcChgM,
  activateAcCMExp,
  cancelActivateAcCMExp,
  voidAllAcCMExp,
  refreshGrossW,
  confirmPassD,
  exportExcelAcChgMToTransfer,
  exportPDFChgDToExcel,
  exportPDFChgDToExcelWithName,
  exportPDFItems,
  getFieldDropdown,
  confirmAll,
  checkDuplicateAGO,
} = require("./ac_chg_m.controller");

const acChgMRouter = express.Router();

acChgMRouter.get("/ac_no", generateAcno);
// acChgMRouter.get("/all", getAllAcInmM);
acChgMRouter.get("/", getAcChgMByID);
acChgMRouter.get("/field_dropdown", getFieldDropdown);
acChgMRouter.post("/excel", exportExcelAcChgM);
acChgMRouter.post("/excel_transfer", exportExcelAcChgMToTransfer);
acChgMRouter.post("/pdf_chg_d_name", exportPDFChgDToExcelWithName);
acChgMRouter.get("/pdf_item_details", exportPDFItems);
acChgMRouter.get("/pdf_chg_d", exportPDFChgDToExcel);
// acChgMRouter.post("/search", searchAcInmM);
acChgMRouter.post("/", addAcChgM);
acChgMRouter.put("/edit", editAcChgM);
acChgMRouter.get("/activate", activateAcCM);
acChgMRouter.get("/cancel_activate", cancelActivateAcCM);
acChgMRouter.get("/close", closeAcCM);
acChgMRouter.get("/void", voidAllAcCM);
acChgMRouter.get("/activate_exp", activateAcCMExp);
acChgMRouter.get("/cancel_activate_exp", cancelActivateAcCMExp);
acChgMRouter.get("/void_exp", voidAllAcCMExp);
acChgMRouter.get("/refresh_gross", refreshGrossW);
acChgMRouter.get("/confirm_pass_date", confirmPassD);
acChgMRouter.get("/confirm_all", confirmAll);
acChgMRouter.get("/check_ago", checkDuplicateAGO);
module.exports = acChgMRouter;
