const express = require("express");
const {
  getAllSeIdDataDropdown,
} = require("./sd_pack_m.controller");

const sdPackMRouter = express.Router();
sdPackMRouter.get("/se_id", getAllSeIdDataDropdown);
module.exports = sdPackMRouter;
