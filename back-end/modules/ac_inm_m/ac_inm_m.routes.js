const express = require("express");

const {
  getAllAcInmM,
  searchAcInmM,
  addAcInmM,
  getAcInmMByID,
  editAcInmM,
  exportPDF,
  confirmAll,
} = require("./ac_inm_m.controller");

const acInmMRouter = express.Router();

acInmMRouter.get("/all", getAllAcInmM);
acInmMRouter.get("/", getAcInmMByID);
acInmMRouter.get("/pdf", exportPDF);
acInmMRouter.get("/confirm_all", confirmAll);
acInmMRouter.post("/search", searchAcInmM);
acInmMRouter.post("/", addAcInmM);
acInmMRouter.put("/edit", editAcInmM);

module.exports = acInmMRouter;
