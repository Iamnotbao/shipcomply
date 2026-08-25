const express = require("express");

const { getListOfVApA, exportVApAExcel } = require("./vw_apdue_all.controller");

const vwApdueAllRouter = express.Router();

vwApdueAllRouter.get("/list_of_proc_m", getListOfVApA);
vwApdueAllRouter.post("/excel", exportVApAExcel);
module.exports = vwApdueAllRouter;
