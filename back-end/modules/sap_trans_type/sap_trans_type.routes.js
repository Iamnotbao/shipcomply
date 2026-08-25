const express = require("express");
const { getAllSTT } = require("./sap_trans_type.controller");

const sapTransTypeRouter = express.Router();

sapTransTypeRouter.get("/all", getAllSTT);
// sapTransTypeRouter.get("/", getSPByID);
// sapTransTypeRouter.post("/", addSP);
// sapTransTypeRouter.put("/edit", editSP);
// sapTransTypeRouter.get("/field_dropdown", getFieldDropdown);

module.exports = sapTransTypeRouter;
