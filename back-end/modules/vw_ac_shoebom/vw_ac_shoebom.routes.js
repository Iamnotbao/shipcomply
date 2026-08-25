const express = require("express");

const { getListOfASB, exportMaterialToExcel, exportCustomToExcel, searchVwAcShoeBom, exportPDFVwAcShoeBom } = require("./vw_ac_shoebom.controller");

const acShoeBomRouter = express.Router();

acShoeBomRouter.get("/list_of_ac_shoebom", getListOfASB);
acShoeBomRouter.get("/pdf", exportPDFVwAcShoeBom);
acShoeBomRouter.post("/material-excel", exportMaterialToExcel);
acShoeBomRouter.post("/custom-excel", exportCustomToExcel);
acShoeBomRouter.post("/search", searchVwAcShoeBom);

module.exports = acShoeBomRouter;
