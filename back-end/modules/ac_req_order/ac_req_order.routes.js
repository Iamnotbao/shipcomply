const express = require("express");
const { getAllAcRO, getAcROByID, addAcRO, editAcRO,  searchAcRO, deleteAcRO, getAcROByReqNo, getAcROByField, getAllAcROByID } = require("./ac_req_order.controller");

const acReqOrderRouter = express.Router();

acReqOrderRouter.get("/all", getAllAcRO);
acReqOrderRouter.get("/", getAcROByID);
acReqOrderRouter.get("/req_no", getAcROByReqNo);
acReqOrderRouter.get("/id", getAllAcROByID);
// acReqOrderRouter.get("/pdf", ex);
// acReqOrderRouter.post("/excel", exportExcelAcVB);
// acReqOrderRouter.get("/ac_send", getAllAcSendByCategory);
// acReqOrderRouter.get("/vend_no", getAllVendNoByStatus);
acReqOrderRouter.post("/", addAcRO);
acReqOrderRouter.put("/edit", editAcRO);
acReqOrderRouter.delete("/", deleteAcRO);
acReqOrderRouter.post("/search", searchAcRO);

module.exports = acReqOrderRouter;
