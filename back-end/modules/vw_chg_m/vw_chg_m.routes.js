const express = require("express");

const { getListOfAcCM, searchVwChgM } = require("./vw_chg_m.controller");

const vwAcChgMRouter = express.Router();

vwAcChgMRouter.get("/list_of_chg_m", getListOfAcCM);
// vwAcChgMRouter.get("/list_of_setting_cont_imp", getCIContract);
vwAcChgMRouter.post("/search", searchVwChgM);
// vwAcChgMRouter.post("/excel", exportExcelVwAcCI);
// vwAcChgMRouter.get("/copy", copyCont);
// vwAcChgMRouter.post("/extend", extendCont);
// vwAcChgMRouter.get("/confirm-extend", confirmExtendCont);
module.exports = vwAcChgMRouter;
