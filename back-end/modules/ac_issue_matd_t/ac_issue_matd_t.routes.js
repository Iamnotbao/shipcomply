const express = require("express");
const {
  getSum,
  getAllAIMT,
  editAIMT,
  getAcIssueMatdTByID,
  confirmAll,
} = require("./ac_issue_matd_t.controller");

const acIssueMatdTRouter = express.Router();

// acChgDRouter.get("/all", getAllAcCD);
acIssueMatdTRouter.get("/sum", getSum);
acIssueMatdTRouter.get("/", getAcIssueMatdTByID);
acIssueMatdTRouter.get("/conf_seq", getAllAIMT);
acIssueMatdTRouter.get("/confirm_all", confirmAll);
acIssueMatdTRouter.put("/edit", editAIMT);

module.exports = acIssueMatdTRouter;
