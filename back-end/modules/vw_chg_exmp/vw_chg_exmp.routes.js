const express = require("express");
const { getListOfVCE } = require("./vw_chg_exmp.controller");

const vwAcChgExmpRouter = express.Router();

vwAcChgExmpRouter.get("/list_of_chg_exmp", getListOfVCE);
module.exports = vwAcChgExmpRouter;
