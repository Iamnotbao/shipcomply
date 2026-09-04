const express = require("express");
const {
  getAllARM,
  exportMaterialToExcel,
  exportCustomToExcel,
  getARMByID,
  addARM,
  editARM,
  deleteARM,
  searchARM,
  getInvoiceNoList,
  getAcNoList,
  getReqNo,
  applyFilterActivate,
  getAllAcType,
  getAcTypeDropdown,
  confirmAll,
  exportExcelARM,
} = require("./ac_req_m.controller");

const acReqMRouter = express.Router();

acReqMRouter.get("/all", getAllARM);
acReqMRouter.get("/invoice", getInvoiceNoList);
acReqMRouter.get("/ac_no", getAcNoList);
acReqMRouter.get("/apply-filter", applyFilterActivate);
acReqMRouter.get("/req_no", getReqNo);
acReqMRouter.post("/excel", exportExcelARM);
acReqMRouter.get("/ac_type", getAllAcType);
acReqMRouter.get("/dropdown_ac_type", getAcTypeDropdown);
acReqMRouter.post("/material-excel", exportMaterialToExcel);
acReqMRouter.post("/custom-excel", exportCustomToExcel);
acReqMRouter.get("/", getARMByID);
acReqMRouter.post("/", addARM);
acReqMRouter.put("/edit", editARM);
acReqMRouter.delete("/", deleteARM);
acReqMRouter.post("/search", searchARM);
acReqMRouter.get("/confirm_all", confirmAll);

module.exports = acReqMRouter;
