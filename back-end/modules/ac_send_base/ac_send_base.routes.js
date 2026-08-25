const express = require("express");
const { getAllAcSB, exportPDFAcSB, getAcSBByID, addAcSB, editAcSB, deleteAcIR, searchAcSB, getAllAcSendByCategory, getAllTypeByCategory, getFieldDrop } = require("./ac_send_base.controller");

const acSendBaseRouter = express.Router();

acSendBaseRouter.get("/all", getAllAcSB);
acSendBaseRouter.get("/pdf", exportPDFAcSB);
acSendBaseRouter.get("/dropdown_field", getFieldDrop);
// acSendBaseRouter.post("/materiagl-excel",exportMaterialToExcel );
// acSendBaseRouter.post("/custom-excel",exportCustomToExcel);
acSendBaseRouter.get("/ac_send", getAllAcSendByCategory);
acSendBaseRouter.get("/type", getAllTypeByCategory);
acSendBaseRouter.get("/", getAcSBByID);
acSendBaseRouter.post("/", addAcSB);
acSendBaseRouter.put("/edit", editAcSB);
acSendBaseRouter.delete("/", deleteAcIR);
acSendBaseRouter.post("/search", searchAcSB);

module.exports = acSendBaseRouter;
