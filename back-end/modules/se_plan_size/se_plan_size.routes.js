const express = require("express");

const {
  searchSePlanOrd,
  addSePlanOrd,
  getSePlanSizeByID,
  getAllSePlanSize,
  getSizeCtns,
  editSePlanSize,
  confirmAll,
  confirmItemsSePlanSize,
  unconfirmItemsSePlanSize,
  deleteSePlanSize,
} = require("./se_plan_size.controller");

const sePlanSizeRouter = express.Router();

sePlanSizeRouter.get("/all", getAllSePlanSize);
sePlanSizeRouter.get("/", getSePlanSizeByID);
sePlanSizeRouter.get("/ctns", getSizeCtns);
sePlanSizeRouter.get("/confirm_all", confirmAll);
// sePlanSizeRouter.post("/excel", exportExcel);
sePlanSizeRouter.post("/search", searchSePlanOrd);
sePlanSizeRouter.post("/", addSePlanOrd);
sePlanSizeRouter.post("/confirm_check_items", confirmItemsSePlanSize);
sePlanSizeRouter.post("/unconfirm_check_items", unconfirmItemsSePlanSize);
sePlanSizeRouter.put("/edit", editSePlanSize);
sePlanSizeRouter.delete("/", deleteSePlanSize);

module.exports = sePlanSizeRouter;
