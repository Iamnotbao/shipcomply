const express = require("express");
const {
  getAllAcShoeRef,
  exportPDFAcShoeRef,
  getAcShoeRefByID,
  addAcShoeRef,
  editAcShoeRef,
  deleteAcShoeRef,
  searchAcShoeRef,
  getAcShoeRefByShoe,
  getListViewProdNo,
  getByNoneViewItemNo,
  updateStatusAcShoeRef,
} = require("./ac_shoe_ref.controller");

const acShoeRefRouter = express.Router();

acShoeRefRouter.get("/all", getAllAcShoeRef);
acShoeRefRouter.get("/pdf", exportPDFAcShoeRef);
// acShoeRefRouter.post("/material-excel",exportMaterialToExcel );
// acShoeRefRouter.post("/custom-excel",exportCustomToExcel);
acShoeRefRouter.get("/", getAcShoeRefByID);
acShoeRefRouter.get("/shoe", getAcShoeRefByShoe);
acShoeRefRouter.get("/prod", getByNoneViewItemNo);
acShoeRefRouter.get("/list_prod_no", getListViewProdNo);
acShoeRefRouter.post("/", addAcShoeRef);
acShoeRefRouter.put("/edit", editAcShoeRef);
acShoeRefRouter.delete("/", deleteAcShoeRef);
acShoeRefRouter.post("/search", searchAcShoeRef);
acShoeRefRouter.post("/confirmed", updateStatusAcShoeRef);

module.exports = acShoeRefRouter;
