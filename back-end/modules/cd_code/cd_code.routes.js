const express = require("express");
const {  getAllFieldByVendNo, getAllFieldDropdownn } = require("./cd_code.controller");

const cdCodeRouter = express.Router();
cdCodeRouter.get("/field_dropdown", getAllFieldDropdownn);
cdCodeRouter.get("/field_vend_no", getAllFieldByVendNo);
module.exports = cdCodeRouter;
