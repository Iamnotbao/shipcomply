const express = require("express");

const {
  getAllSeSales,
  searchSeSales,
  exportExcel,
  exportExcel2,
  getFieldDataDropdown,
} = require("./se_sales.controller");

const seSalesRouter = express.Router();

seSalesRouter.get("/all", getAllSeSales);
seSalesRouter.get("/excel_2", exportExcel2);
seSalesRouter.get("/field_dropdown", getFieldDataDropdown);
seSalesRouter.post("/excel", exportExcel);
seSalesRouter.post("/search", searchSeSales);
module.exports = seSalesRouter;
