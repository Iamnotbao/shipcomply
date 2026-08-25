const express = require("express");
const { getAll, createDepartment, editDepartment, deleteFactoryDepartment, getByID, getByFactory, searchByDepartment, exportPDFDepartment } = require("./factory_departments.controller");
const { applyQueryPermission, applyModifyPermission } = require("../../utils/applyPermission");
// const { CheckPermission } = require("../../utils/checkPermission");

const facDeparmentRouter = express.Router();
facDeparmentRouter.get("/all",getAll)
facDeparmentRouter.get("/pdf",exportPDFDepartment);
facDeparmentRouter.get("/",getByID)
facDeparmentRouter.get("/factory",getByFactory);
facDeparmentRouter.post("/",createDepartment)
facDeparmentRouter.put("/edit",editDepartment);
facDeparmentRouter.delete("/",deleteFactoryDepartment);
facDeparmentRouter.post("/search",searchByDepartment);
module.exports=facDeparmentRouter;