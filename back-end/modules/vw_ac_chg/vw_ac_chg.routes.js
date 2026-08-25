const express = require("express");

const { fetchFieldDropdown } = require("./vw_ac_chg.controller");

const vwAcChgRouter = express.Router();

vwAcChgRouter.get("/dropdown_field", fetchFieldDropdown);
module.exports = vwAcChgRouter;
