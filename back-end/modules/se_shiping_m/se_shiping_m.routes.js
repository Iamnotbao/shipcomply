const express = require("express");

const {
  getAllSeShipingM,
  getSiSeq,
  editSeShipingM,
  addSeShipingM,
  getSeShippingMByID,
  searchSeShipingM,
  exportExcel,
  confirmAll,
} = require("./se_shiping_m.controller");

const seShipingMRouter = express.Router();

seShipingMRouter.get("/all", getAllSeShipingM);
seShipingMRouter.get("/si_seq", getSiSeq);
seShipingMRouter.get("/", getSeShippingMByID);
seShipingMRouter.get("/confirm_all", confirmAll);
seShipingMRouter.post("/excel", exportExcel);
seShipingMRouter.post("/search", searchSeShipingM);
seShipingMRouter.post("/", addSeShipingM);
seShipingMRouter.put("/edit", editSeShipingM);
module.exports = seShipingMRouter;
