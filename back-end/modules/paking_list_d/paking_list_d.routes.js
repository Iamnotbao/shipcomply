const express = require("express");
const { getAllPLD } = require("./paking_list_d.controller");

const pakingListDRouter = express.Router();

pakingListDRouter.get("/all", getAllPLD);
// pakingListDRouter.post("/search", searchPLM);
// pakingListDRouter.get("/", getSPByID);
// pakingListDRouter.post("/", addSP);
// pakingListDRouter.put("/edit", editSP);

module.exports = pakingListDRouter;
