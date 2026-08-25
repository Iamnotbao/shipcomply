const express = require("express");
const { getAllProgram, exportPDFPrograms, getProgramByID, addProgram, editProgram, deleteProgram, searchProgram } = require("./program.controller");

const programRouter = express.Router();

programRouter.get('/all',getAllProgram);
programRouter.get('/pdf',exportPDFPrograms);
programRouter.get('/',getProgramByID);
programRouter.post('/',addProgram),
programRouter.put('/edit',editProgram),
programRouter.delete('/',deleteProgram),
programRouter.post("/search",searchProgram);

module.exports=programRouter;