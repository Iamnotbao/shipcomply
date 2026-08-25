const express = require("express");
const {
  updateStatusAID,
  editSSD,
  addSSD,
  getAllSeShippingD,
  getSeShipingDByID,
} = require("./se_shiping_d.controller");

const seShipingDRouter = express.Router();

seShipingDRouter.get("/all", getAllSeShippingD);
seShipingDRouter.get("/", getSeShipingDByID);
seShipingDRouter.post("/confirmed", updateStatusAID);
seShipingDRouter.post("/", addSSD);
seShipingDRouter.put("/edit", editSSD);

module.exports = seShipingDRouter;
