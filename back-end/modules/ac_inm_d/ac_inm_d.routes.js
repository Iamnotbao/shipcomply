const express = require("express");
const {
  getAllAcInmD,
  getItemNoList,
  getUnitList,
  addAID,
  editAID,
  getAcInmDByID,
  updateStatusAID,
  deleteAcInmD,
} = require("./ac_inm_d.controller");

const acInmDRouter = express.Router();

acInmDRouter.get("/all", getAllAcInmD);
acInmDRouter.get("/", getAcInmDByID);
acInmDRouter.post("/confirmed", updateStatusAID);
acInmDRouter.post("/", addAID);
acInmDRouter.put("/edit", editAID);
acInmDRouter.get("/item_no", getItemNoList);
acInmDRouter.get("/unit", getUnitList);
acInmDRouter.delete("/", deleteAcInmD);

module.exports = acInmDRouter;
