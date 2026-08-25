const express = require("express");
const { exportPDFAcProdM, getAcProdMByID, addAcProdM, editAcProdM, deleteAcProdM, searchAcProdM, getAllAcProdM, getAcProdMByShoe, updateStatusAcProdM, getAcProdMDropdown } = require("./ac_prod_m.controller");
const acProdMRouter = express.Router();

acProdMRouter.get("/all", getAllAcProdM);
acProdMRouter.get("/pdf", exportPDFAcProdM);
// acProdMRouter.post("/material-excel",exportMaterialToExcel );
// acProdMRouter.post("/custom-excel",exportCustomToExcel);
acProdMRouter.get("/", getAcProdMByID);
acProdMRouter.get("/shoe", getAcProdMByShoe);
acProdMRouter.get("/prod_m_dropdown", getAcProdMDropdown);
acProdMRouter.post("/", addAcProdM);
acProdMRouter.put("/edit", editAcProdM);
acProdMRouter.delete("/", deleteAcProdM);
acProdMRouter.post("/search", searchAcProdM);
acProdMRouter.post("/confirmed", updateStatusAcProdM);

module.exports = acProdMRouter;
