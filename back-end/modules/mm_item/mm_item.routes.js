const express = require("express");
// const { getAllRdSizeD, exportPDFRSD, getRdSizeDByID, addAcRSD, editAcRsd, deleteAcImp, deleteAcRSD, searchRSD, getRdSizeDBySize } = require("./rd_size_d.controller");
const { getAllMMItem, addMMI, getAllItemNo, getMMItemByID } = require("./mm_item.controller");

const mMItemRouter = express.Router();

mMItemRouter.get("/all", getAllMMItem);
mMItemRouter.get("/item", getAllItemNo);
// mMItemRouter.get("/pdf", exportPDFRSD);
// mMItemRouter.post("/material-excel",exportMaterialToExcel );
// mMItemRouter.post("/custom-excel",exportCustomToExcel);
mMItemRouter.get("/", getMMItemByID);
// mMItemRouter.get("/size",getRdSizeDBySize);
mMItemRouter.post("/", addMMI);
// mMItemRouter.put("/edit", editAcRsd);
// mMItemRouter.delete("/", deleteAcRSD);
// mMItemRouter.post("/search", searchRSD);

module.exports = mMItemRouter;
