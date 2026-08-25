const express = require("express");
const {
  getAllSP,
  getAPSByID,
  addSP,
  editSP,
  getFieldDropdown,
  getListOfAPS,
  updateProdAc,
} = require("./ac_plan_size.controller");

const acPlanSizeRouter = express.Router();

acPlanSizeRouter.get("/all", getListOfAPS);
acPlanSizeRouter.get("/", getAPSByID);
acPlanSizeRouter.post("/", addSP);
acPlanSizeRouter.put("/edit", editSP);
acPlanSizeRouter.get("/field_dropdown", getFieldDropdown);
acPlanSizeRouter.get("/update_prod_acno", updateProdAc);
module.exports = acPlanSizeRouter;
