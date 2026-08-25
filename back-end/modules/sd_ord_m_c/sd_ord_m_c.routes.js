const express = require("express");
const {
  getAllFieldDropdown,
  searchSeOrdItem,
  getAllSeOrdItem,
  checkBox,
  getSysTree,
  createPlan,
  updatePDD,
  getAllPackingSeidDropdown,
  clearSysTree,
} = require("./sd_ord_m_c.controller");

const sdOrdMCRouter = express.Router();

sdOrdMCRouter.get("/dropdown_field", getAllFieldDropdown);
sdOrdMCRouter.get("/packing_seid", getAllPackingSeidDropdown);
sdOrdMCRouter.get("/all", getAllSeOrdItem);
sdOrdMCRouter.post("/check", checkBox);
sdOrdMCRouter.get("/sys_tree", getSysTree);
sdOrdMCRouter.get("/clear_sys_tree", clearSysTree);
sdOrdMCRouter.get("/create_plan", createPlan);
sdOrdMCRouter.post("/search", searchSeOrdItem);
sdOrdMCRouter.post("/update_pdd", updatePDD);
module.exports = sdOrdMCRouter;
