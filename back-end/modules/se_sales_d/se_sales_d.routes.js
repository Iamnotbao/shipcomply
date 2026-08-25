const express = require("express");
const { getAllSeSalesD } = require("./se_sales_d.controller");

const seSalesDRouter = express.Router();

seSalesDRouter.get("/all",getAllSeSalesD );

module.exports = seSalesDRouter;
