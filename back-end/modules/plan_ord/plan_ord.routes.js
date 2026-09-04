const express = require("express");

const {
  getAllPlanOrd,
  searchPD,
  checkBox,
  confirmPD,
  getTempTable,
  clearTempTable,
  deletePlanOrd,
} = require("./plan_ord.controller");

const planOrdRouter = express.Router();

planOrdRouter.get("/plan_date", getAllPlanOrd);
planOrdRouter.post("/checkbox", checkBox);
planOrdRouter.get("/confirm_all", confirmPD);
planOrdRouter.get("/temp_table", getTempTable);
planOrdRouter.get("/clear_temp_table", clearTempTable);
planOrdRouter.post("/search_plan_date", searchPD);
planOrdRouter.delete("/", deletePlanOrd);
module.exports = planOrdRouter;
