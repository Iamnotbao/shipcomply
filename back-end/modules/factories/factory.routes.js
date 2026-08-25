const express = require("express");
const {
  getAllFactories,
  getFactoryByID,
  addFactory,
  editFactory,
  deleteFactory,
  searchFactory,
  exportPDFFactories,
  lalal,
  testDB,
  getFieldDropdown,
} = require("./factory.controller");

const factoryRouter = express.Router();

factoryRouter.get("/all", getAllFactories);
factoryRouter.get("/test", testDB); 
factoryRouter.get("/pdf", exportPDFFactories);
factoryRouter.get("/field_dropdown",getFieldDropdown );
factoryRouter.get("/", getFactoryByID);
factoryRouter.post("/", addFactory);
factoryRouter.put("/edit", editFactory);
factoryRouter.delete("/", deleteFactory);
factoryRouter.post("/search", searchFactory);

module.exports = factoryRouter;
