const express = require("express");
const { getAll, getByID, editBasicCategoryData, getByFactory, createBasicDataCategory, searchBasicDataCategory, exportExcelBasicDataCategory, getByDeclareCate } = require("./basic_data_category.controller");

const basicDataCategoryRouter = express.Router();
basicDataCategoryRouter.get("/all",getAll)
basicDataCategoryRouter.get("/excel",exportExcelBasicDataCategory);
basicDataCategoryRouter.get("/",getByID)
basicDataCategoryRouter.get("/factory",getByFactory);
basicDataCategoryRouter.get("/filter",getByDeclareCate);
basicDataCategoryRouter.post("/",createBasicDataCategory)
basicDataCategoryRouter.put("/edit",editBasicCategoryData);
// basicDataRouter.delete("/",deleteFactoryDepartment);
basicDataCategoryRouter.post("/search",searchBasicDataCategory);
module.exports=basicDataCategoryRouter;