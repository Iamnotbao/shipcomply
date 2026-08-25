const express = require("express");
const {
  exportPDFABM,
  exportMaterialToExcel,
  exportCustomToExcel,
  deleteABM,
  exportPDFTest,
  getAllACM,
  getACMByID,
  addACM,
  editACM,
  searchACM,
  getFieldDropdown,
  exportExcelShipOrder,
  generateCoid,
} = require("./ac_co_m.controller");

const acCoMRouter = express.Router();

acCoMRouter.get("/all", getAllACM);
acCoMRouter.get("/pdf", exportPDFABM);
acCoMRouter.get("/pdf_test", exportPDFTest);
acCoMRouter.post("/material-excel", exportMaterialToExcel);
acCoMRouter.post("/custom-excel", exportCustomToExcel);
acCoMRouter.get("/", getACMByID);
acCoMRouter.get("/co_id", generateCoid);
acCoMRouter.get("/field_dropdown", getFieldDropdown);
acCoMRouter.post("/", addACM);
acCoMRouter.put("/edit", editACM);
acCoMRouter.delete("/", deleteABM);
acCoMRouter.post("/search", searchACM);
acCoMRouter.post("/excel", exportExcelShipOrder);
module.exports = acCoMRouter;
