const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  getAllSePlanOrd,
  searchSePlanOrd,
  getShipSeq,
  getCBM,
  addSePlanOrd,
  editSePlanOrd,
  getSePlanOrdByID,
  deleteSePlanOrd,
  getAllPlanOrd,
  searchPD,
  getAllSePlanOrdLink,
  searchSePlanOrdLink,
  getAllFieldDropdown,
  checkBoxItem,
  getTempTable,
  clearTempTable,
  confirmCheckBox,
  recreateTempTable,
  getTempTextTable,
  clearTempTextTable,
  importExcel,
  exportExcel,
  exportMaterialToExcel,
  exportEndMaterialToExcel,
  exportShipOrderToExcel,
  exportToPP026Excel,
  confirm,
} = require("./se_plan_ord.controller");

const sePlanOrdRouter = express.Router();

sePlanOrdRouter.get("/all", getAllSePlanOrd);
sePlanOrdRouter.get("/all_link", getAllSePlanOrdLink);
sePlanOrdRouter.get("/field_dropdown", getAllFieldDropdown);
sePlanOrdRouter.get("/plan_date", getAllPlanOrd);
sePlanOrdRouter.get("/ship_seq", getShipSeq);
sePlanOrdRouter.get("/cbm", getCBM);
sePlanOrdRouter.get("/", getSePlanOrdByID);
sePlanOrdRouter.post("/confirm_all_check", confirmCheckBox);
sePlanOrdRouter.post("/check_box", checkBoxItem);
sePlanOrdRouter.get("/temp_table", getTempTable);
sePlanOrdRouter.get("/confirm_all", confirm);
sePlanOrdRouter.get("/clear_temp_table", clearTempTable);
sePlanOrdRouter.get("/temp_text_table", getTempTextTable);
sePlanOrdRouter.get("/clear_temp_text_table", clearTempTextTable);
sePlanOrdRouter.get("/recreate_temp_table", recreateTempTable);
sePlanOrdRouter.post("/import", upload.single("import_file"), importExcel);
sePlanOrdRouter.post("/export_excel", exportExcel);
sePlanOrdRouter.post("/export_excel_material", exportMaterialToExcel);
sePlanOrdRouter.post("/export_excel_end_material", exportEndMaterialToExcel);
sePlanOrdRouter.post("/export_excel_ship_order", exportShipOrderToExcel);
sePlanOrdRouter.post("/export_excel_pp026", exportToPP026Excel);
sePlanOrdRouter.post("/search", searchSePlanOrd);
sePlanOrdRouter.post("/search_plan_date", searchPD);
sePlanOrdRouter.post("/search_link", searchSePlanOrdLink);
sePlanOrdRouter.post("/", addSePlanOrd);
sePlanOrdRouter.put("/edit", editSePlanOrd);
sePlanOrdRouter.delete("/", deleteSePlanOrd);

module.exports = sePlanOrdRouter;
