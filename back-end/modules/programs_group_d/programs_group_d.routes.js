const express = require("express");
const { getAllPGD } = require("./programs_group_d.controller");

const programsGroupDRouter = express.Router();

programsGroupDRouter.get("/all", getAllPGD);
// programsGroupDRouter.get("/pdf", exportPDFAcIR);
// programsGroupDRouter.get("/", getAcIRByID);
// programsGroupDRouter.get("/itemAcno",getByItemAcno);
// programsGroupDRouter.get("/item",getByItemNo);
// programsGroupDRouter.post("/", addAcIR);
// programsGroupDRouter.put("/edit", editAcIR);
// programsGroupDRouter.delete("/", deleteAcIR);
// programsGroupDRouter.post("/search", searchAcIR);

module.exports = programsGroupDRouter;
