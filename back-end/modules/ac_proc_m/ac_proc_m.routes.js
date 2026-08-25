const express = require("express");
const {
  generateAcno,
  getAcProcMByID,
  activateAcPM,
  cancelActivateAcPM,
  closeAcPM,
  voidAllAcPM,
  getAllAcProcM,
  addAcProcM,
  editAcProcM,
  searchAcProcM,
  exportExcelAcProcM,
  getAllAcProcMMarkB,
  searchAcProcMForMarkB,
  activateAcPMMarkB,
  cancelActivateAcPMMarkB,
  closeAcPMMarkB,
  voidAllAcPMMarkB,
  exportExcelAcProcMMarkB,
  confirmAll,
  checkDuplicateAGEO,
} = require("./ac_proc_m.controller");

const acProcMRouter = express.Router();

acProcMRouter.get("/ac_no", generateAcno);
acProcMRouter.get("/all", getAllAcProcM);
acProcMRouter.get("/mark_b_all", getAllAcProcMMarkB);
acProcMRouter.get("/", getAcProcMByID);
acProcMRouter.post("/excel", exportExcelAcProcM);
acProcMRouter.post("/excel_mark_b", exportExcelAcProcMMarkB);
acProcMRouter.post("/search", searchAcProcM);
acProcMRouter.post("/search_mark_b", searchAcProcMForMarkB);
acProcMRouter.post("/", addAcProcM);
acProcMRouter.put("/edit", editAcProcM);
acProcMRouter.get("/activate", activateAcPM);
acProcMRouter.get("/cancel_activate", cancelActivateAcPM);
acProcMRouter.get("/close", closeAcPM);
acProcMRouter.get("/void", voidAllAcPM);
acProcMRouter.get("/activate_mark_b", activateAcPMMarkB);
acProcMRouter.get("/cancel_activate_mark_b", cancelActivateAcPMMarkB);
acProcMRouter.get("/close_mark_b", closeAcPMMarkB);
acProcMRouter.get("/void_mark_b", voidAllAcPMMarkB);
acProcMRouter.get("/confirm_all", confirmAll);
acProcMRouter.get("/check_ageo", checkDuplicateAGEO);
module.exports = acProcMRouter;
