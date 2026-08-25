const express = require("express");
const {
  getAll,
  exportPDFBasicData,
  getByID,
  createBasicData,
  editBasicData,
  searchByBasicData,
  getByCategory,
  updateStatusBD,
  fetchDetailsForM,
  getDropdownByCategory,
} = require("./basic_data.controller");

const basicDataRouter = express.Router();
basicDataRouter.get("/all", getAll);
basicDataRouter.get("/pdf", exportPDFBasicData);
basicDataRouter.get("/category", getByCategory);
basicDataRouter.get("/dropdown_category", getDropdownByCategory);
basicDataRouter.get("/", getByID);
basicDataRouter.get("/fdm", fetchDetailsForM);
// basicDataRouter.get("/factory",getByFactory);
basicDataRouter.post("/", createBasicData);
basicDataRouter.put("/edit", editBasicData);
// basicDataRouter.delete("/",deleteFactoryDepartment);
basicDataRouter.post("/search", searchByBasicData);
basicDataRouter.post("/confirmed", updateStatusBD);
module.exports = basicDataRouter;
