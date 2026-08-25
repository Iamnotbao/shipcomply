const express = require("express");
const { getAllPGM } = require("./programs_group_m.controller");

const programsGroupMRouter = express.Router();

programsGroupMRouter.get("/all", getAllPGM);
// programsGroupMRouter.get("/pdf", exportPDFAcIM);
// programsGroupMRouter.post("/excel", exportExcelAcIM);
// programsGroupMRouter.get("/item", getAcIMByIA);
// programsGroupMRouter.get("/", getAcIMByID);
// programsGroupMRouter.post("/", addAcIM);
// programsGroupMRouter.put("/edit", editAcIM);
// programsGroupMRouter.delete("/", deleteAcIM);
// programsGroupMRouter.post("/search", searchAcIM);

module.exports = programsGroupMRouter;
