const express = require("express");
const { getAllCustDataDropdown, getAllFieldByVendNo, getAllFieldDropdown } = require("./se_cust.controller");

const seCustRouter = express.Router();
seCustRouter.get("/cust_id", getAllCustDataDropdown);
seCustRouter.get("/field_vend_no", getAllFieldByVendNo);
seCustRouter.get("/field_dropdown", getAllFieldDropdown);
module.exports = seCustRouter;
