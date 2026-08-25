const express = require("express");
const {
  getAllAcExpectM,
  generateExpectId,
  addAcExpectM,
  editAcExpectM,
  getAcExpectMByID,
  getFieldDropdown,
  searchAcExpectM,
  genOrderMaterial,
  calculateWriteoff,
  exportExcelShoeM,
  exportExcelWriteoff,
} = require("./ac_expect_m.controller");

const acExpectMRouter = express.Router();

acExpectMRouter.get("/expect_id", generateExpectId);
acExpectMRouter.get("/all", getAllAcExpectM);
acExpectMRouter.get("/", getAcExpectMByID);
acExpectMRouter.get("/field_dropdown", getFieldDropdown);
acExpectMRouter.post("/", addAcExpectM);
acExpectMRouter.put("/edit", editAcExpectM);
acExpectMRouter.post("/search", searchAcExpectM);
// acExpectMRouter.get("/cancel_activate", cancelActivateAcCM);
// acExpectMRouter.get("/close", closeAcCM);
// acExpectMRouter.get("/void", voidAllAcCM);
acExpectMRouter.get("/gen_order_material", genOrderMaterial);
acExpectMRouter.get("/calculate_write_off", calculateWriteoff);
acExpectMRouter.get("/excel_shoe", exportExcelShoeM);
acExpectMRouter.get("/excel_write_off", exportExcelWriteoff);
// acExpectMRouter.get("/confirm_pass_date", confirmPassD);
module.exports = acExpectMRouter;
