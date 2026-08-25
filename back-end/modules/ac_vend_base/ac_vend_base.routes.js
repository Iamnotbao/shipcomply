const express = require("express");
const {
  getAcIMByIA,
  getAllAcVB,
  exportPDFAcVB,
  exportExcelAcVB,
  addAcVB,
  editAcVB,
  deleteAcVB,
  searchAcVB,
  getAllAcSendByCategory,
  getAllVendNoByStatus,
  getAcVBByID,
} = require("./ac_vend_base.controller");

const acVendBaseRouter = express.Router();

acVendBaseRouter.get("/all", getAllAcVB);
acVendBaseRouter.get("/", getAcVBByID);
acVendBaseRouter.get("/pdf", exportPDFAcVB);
acVendBaseRouter.post("/excel", exportExcelAcVB);
acVendBaseRouter.get("/ac_send", getAllAcSendByCategory);
acVendBaseRouter.get("/vend_no", getAllVendNoByStatus);
acVendBaseRouter.post("/", addAcVB);
acVendBaseRouter.put("/edit", editAcVB);
acVendBaseRouter.delete("/", deleteAcVB);
acVendBaseRouter.post("/search", searchAcVB);

module.exports = acVendBaseRouter;
