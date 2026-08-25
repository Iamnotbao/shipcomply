const express = require("express");

const { getAllVwAcChkT, exportExcel } = require("./vw_ac_chk_t.controller");

const vwAcChkTRouter = express.Router();

vwAcChkTRouter.get("/list_of_achk_t", getAllVwAcChkT);
vwAcChkTRouter.get("/excel", exportExcel);
module.exports = vwAcChkTRouter;
