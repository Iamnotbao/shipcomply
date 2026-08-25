const express = require("express");
const { getListOfVAIT, searchVwAcIssueT } = require("./vw_ac_issue_t.controller");

const vwAcIssueTRouter = express.Router();

vwAcIssueTRouter.get("/list_of_ac_issue_t", getListOfVAIT);
vwAcIssueTRouter.post("/search", searchVwAcIssueT);
module.exports = vwAcIssueTRouter;
