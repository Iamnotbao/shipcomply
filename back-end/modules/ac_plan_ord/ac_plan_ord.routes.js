const express = require("express");
const {
  getAllSP,
  getSPByID,
  addSP,
  editSP,
  getFieldDropdown,
  getListOfAPO,
} = require("./ac_plan_ord.controller");

const acPlanOrdRouter = express.Router();

acPlanOrdRouter.get("/all", getListOfAPO);
acPlanOrdRouter.get("/", getSPByID);
acPlanOrdRouter.post("/", addSP);
acPlanOrdRouter.put("/edit", editSP);
acPlanOrdRouter.get("/field_dropdown", getFieldDropdown);

module.exports = acPlanOrdRouter;
