const express = require("express");
const {
  getAllABM,
  exportPDFABM,
  exportMaterialToExcel,
  exportCustomToExcel,
  getABMByID,
  addABM,
  editABM,
  deleteABM,
  searchABM,
  exportPDFTest,
} = require("./ac_bom_m.controller");

const acBomMRouter = express.Router();

acBomMRouter.get("/all", getAllABM);
acBomMRouter.get("/pdf", exportPDFABM);
acBomMRouter.get("/pdf_test", exportPDFTest);
acBomMRouter.post("/material-excel", exportMaterialToExcel);
acBomMRouter.post("/custom-excel", exportCustomToExcel);
acBomMRouter.get("/", getABMByID);
acBomMRouter.post("/", addABM);
acBomMRouter.put("/edit", editABM);
acBomMRouter.delete("/", deleteABM);
acBomMRouter.post("/search", searchABM);

module.exports = acBomMRouter;
