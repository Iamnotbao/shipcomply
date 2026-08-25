const express = require("express");
const {
  getAllADP,
  getAcDescProcByID,
  addAcDescProc,
  editAcDescProc,
} = require("./ac_desc_proc.controller");

const acDescProcRouter = express.Router();

acDescProcRouter.get("/ac_no", getAllADP);
// acDescProcRouter.get("/sum", getSum);
acDescProcRouter.get("/", getAcDescProcByID);
// acDescProcRouter.get("/goods_code", getDropdownGoods);
// acDescProcRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acDescProcRouter.post("/", addAcDescProc);
acDescProcRouter.put("/edit", editAcDescProc);

module.exports = acDescProcRouter;
