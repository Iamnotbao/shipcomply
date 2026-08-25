const express = require("express");
const {
  getSum,
  autoAddAcProcD,
  autoAddAcProcDMarkB,
  updateExRateMarkB,
  getAllACT,
  getAcChkTByID,
  addAcChkT,
  editAcChkT,
  deleteAcChkT,
} = require("./ac_chk_t.controller");

const acChkTRouter = express.Router();

// acChgDRouter.get("/all", getAllAcCD);
acChkTRouter.get("/sum", getSum);
acChkTRouter.get("/", getAcChkTByID);
acChkTRouter.get("/matd_seq", getAllACT);
acChkTRouter.get("/exchange_rate", updateExRateMarkB);
// acChgDRouter.get("/goods_code", getDropdownGoods);
// acChgDRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acChkTRouter.post("/", addAcChkT);
acChkTRouter.get("/auto_add", autoAddAcProcD);
acChkTRouter.get("/auto_add_mark_b", autoAddAcProcDMarkB);
acChkTRouter.put("/edit", editAcChkT);
acChkTRouter.delete("/delete", deleteAcChkT);

module.exports = acChkTRouter;
