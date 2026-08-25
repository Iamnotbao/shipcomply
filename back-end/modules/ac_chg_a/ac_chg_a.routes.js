const express = require("express");
const { getAllAcCA, addAcChgA, editAcChgA, getAcChgAByID } = require("./ac_chg_a.controller");

const acChgARouter = express.Router();

acChgARouter.get("/ac_no", getAllAcCA);
// acChgARouter.get("/sum", getSum);
acChgARouter.get("/", getAcChgAByID);
// acChgARouter.get("/goods_code", getDropdownGoods);
// acChgARouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acChgARouter.post("/", addAcChgA);
acChgARouter.put("/edit", editAcChgA);

module.exports = acChgARouter;
