const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  getAllAcIM,
  exportPDFAcIM,
  getAcIMByID,
  addAcIM,
  editAcIM,
  deleteAcIM,
  searchAcIM,
  exportExcelAcIM,
  getAcIMByIA,
  fetchGroupFieldDrop,
  fetchFieldWithFunction,
  importExcel,
} = require("./ac_item_m.controller");

const acItemMRouter = express.Router();

acItemMRouter.get("/all", getAllAcIM);
acItemMRouter.get("/pdf", exportPDFAcIM);
acItemMRouter.post("/excel", exportExcelAcIM);
acItemMRouter.get("/item", getAcIMByIA);
acItemMRouter.get("/dropdown_group_field",fetchGroupFieldDrop);
acItemMRouter.get("/field_with_function",fetchFieldWithFunction); 
// acItemMRouter.post("/material-excel",exportMaterialToExcel );
// acItemMRouter.post("/custom-excel",exportCustomToExcel);
acItemMRouter.get("/", getAcIMByID);
acItemMRouter.post("/", addAcIM);
acItemMRouter.put("/edit", editAcIM);
acItemMRouter.delete("/", deleteAcIM);
acItemMRouter.post("/search", searchAcIM);
acItemMRouter.post("/import", upload.single("import_file"), importExcel);

module.exports = acItemMRouter;
