const express = require("express");
const { getAllSdOM, searchSdOM } = require("./sd_ord_m.controller");

const sdOrdMRouter = express.Router();

sdOrdMRouter.get("/all", getAllSdOM);
sdOrdMRouter.post("/search", searchSdOM);
// sdOrdMRouter.get("/", getSPByID);
// sdOrdMRouter.post("/", addSP);
// sdOrdMRouter.put("/edit", editSP);

module.exports = sdOrdMRouter;
