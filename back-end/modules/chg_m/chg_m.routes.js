const express = require("express");
const {
  getListOfChgM,
  searchChgM,
  getSeInvSelections,
  clearSeInvSession,
  autoAdd,
  checkBox,
} = require("./chg_m.controller");

const chgMRouter = express.Router();
chgMRouter.get("/chg_m", getListOfChgM);
chgMRouter.get("/auto_add",autoAdd)
chgMRouter.post("/checkbox",checkBox );
chgMRouter.get("/temp_table", getSeInvSelections);
chgMRouter.get("/clear_temp_table", clearSeInvSession);
chgMRouter.post("/search", searchChgM);
module.exports = chgMRouter;
