const express = require("express");

const { getAllAcExpectMatD } = require("./ac_expect_matd.controller");

const acExpectMatDRouter = express.Router();

//acExpectMatDRouter.get("/expect_id", generateExpectId);
acExpectMatDRouter.get("/all", getAllAcExpectMatD);
// acExpectMatDRouter.get("/", getAcExpectMByID);
// acExpectMatDRouter.get("/field_dropdown", getFieldDropdown);
// acExpectMatDRouter.post("/", addAcExpectM);
// acExpectMatDRouter.put("/edit", editAcExpectM);
// acExpectMatDRouter.post("/search", searchAcExpectM);
// acExpectMatDRouter.get("/cancel_activate", cancelActivateAcCM);
// acExpectMatDRouter.get("/close", closeAcCM);
// acExpectMatDRouter.get("/void", voidAllAcCM);
// acExpectMatDRouter.get("/gen_order_material", genOrderMaterial);
// acExpectMatDRouter.get("/calculate_write_off", calculateWriteoff);
// acExpectMatDRouter.get("/excel_shoe", exportExcelShoeM);
// acExpectMatDRouter.get("/excel_write_off", exportExcelWriteoff);
// acExpectMatDRouter.get("/confirm_pass_date", confirmPassD);
module.exports = acExpectMatDRouter;
