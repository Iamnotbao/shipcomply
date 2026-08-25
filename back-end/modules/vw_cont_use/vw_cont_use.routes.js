const express = require("express");
const { getListOfVCU } = require("./vw_cont_use.controller");

const vwAcContUseRouter = express.Router();

vwAcContUseRouter.get("/list_of_cont_use", getListOfVCU);
module.exports = vwAcContUseRouter;
