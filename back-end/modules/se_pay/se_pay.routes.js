const express = require("express");
const {
  getAllSP,
  getSPByID,
  addSP,
  editSP,
  getFieldDropdown,
} = require("./se_pay.controller");

const sePayRouter = express.Router();

sePayRouter.get("/all", getAllSP);
sePayRouter.get("/", getSPByID);
sePayRouter.post("/", addSP);
sePayRouter.put("/edit", editSP);
sePayRouter.get("/field_dropdown", getFieldDropdown);

module.exports = sePayRouter;
