const express = require("express");

const {
  getAllSeInvM,
  searchSeInvM,
  getSeInvMByID,
  addSeInvM,
  editSeInvM,
  updateInvoiceD,
  updateHsC,
  updateNw,
  activeSeInvM,
  cancelActiveSeInvM,
  voidAllSeInvM,
  getInvoiceDropdown,
  getPackingSeid,
  exportPDFToPakingList,
  closeSeInvM,
  exportExcel,
} = require("./se_inv_m.controller");

const seInvMRouter = express.Router();

seInvMRouter.get("/all", getAllSeInvM);
seInvMRouter.get("/", getSeInvMByID);
seInvMRouter.get("/update_invoice", updateInvoiceD);
seInvMRouter.get("/update_hscode", updateHsC);
seInvMRouter.get("/update_nw", updateNw);
seInvMRouter.get("/active", activeSeInvM);
seInvMRouter.get("/cancel_active", cancelActiveSeInvM);
seInvMRouter.get("/void_all", voidAllSeInvM);
seInvMRouter.get("/invoice", getInvoiceDropdown);
seInvMRouter.get("/packing_seid", getPackingSeid);
seInvMRouter.post("/pdf_packing_list", exportPDFToPakingList);
seInvMRouter.get("/close", closeSeInvM);
seInvMRouter.post("/excel", exportExcel);
seInvMRouter.post("/search", searchSeInvM);
seInvMRouter.post("/", addSeInvM);
seInvMRouter.put("/edit", editSeInvM);

module.exports = seInvMRouter;
