const express = require("express");

const {
  updateInvoiceD,
  updateHsC,
  updateNw,
  getInvoiceDropdown,
  getPackingSeid,
  exportPDFToPakingList,
  getAllAcIssueM,
  searchAcIssueM,
  getAcIssueMTByID,
  addAcIssueMT,
  editAcIssueMT,
  activateAIMT,
  voidAllAcIssueMT,
  calculateAIMT,
  exportExcelDetail,
  exportExcelSummary,
} = require("./ac_issue_m_t.controller");

const acIssueMTRouter = express.Router();

acIssueMTRouter.get("/all", getAllAcIssueM);
acIssueMTRouter.get("/", getAcIssueMTByID);
acIssueMTRouter.get("/active", activateAIMT);
acIssueMTRouter.get("/void_all", voidAllAcIssueMT);
acIssueMTRouter.get("/calculate", calculateAIMT);
acIssueMTRouter.post("/pdf_packing_list", exportPDFToPakingList);
// acIssueMTRouter.post("/excel", exportExcel);
acIssueMTRouter.post("/search", searchAcIssueM);
acIssueMTRouter.post("/", addAcIssueMT);
acIssueMTRouter.put("/edit", editAcIssueMT);
acIssueMTRouter.post("/excel_detail", exportExcelDetail);
acIssueMTRouter.post("/excel_summary", exportExcelSummary);

module.exports = acIssueMTRouter;
