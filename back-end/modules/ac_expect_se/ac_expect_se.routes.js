const express = require("express");

const { getAllAcExpectSe } = require("./ac_expect_se.controller");

const acExpectSeRouter = express.Router();

//acExpectSeRouter.get("/expect_id", generateExpectId);
acExpectSeRouter.get("/all", getAllAcExpectSe);
// acExpectSeRouter.get("/", getAcExpectMByID);
// acExpectSeRouter.get("/field_dropdown", getFieldDropdown);
// acExpectSeRouter.post("/", addAcExpectM);
// acExpectSeRouter.put("/edit", editAcExpectM);
// acExpectSeRouter.post("/search", searchAcExpectM);
// acExpectSeRouter.get("/cancel_activate", cancelActivateAcCM);
// acExpectSeRouter.get("/close", closeAcCM);
// acExpectSeRouter.get("/void", voidAllAcCM);
// acExpectSeRouter.get("/gen_order_material", genOrderMaterial);
// acExpectSeRouter.get("/calculate_write_off", calculateWriteoff);
// acExpectSeRouter.get("/excel_shoe", exportExcelShoeM);
// acExpectSeRouter.get("/excel_write_off", exportExcelWriteoff);
// acExpectSeRouter.get("/confirm_pass_date", confirmPassD);
module.exports = acExpectSeRouter;
