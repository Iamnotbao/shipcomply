const express = require("express");

const {
  getAllSeInvD,
} = require("./se_inv_d.controller");

const seInvDRouter = express.Router();

seInvDRouter.get("/all", getAllSeInvD);
// seInvDRouter.get("/", getSeInvMByID);
// seInvDRouter.get("/update_invoice", updateInvoiceD);
// seInvDRouter.get("/update_hscode", updateHsC);
// seInvDRouter.post("/excel", exportExcel);
// seInvDRouter.post("/search", searchSeInvM);
// seInvDRouter.post("/", addSeInvM);
// seInvDRouter.put("/edit", editSeInvM);

module.exports = seInvDRouter;
