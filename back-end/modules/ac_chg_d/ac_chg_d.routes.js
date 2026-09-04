const express = require("express");
const {
  getSum,
  getAllAcCDWithView,
  getAcChgDByID,
  addAcChgD,
  editAcChgD,
  autoAddAcChgD,
  refreshS,
  copyItemsFromShoe,
  refreshP,
  calculateRefPrice,
  getAllAcCDExpWithView,
} = require("./ac_chg_d.controller");

const acChgDRouter = express.Router();

// acChgDRouter.get("/all", getAllAcCD);
acChgDRouter.get("/sum", getSum);
acChgDRouter.get("/", getAcChgDByID);
acChgDRouter.get("/ac_no", getAllAcCDWithView);
acChgDRouter.get("/ac_no_exp", getAllAcCDExpWithView);
acChgDRouter.get("/auto_add", autoAddAcChgD);
acChgDRouter.get("/refresh_seq", refreshS);
acChgDRouter.get("/refresh_price", refreshP);
acChgDRouter.get("/calculate_ref_price", calculateRefPrice);
acChgDRouter.get("/copy_shoe_id", copyItemsFromShoe);
// acChgDRouter.get("/goods_code", getDropdownGoods);
// acChgDRouter.get("/unit_by_goods_code", getUnitByGoodsCode);
acChgDRouter.post("/", addAcChgD);
acChgDRouter.put("/edit", editAcChgD);

module.exports = acChgDRouter;
