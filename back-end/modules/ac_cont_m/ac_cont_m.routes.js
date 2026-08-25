// ac_cont_m.route.js
const express = require("express");
const {
  getAllAcContM,
  getAllAcContMWithView,
  getAcContMByID,
  addAcContM,
  editAcContM,
  deleteAcContM,
  searchAcContM,
  exportExcelAcContM,
  getFieldByPVM,
  getBank,
  getBigCont,
  getBigContNoExmp,
  confirmAll,
} = require("./ac_cont_m.controller");

const acContMRouter = express.Router();

// GET routes
acContMRouter.get("/all", getAllAcContM);
acContMRouter.get("/list_of_ac_cont_m", getAllAcContMWithView);
acContMRouter.get("/", getAcContMByID);
acContMRouter.get("/export", exportExcelAcContM);
acContMRouter.get("/field_po_vender_m", getFieldByPVM);
acContMRouter.get("/bank", getBank);
acContMRouter.get("/confirm_all", confirmAll);

// POST routes
acContMRouter.post("/", addAcContM);
acContMRouter.post("/search", searchAcContM);
acContMRouter.post("/big_contno", getBigCont);
acContMRouter.post("/big_contno_exmp", getBigContNoExmp);
// PUT route
acContMRouter.put("/edit", editAcContM);

// DELETE route
acContMRouter.delete("/delete", deleteAcContM);

module.exports = acContMRouter;
