const express = require("express");
const {
  getAcImpByID,
  addAcImp,
  editAcImp,
  deleteAcImp,
  searchAcImp,
  getAllAcImp,
  exportCustomToExcel,
  exportMaterialToExcel,
  exportExcelAcImp,
  getFieldDropDown,
  getCom,
  getSort,
  getCol4,
} = require("./ac_imp_material_tracking.controller");

const acImpMaterialTrackingRouter = express.Router();

acImpMaterialTrackingRouter.get("/all", getAllAcImp);
acImpMaterialTrackingRouter.get("/excel", exportExcelAcImp);
acImpMaterialTrackingRouter.get("/com_invoice", getCom);
acImpMaterialTrackingRouter.get("/col4", getCol4);
acImpMaterialTrackingRouter.get("/sort", getSort);
acImpMaterialTrackingRouter.post("/material-excel", exportMaterialToExcel);
acImpMaterialTrackingRouter.post("/custom-excel", exportCustomToExcel);
acImpMaterialTrackingRouter.get("/", getAcImpByID);
acImpMaterialTrackingRouter.get("/dropdown_field", getFieldDropDown);
acImpMaterialTrackingRouter.post("/", addAcImp);
acImpMaterialTrackingRouter.put("/edit", editAcImp);
acImpMaterialTrackingRouter.delete("/", deleteAcImp);
acImpMaterialTrackingRouter.post("/search", searchAcImp);

module.exports = acImpMaterialTrackingRouter;
