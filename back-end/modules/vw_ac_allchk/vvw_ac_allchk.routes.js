const express = require("express");
const {
  exportVwAcAllChkExcel,
  getListOfAcAllChk,
  checkB,
  confirmAll,
  addContractNumb,
  approveCont,
  searchVwAcAllChk,
  getDropdownByField,
} = require("./vw_ac_allchk.controller");

const vwAcAllChkRouter = express.Router();

vwAcAllChkRouter.get("/all", getListOfAcAllChk);
vwAcAllChkRouter.get("/chk-excel", exportVwAcAllChkExcel);
vwAcAllChkRouter.get("/confirm-all", confirmAll);
vwAcAllChkRouter.post("/search", searchVwAcAllChk);
vwAcAllChkRouter.post("/check", checkB);
vwAcAllChkRouter.get("/add-contract-number", addContractNumb);
vwAcAllChkRouter.get("/approve", approveCont);
vwAcAllChkRouter.get("/dropdown_field", getDropdownByField);
module.exports = vwAcAllChkRouter;
