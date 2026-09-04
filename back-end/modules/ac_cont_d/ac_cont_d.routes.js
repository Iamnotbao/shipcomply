const express = require("express");
const {
  getAllAcCD,
  getAllAcCDWithView,
  getDropdownGoods,
  getUnitByGoodsCode,
  addAcContD,
  editAcContD,
  getAcContDByID,
  getDropdownGoodsWithFunc,
  getContPriceDrop,
  deleteAcContD,
  getSumData,
  getFieldWithFunction,
} = require("./ac_cont_d.controller");

const acContDRouter = express.Router();

acContDRouter.get("/all", getAllAcCD);
acContDRouter.get("/", getAcContDByID);
acContDRouter.get("/list_of_ac_cont_d", getAllAcCDWithView);
acContDRouter.get("/goods_code", getDropdownGoods);
acContDRouter.get("/goods_code_with_func", getDropdownGoodsWithFunc);
acContDRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acContDRouter.get("/field_with_function", getFieldWithFunction);
acContDRouter.get("/cont_price", getContPriceDrop);
acContDRouter.get("/sum", getSumData);
acContDRouter.post("/", addAcContD);
acContDRouter.put("/edit", editAcContD);
acContDRouter.delete("/", deleteAcContD);

module.exports = acContDRouter;
