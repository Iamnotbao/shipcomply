const express = require("express");
const {
  getAllIvTransDTw,
  exportPDFAcIR,
  getIvTransDTwById,
  addIvTransDTw,
  editIvTransDTw,
  deleteIvTDT,
  searchIvTDT,
  checkBoxR,
} = require("./iv_trans_d_tw.controller");

const ivTransDTwRouter = express.Router();

ivTransDTwRouter.get("/all", getAllIvTransDTw);
ivTransDTwRouter.get("/pdf", exportPDFAcIR);
ivTransDTwRouter.get("/", getIvTransDTwById);
ivTransDTwRouter.post("/", addIvTransDTw);
ivTransDTwRouter.put("/edit", editIvTransDTw);
ivTransDTwRouter.delete("/", deleteIvTDT);
ivTransDTwRouter.post("/search", searchIvTDT);
ivTransDTwRouter.post("/check-right", checkBoxR);
module.exports = ivTransDTwRouter;
