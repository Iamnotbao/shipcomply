const express = require("express");

const {
  searchSePlanOrd,
  addSePlanOrd,
  getSePlanSizeByID,
  getAllSePlanSize,
  getSizeCtns,
  editSePlanSize,
  confirmAll,
} = require("./se_plan_size.controller");

const sePlanSizeRouter = express.Router();

sePlanSizeRouter.get("/all", getAllSePlanSize);
sePlanSizeRouter.get("/", getSePlanSizeByID);
sePlanSizeRouter.get("/ctns", getSizeCtns);
sePlanSizeRouter.get("/confirm_all", confirmAll);
// sePlanSizeRouter.post("/excel", exportExcel);
sePlanSizeRouter.post("/search", searchSePlanOrd);
sePlanSizeRouter.post("/", addSePlanOrd);
sePlanSizeRouter.put("/edit", editSePlanSize);

module.exports = sePlanSizeRouter;
