const express = require("express");

const { getListOfVARD } = require("./vw_acreq_d.controller");

const vwAcReqDRouter = express.Router();

vwAcReqDRouter.get("/list_of_acreq_d", getListOfVARD);
// vwAcReqDRouter.get("/list_of_setting_cont_imp", getCIContract);

module.exports = vwAcReqDRouter;
