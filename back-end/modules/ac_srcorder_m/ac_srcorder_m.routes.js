const express = require("express");

const {
  getAllAcSrcOrderM,
  getAcSrcOrderM,
  addAcSrcorderM,
  editAcSrcorderM,
  searchAcSrcorderM,
  exportExcelAcReqOrder,
  getAcSrcOrderMByField,
  exportExcelAcSrcorderM,
  getDropdownByField,
} = require("./ac_srcorder_m.controller");

const acSrcorderMRouter = express.Router();

acSrcorderMRouter.get("/all", getAllAcSrcOrderM);
// acSrcorderMRouter.get("/pdf", exportPDFAcIM);
acSrcorderMRouter.post("/order-excel", exportExcelAcReqOrder);
acSrcorderMRouter.post("/srcorder-excel", exportExcelAcSrcorderM);
acSrcorderMRouter.get("/dropdown_field", getDropdownByField);
// acSrcorderMRouter.post("/material-excel",exportMaterialToExcel );
// acSrcorderMRouter.post("/custom-excel",exportCustomToExcel);
acSrcorderMRouter.get("/", getAcSrcOrderM);
acSrcorderMRouter.get("/field", getAcSrcOrderMByField);
acSrcorderMRouter.post("/", addAcSrcorderM);
acSrcorderMRouter.put("/edit", editAcSrcorderM);
// acSrcorderMRouter.delete("/", deleteAcSrcorderM);
acSrcorderMRouter.post("/search", searchAcSrcorderM);

module.exports = acSrcorderMRouter;
