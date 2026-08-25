const express = require("express");
const {
  getSum,
  getAcProcDByID,
  getAllAPDWithView,
  addAcProcD,
  editAcProcD,
  autoAddAcProcD,
  getAllAPDMarkBWithView,
  autoAddAcProcDMarkB,
  updateExRateMarkB,
} = require("./ac_proc_d.controller");

const acProcDRouter = express.Router();

// acChgDRouter.get("/all", getAllAcCD);
acProcDRouter.get("/sum", getSum);
acProcDRouter.get("/", getAcProcDByID);
acProcDRouter.get("/ac_no", getAllAPDWithView);
acProcDRouter.get("/ac_no_mark_b", getAllAPDMarkBWithView);
acProcDRouter.get("/exchange_rate", updateExRateMarkB);
// acChgDRouter.get("/goods_code", getDropdownGoods);
// acChgDRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acProcDRouter.post("/", addAcProcD);
acProcDRouter.get("/auto_add", autoAddAcProcD);
acProcDRouter.get("/auto_add_mark_b", autoAddAcProcDMarkB);
acProcDRouter.put("/edit", editAcProcD);

module.exports = acProcDRouter;
