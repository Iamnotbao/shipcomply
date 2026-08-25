const express = require("express");
const { getAllSPI, getAllSPIForInvM } = require("./sd_price_item.controller");

const sdPriceItemRouter = express.Router();

sdPriceItemRouter.get("/all", getAllSPI);
sdPriceItemRouter.get("/all_for_inv_m", getAllSPIForInvM);
// sdPriceItemRouter.get("/", getSeShipingDByID);
// sdPriceItemRouter.post("/confirmed", updateStatusAID);
// sdPriceItemRouter.post("/", addSSD);
// sdPriceItemRouter.put("/edit", editSSD);

module.exports = sdPriceItemRouter;
