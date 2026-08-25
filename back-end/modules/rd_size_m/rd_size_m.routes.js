const express = require("express");
const { getAllCustDataDropdown, getAllFieldByVendNo, getAllFieldDropdown, getAllSizeDataDropdown } = require("./rd_size_m.controller");

const rdSizeMRouter = express.Router();
rdSizeMRouter.get("/size_type", getAllSizeDataDropdown);
rdSizeMRouter.get("/field_vend_no", getAllFieldByVendNo);
rdSizeMRouter.get("/field_dropdown", getAllFieldDropdown);
module.exports = rdSizeMRouter;
