const express = require("express");
const {
  getAllAcIR,
  exportPDFAcIR,
  getAcIRByID,
  addAcIR,
  editAcIR,
  deleteAcIR,
  searchAcIR,
  getByItemAcno,
  getByItemNo,
  getAllWithItemNo,
  updateStatusAcIR,
} = require("./ac_item_ref.controller");
// const { exportPDFAcImp, getAcImpByID, addAcImp, editAcImp, deleteAcImp, searchAcImp, getAllAcImp, exportCustomToExcel, exportMaterialToExcel } = require("./ac_imp_material_tracking.controller");

const acItemRefRouter = express.Router();

acItemRefRouter.get("/all", getAllAcIR);
acItemRefRouter.get("/pdf", exportPDFAcIR);
// acItemRefRouter.post("/material-excel",exportMaterialToExcel );
// acItemRefRouter.post("/custom-excel",exportCustomToExcel);
acItemRefRouter.get("/", getAcIRByID);
acItemRefRouter.post("/confirmed", updateStatusAcIR);
acItemRefRouter.get("/list_item_no",getAllWithItemNo);
acItemRefRouter.get("/itemAcno",getByItemAcno);
acItemRefRouter.get("/item",getByItemNo);
acItemRefRouter.post("/", addAcIR);
acItemRefRouter.put("/edit", editAcIR);
acItemRefRouter.delete("/", deleteAcIR);
acItemRefRouter.post("/search", searchAcIR);

module.exports = acItemRefRouter;
