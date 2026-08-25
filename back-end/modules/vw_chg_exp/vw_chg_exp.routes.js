const express = require("express");

const { getListOfAcCE, searchVwChgExp } = require("./vw_chg_exp.controller");

const vwAcChgExpRouter = express.Router();

vwAcChgExpRouter.get("/list_of_chg_exp", getListOfAcCE);
vwAcChgExpRouter.post("/search", searchVwChgExp);
module.exports = vwAcChgExpRouter;
