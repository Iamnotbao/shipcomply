const express = require("express");
const { getAllPLM, searchPLM, exportPDFToPakingList } = require("./paking_list_m.controller");

const pakingListMRouter = express.Router();

pakingListMRouter.get("/all", getAllPLM);
pakingListMRouter.post("/search", searchPLM);
pakingListMRouter.get("/pdf_paking_list", exportPDFToPakingList);
// pakingListMRouter.get("/", getSPByID);
// pakingListMRouter.post("/", addSP);
// pakingListMRouter.put("/edit", editSP);

module.exports = pakingListMRouter;
