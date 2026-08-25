const express = require("express");
const { getAllPFT, exportPFT, getPFTByID, addPFT, editPFT, deletePFT, searchPFT, getColumnName, getPFTByProgram, getUIControlName } = require("./program_field_title.controller");


const programFieldTitleRouter = express.Router();

programFieldTitleRouter.get('/all',getAllPFT);
programFieldTitleRouter.get('/program',getPFTByProgram);
programFieldTitleRouter.get('/column/',getColumnName);
programFieldTitleRouter.get('/control/',getUIControlName);
programFieldTitleRouter.get('/pdf',exportPFT);
programFieldTitleRouter.get('/',getPFTByID);
programFieldTitleRouter.post('/',addPFT),
programFieldTitleRouter.put('/edit',editPFT),
programFieldTitleRouter.delete('/',deletePFT),
programFieldTitleRouter.post("/search",searchPFT);

module.exports=programFieldTitleRouter;