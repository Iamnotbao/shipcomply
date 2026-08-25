const express = require("express");
const {
  getAllSP,
  getSPByID,
  addSP,
  editSP,
  getFieldDropdown,
  getListOfAPP,
} = require("./ac_plan_pack.controller");

const acPlanPackRouter = express.Router();

acPlanPackRouter.get("/all", getListOfAPP);
acPlanPackRouter.get("/", getSPByID);
acPlanPackRouter.post("/", addSP);
acPlanPackRouter.put("/edit", editSP);
acPlanPackRouter.get("/field_dropdown", getFieldDropdown);

module.exports = acPlanPackRouter;
