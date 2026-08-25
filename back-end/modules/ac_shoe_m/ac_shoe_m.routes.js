const express = require("express");
const {
  getAllAcIM,
  exportPDFAcIM,
  getAcIMByID,
  addAcIM,
  editAcIM,
  deleteAcIM,
  searchAcIM,
  getAllAcShoe,
  exportPDFAcShoeM,
  getAcShoeMByID,
  addAcShoeM,
  editAcShoeM,
  deleteAcShoeM,
  searchAcShoeM,
  getAcShoeMBySize,
  getAllAcShoeWithProdRef,
  exportExcelAcShoeM,
  linkToBom,
  getAcItemnoDropdown,
  getShoeDropdown,
  importExcel,
} = require("./ac_shoe_m.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const acShoeMRouter = express.Router();

acShoeMRouter.get("/all", getAllAcShoe);
acShoeMRouter.get("/list_of_prod_ref", getAllAcShoeWithProdRef);
acShoeMRouter.get("/excel", exportExcelAcShoeM);
acShoeMRouter.get("/ac_itemno_dropdown", getAcItemnoDropdown);
acShoeMRouter.get("/shoe_dropdown", getShoeDropdown);
// acShoeMRouter.post("/material-excel",exportMaterialToExcel );
// acShoeMRouter.post("/custom-excel",exportCustomToExcel);
acShoeMRouter.get("/", getAcShoeMByID);
acShoeMRouter.get("/size", getAcShoeMBySize);
acShoeMRouter.get("/link_bom", linkToBom);
acShoeMRouter.post("/", addAcShoeM);
acShoeMRouter.put("/edit", editAcShoeM);
acShoeMRouter.delete("/", deleteAcShoeM);
acShoeMRouter.post("/search", searchAcShoeM);
acShoeMRouter.post("/import", upload.single("import_file"), importExcel);

module.exports = acShoeMRouter;
