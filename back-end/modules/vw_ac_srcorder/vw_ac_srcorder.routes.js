const express = require("express");
const {
  getListOfAcSrcorder,
  exportCustomToExcel,
  exportMaterialToExcel,
  searchVwAcSrcorder,
  checkBoxL,
  confirmAll,
  getPlanMax,
  getRD,
  updateCus,
  updateBlQty,
  clearRD,
} = require("./vw_ac_srcorder.controller");

const acSrcorderRouter = express.Router();

acSrcorderRouter.get("/list_of_ac_srcorder", getListOfAcSrcorder);
acSrcorderRouter.get("/pdf", exportCustomToExcel);
acSrcorderRouter.get("/session", getRD);
acSrcorderRouter.get("/clear_session", clearRD);
acSrcorderRouter.get("/plan_iqty", getPlanMax);
acSrcorderRouter.post("/bl_qty", updateBlQty);
acSrcorderRouter.post("/material-excel", exportMaterialToExcel);
acSrcorderRouter.post("/custom-excel", exportCustomToExcel);
acSrcorderRouter.post("/search", searchVwAcSrcorder);
acSrcorderRouter.post("/check-left", checkBoxL);
acSrcorderRouter.get("/confirm-all", confirmAll);
acSrcorderRouter.put("/update-custom", updateCus);

module.exports = acSrcorderRouter;
