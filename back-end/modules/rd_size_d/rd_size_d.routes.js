const express = require("express");
const { getAllRdSizeD, exportPDFRSD, getRdSizeDByID, addAcRSD, editAcRsd, deleteAcImp, deleteAcRSD, searchRSD, getRdSizeDBySize, getDropBySize } = require("./rd_size_d.controller");

const rdSizeDRouter = express.Router();

rdSizeDRouter.get("/all", getAllRdSizeD);
rdSizeDRouter.get("/pdf", exportPDFRSD);
// rdSizeDRouter.post("/material-excel",exportMaterialToExcel );
// rdSizeDRouter.post("/custom-excel",exportCustomToExcel);
rdSizeDRouter.get("/", getRdSizeDByID);
rdSizeDRouter.get("/size",getRdSizeDBySize);
rdSizeDRouter.get("/dropdown_size",getDropBySize);
rdSizeDRouter.post("/", addAcRSD);
rdSizeDRouter.put("/edit", editAcRsd);
rdSizeDRouter.delete("/", deleteAcRSD);
rdSizeDRouter.post("/search", searchRSD);

module.exports = rdSizeDRouter;
