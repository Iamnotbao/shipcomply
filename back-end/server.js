require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { monitorMiddleware, monitorRouter } = require("./monitor");
const softAuthMiddleware = require("./utils/auth.soft.middleware.js");

const morgan = require("morgan");
const user_router = require("./modules/users/user.routes");
const factoryRouter = require("./modules/factories/factory.routes");
const authRouter = require("./modules/auth/auth.routes");
const facDeparmentRouter = require("./modules/factory_departments/factory_departments.routes");
const usersPermissionRoute = require("./modules/users_permission/users_permisson.routes");
const sequelize = require("./config/db");
const programRouter = require("./modules/program/program.routes");
const userPermissionDepartmentRouter = require("./modules/users_permisison_department/users_permisison_department.route");
const programFieldTitleRouter = require("./modules/program_field_title/program_field_title.route");
const basicDataRouter = require("./modules/basic_data/basic_data.routes");
const basicDataCategoryRouter = require("./modules/basic_data_category/basic_data_category.routes");
const acImpMaterialTrackingRouter = require("./modules/ac_imp_material_tracking/ac_imp_material_tracking.routes");
const acItemMRouter = require("./modules/ac_item_m/ac_item_m.routes");
const acItemRefRouter = require("./modules/ac_item_ref/ac_item_ref.routes");
const acShoeMRouter = require("./modules/ac_shoe_m/ac_shoe_m.routes");
const acShoeRefRouter = require("./modules/ac_shoe_ref/ac_shoe_ref.routes");
const acBomMRouter = require("./modules/ac_bom_m/ac_bom_m.routes");
const acProdMRouter = require("./modules/ac_prod_m/ac_prod_m.routes");
const rdSizeDRouter = require("./modules/rd_size_d/rd_size_d.routes");
const mMItemRouter = require("./modules/mm_item/mm_item.routes");
const acShoeBomRouter = require("./modules/vw_ac_shoebom/vw_ac_shoebom.routes");
const acVendBaseRouter = require("./modules/ac_vend_base/ac_vend_base.routes");
const acSendBaseRouter = require("./modules/ac_send_base/ac_send_base.routes");
const programsGroupDRouter = require("./modules/programs_group_d/programs_group_d.routes");
const programsGroupMRouter = require("./modules/programs_group_m/programs_group_m.routes");
const acSrcorderMRouter = require("./modules/ac_srcorder_m/ac_srcorder_m.routes");
const acReqMRouter = require("./modules/ac_req_m/ac_req_m.routes");
const acReqOrderRouter = require("./modules/ac_req_order/ac_req_order.routes");
const acSrcorderRouter = require("./modules/vw_ac_srcorder/vw_ac_srcorder.routes");
const ivTransDTwRouter = require("./modules/iv_trans_d_tw/iv_trans_d_tw.routes");
const vwAcAllChkRouter = require("./modules/vw_ac_allchk/vvw_ac_allchk.routes");
const authMiddleware = require("./modules/auth/auth.middleware");
const vwAcContImpRouter = require("./modules/vw_cont_imp/vw_cont_imp.routes");
const acContDRouter = require("./modules/ac_cont_d/ac_cont_d.routes");
const vwAcContUseRouter = require("./modules/vw_cont_use/vw_cont_use.routes");
const acInmMRouter = require("./modules/ac_inm_m/ac_inm_m.routes");
const acInmDRouter = require("./modules/ac_inm_d/ac_inm_d.routes");
const acContMRouter = require("./modules/ac_cont_m/ac_cont_m.routes");
const vwAcChgMRouter = require("./modules/vw_chg_m/vw_chg_m.routes");
const acChgMRouter = require("./modules/ac_chg_m/ac_chg_m.routes");
const acChgDRouter = require("./modules/ac_chg_d/ac_chg_d.routes");
const vwAcReqDRouter = require("./modules/vw_acreq_d/vw_acreq_d.routes");
const acChgARouter = require("./modules/ac_chg_a/ac_chg_a.routes");
const acProcMRouter = require("./modules/ac_proc_m/ac_proc_m.routes");
const acProcDRouter = require("./modules/ac_proc_d/ac_proc_d.routes");
const acDescProcRouter = require("./modules/ac_desc_proc/ac_desc_proc.routes");
const vwApdueAllRouter = require("./modules/vw_apdue_all/vw_apdue_all.routes");
const seShipingMRouter = require("./modules/se_shiping_m/se_shiping_m.routes");
const seCustRouter = require("./modules/se_cust/se_cust_order.routes");
const seShipingDRouter = require("./modules/se_shiping_d/se_shiping_d.routes");
const sePlanOrdRouter = require("./modules/se_plan_ord/se_plan_ord.routes");
const sdOrdMCRouter = require("./modules/sd_ord_m_c/sd_ord_m_c.routes");
const sePlanSizeRouter = require("./modules/se_plan_size/se_plan_size.routes");
const vwAcContExpRouter = require("./modules/vw_cont_exp/vw_cont_exp.routes");
const vwAcChgExmpRouter = require("./modules/vw_chg_exmp/vw_chg_exmp.routes");
const sePayRouter = require("./modules/se_pay/se_pay.routes");
const sdOrdMRouter = require("./modules/sd_ord_m/sd_ord_m.routes");
const sdPriceItemRouter = require("./modules/sd_price_item/sd_price_item.routes");
const vwAcChgExpRouter = require("./modules/vw_chg_exp/vw_chg_exp.routes");
const planOrdRouter = require("./modules/plan_ord/plan_ord.routes");
const seInvMRouter = require("./modules/se_inv_m/se_inv_m.routes");
const chgMRouter = require("./modules/chg_m/chg_m.routes");
const cdCodeRouter = require("./modules/cd_code/cd_code.routes");
const seInvDRouter = require("./modules/se_inv_d/se_inv_d.routes");
const pakingListMRouter = require("./modules/paking_list_m/paking_list_m.routes");
const pakingListDRouter = require("./modules/paking_list_d/paking_list_d.routes");
const acIssueMTRouter = require("./modules/ac_issue_m_t/ac_issue_m_t.routes");
const vwAcIssueTRouter = require("./modules/vw_ac_issue_t/vw_ac_issue_t.routes");
const acIssueMatdTRouter = require("./modules/ac_issue_matd_t/ac_issue_matd_t.routes");
const acChkTRouter = require("./modules/ac_chk_t/ac_chk_t.routes");
const vwAcChgSumRouter = require("./modules/vw_ac_chgsum/vw_ac_chgsum.routes");
const vwAcSumRouter = require("./modules/vw_ac_sum/vw_ac_sum.routes");
const vwAcChgRouter = require("./modules/vw_ac_chg/vw_ac_chg.routes");
const vwAcChkTRouter = require("./modules/vw_ac_chk_t/vw_ac_chk_t.routes");
const seSalesRouter = require("./modules/se_sales/se_sales.routes");
const seSalesDRouter = require("./modules/se_sales_d/se_sales_d.routes");
const acExpectMRouter = require("./modules/ac_expect_m/ac_expect_m.routes");
const acExpectSeRouter = require("./modules/ac_expect_se/ac_expect_se.routes");
const acExpectMatDRouter = require("./modules/ac_expect_matd/ac_expect_matd.routes");
const acCoMRouter = require("./modules/ac_co_m/ac_co_m.routes");
const sapTransTypeRouter = require("./modules/sap_trans_type/sap_trans_type.routes");
const acDescChgRouter = require("./modules/ac_desc_chg/ac_desc_chg.routes.js");
const acPlanOrdRouter = require("./modules/ac_plan_ord/ac_plan_ord.routes.js");
const acPlanSizeRouter = require("./modules/ac_plan_size/ac_plan_size.routes.js");
const acPlanPackRouter = require("./modules/ac_plan_pack/ac_plan_size.routes.js");
const rdSizeMRouter = require("./modules/rd_size_m/rd_size_m.routes.js");
const sdPackMRouter = require("./modules/sd_pack_m/sd_pack_m.routes.js");
const sseRouter = require("./modules/sse/sse.routes");
const healthRouter = require("./modules/health/health.routes");
const realtimeMutationMiddleware = require("./utils/realtime.middleware");
require("./core/association");

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(morgan("dev"));
app.use(monitorMiddleware);
app.use(softAuthMiddleware);
app.use(
  cors({
    origin: [
      "http://10.12.3.4",
      "http://10.12.3.4:8081",
      "http://10.1.0.60:8080",
      "http://10.1.0.60",
      "http://10.1.1.134:8080",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://adidas-website-roan.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/health", healthRouter);
app.use("/api/sse", authMiddleware, sseRouter);
app.use("/api", realtimeMutationMiddleware);

sequelize
  .authenticate()
  .then(() => console.log("Database synced"))
  .catch(() => console.error("Database unavailable during startup"));

app.get("/", (req, res) => {
  res.send(" Server for basic_data test is running!");
});

app.get("/test", (req, res) => {
  res.send("okokok");
});
app.use("/monitor", monitorRouter);
/*----->TABLE<----*/
app.use("/api/authentication", authRouter);
app.use("/api/users", user_router);
app.use("/api/factory", factoryRouter);
app.use("/api/program", authMiddleware, programRouter);
app.use("/api/departments", facDeparmentRouter);
app.use("/api/program_field_title", programFieldTitleRouter);
app.use("/api/users_permission_department", userPermissionDepartmentRouter);
app.use("/api/users_permission", usersPermissionRoute);

app.use("/api", authMiddleware);
app.use("/api/basic_data", basicDataRouter);
app.use("/api/basic_data_category", basicDataCategoryRouter);
app.use("/api/ac_imp_material_tracking", acImpMaterialTrackingRouter);
app.use("/api/ac_item_m", acItemMRouter);
app.use("/api/ac_item_ref", acItemRefRouter);
app.use("/api/ac_shoe_m", acShoeMRouter);
app.use("/api/ac_shoe_ref", acShoeRefRouter);
app.use("/api/ac_prod_m", acProdMRouter);

app.use("/api/rd_size_d", rdSizeDRouter);
app.use("/api/rd_size_m", rdSizeMRouter);
app.use("/api/mm_item", mMItemRouter);
app.use("/api/ac_bom_m", acBomMRouter);
app.use("/api/ac_vend_base", acVendBaseRouter);
app.use("/api/ac_send_base", acSendBaseRouter);
app.use("/api/programs_group_d", programsGroupDRouter);
app.use("/api/programs_group_m", programsGroupMRouter);
app.use("/api/ac_srcorder_m", acSrcorderMRouter);
app.use("/api/ac_req_m", acReqMRouter);
app.use("/api/ac_req_order", acReqOrderRouter);
app.use("/api/iv_trans_d_tw", authMiddleware, ivTransDTwRouter);
app.use("/api/ac_cont_d", acContDRouter);
app.use("/api/ac_cont_m", authMiddleware, acContMRouter);
app.use("/api/ac_inm_m", acInmMRouter);
app.use("/api/ac_inm_d", acInmDRouter);
app.use("/api/ac_chg_m", acChgMRouter);
app.use("/api/ac_chg_d", acChgDRouter);
app.use("/api/ac_chg_a", acChgARouter);
app.use("/api/ac_proc_m", acProcMRouter);
app.use("/api/ac_proc_d", acProcDRouter);
app.use("/api/ac_desc_proc", acDescProcRouter);
app.use("/api/se_shipping_m", seShipingMRouter);
app.use("/api/se_shipping_d", seShipingDRouter);
app.use("/api/se_cust", seCustRouter);
app.use("/api/se_plan_ord", sePlanOrdRouter);
app.use("/api/se_plan_size", sePlanSizeRouter);
app.use("/api/sd_ord_m_c", sdOrdMCRouter);
app.use("/api/se_pay", sePayRouter);
app.use("/api/sd_ord_m", sdOrdMRouter);
app.use("/api/sd_price_item", sdPriceItemRouter);
app.use("/api/plan_ord", planOrdRouter);
app.use("/api/se_inv_m", seInvMRouter);
app.use("/api/se_inv_d", seInvDRouter);
app.use("/api/chg_m", chgMRouter);
app.use("/api/cd_code", cdCodeRouter);
app.use("/api/paking_list_m", pakingListMRouter);
app.use("/api/paking_list_d", pakingListDRouter);
app.use("/api/ac_issue_m_t", acIssueMTRouter);
app.use("/api/ac_issue_matd_t", acIssueMatdTRouter);
app.use("/api/ac_chk_t", acChkTRouter);
app.use("/api/se_sales", seSalesRouter);
app.use("/api/se_sales_d", seSalesDRouter);
app.use("/api/ac_expect_m", acExpectMRouter);
app.use("/api/ac_expect_se", acExpectSeRouter);
app.use("/api/ac_expect_matd", acExpectMatDRouter);
app.use("/api/ac_co_m", acCoMRouter);
app.use("/api/sap_trans_type", sapTransTypeRouter);
app.use("/api/ac_desc_chg", acDescChgRouter);
app.use("/api/ac_plan_ord", acPlanOrdRouter);
app.use("/api/ac_plan_size", acPlanSizeRouter);
app.use("/api/ac_plan_pack", acPlanPackRouter);
app.use("/api/sd_pack_m", sdPackMRouter);
/*----->VIEW<----*/
app.use("/api/vw_ac_shoebom", acShoeBomRouter);
app.use("/api/vw_ac_srcorder", acSrcorderRouter);
app.use("/api/vw_ac_allchk", vwAcAllChkRouter);
app.use("/api/vw_cont_imp", vwAcContImpRouter);
app.use("/api/vw_cont_use", vwAcContUseRouter);
app.use("/api/vw_chg_m", vwAcChgMRouter);
app.use("/api/vw_acreq_d", vwAcReqDRouter);
app.use("/api/vw_apdue_all", vwApdueAllRouter);
app.use("/api/vw_cont_exp", vwAcContExpRouter);
app.use("/api/vw_chg_exmp", vwAcChgExmpRouter);
app.use("/api/vw_chg_exp", vwAcChgExpRouter);
app.use("/api/vw_ac_issue_t", vwAcIssueTRouter);
app.use("/api/vw_ac_chgsum", vwAcChgSumRouter);
app.use("/api/vw_ac_sum", vwAcSumRouter);
app.use("/api/vw_ac_chg", vwAcChgRouter);
app.use("/api/vw_ac_chk_t", vwAcChkTRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
module.exports = { app };
