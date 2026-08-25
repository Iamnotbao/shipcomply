const express = require("express");
const { getAllAcDC, getAcDescChgByID, addAcDescChg, editAcDescChg } = require("./ac_desc_chg.controller");


const acDescChgRouter = express.Router();

acDescChgRouter.get("/ac_no", getAllAcDC);
// acDescChgRouter.get("/sum", getSum);
acDescChgRouter.get("/", getAcDescChgByID);
// acDescChgRouter.get("/goods_code", getDropdownGoods);
// acDescChgRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acDescChgRouter.post("/", addAcDescChg);
acDescChgRouter.put("/edit", editAcDescChg);

module.exports = acDescChgRouter;
