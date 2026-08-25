const FACTORY = require("../modules/factories/factory.model");
const DEPARTMENTS = require("../modules/factory_departments/factory_deparments.model");
const USER = require("../modules/users/user.model");
const USER_PERMISSION = require("../modules/users_permission/users_permission.model");
const PROGRAM = require("../modules/program/program.model");
const PROGRAM_FIELD_TITLE = require("../modules/program_field_title/program_field_title.model");
const BASIC_DATA = require("../modules/basic_data/basic_data.model");
const BASIC_DATA_CATEGORY = require("../modules/basic_data_category/basic_data_category.model");
const AC_IMP_MATERIAL_TRACKING = require("../modules/ac_imp_material_tracking/ac_imp_material_tracking.model");
const AC_ITEM_M = require("../modules/ac_item_m/ac_item_m.model");
const AC_ITEM_REF = require("../modules/ac_item_ref/ac_item_ref.model");
const AC_SHOE_M = require("../modules/ac_shoe_m/ac_shoe_m.model");
const AC_SHOE_REF = require("../modules/ac_shoe_ref/ac_shoe_ref.model");
const AC_PROD_M = require("../modules/ac_prod_m/ac_prod_m.model");
const AC_BOM_M = require("../modules/ac_bom_m/ac_bom_m.model");
const RD_SIZE_D = require("../modules/rd_size_d/rd_size_d.model");
const AC_VEND_BASE = require("../modules/ac_vend_base/ac_vend_base.model");
const AC_SEND_BASE = require("../modules/ac_send_base/ac_send_base.model");
const AC_SRCORDER_M = require("../modules/ac_srcorder_m/ac_srcorder_m.model");
const AC_REQ_M = require("../modules/ac_req_m/ac_req_m.model");
const AC_REQ_ORDER = require("../modules/ac_req_order/ac_req_order.model");
const IV_TRANS_D_TW = require("../modules/iv_trans_d_tw/iv_trans_d_tw.model");
const AC_INM_M = require("../modules/ac_inm_m/ac_inm_m.model");
const AC_CONT_M = require("../modules/ac_cont_m/ac_cont_m.model");
const AC_INM_D = require("../modules/ac_inm_d/ac_inm_d.model");
const AC_CONT_D = require("../modules/ac_cont_d/ac_cont_d.model");
const AC_CHG_M = require("../modules/ac_chg_m/ac_chg_m.model");
const AC_CHG_D = require("../modules/ac_chg_d/ac_chg_d.model");
const AC_CHG_A = require("../modules/ac_chg_a/ac_chg_a.model");
const AC_PROC_M = require("../modules/ac_proc_m/ac_proc_m.model");
const AC_PROC_D = require("../modules/ac_proc_d/ac_proc_d.model");
const AC_DESC_PROC = require("../modules/ac_desc_proc/ac_desc_proc.model");
const SE_SHIPING_M = require("../modules/se_shiping_m/se_shiping_m.model");
const SE_SHIPPING_D = require("../modules/se_shiping_d/se_shiping_d.model");
const SE_SHIPING_D = require("../modules/se_shiping_d/se_shiping_d.model");
const SE_PLAN_ORD = require("../modules/se_plan_ord/se_plan_ord.model");
const SE_PLAN_SIZE = require("../modules/se_plan_size/se_plan_size.model");
const SE_PAY = require("../modules/se_pay/se_pay.model");
const SD_ORD_M = require("../modules/sd_ord_m/sd_ord_m.model");
const SD_PRICE_ITEM = require("../modules/sd_price_item/sd_price_item.model");
const SE_INV_M = require("../modules/se_inv_m/se_inv_m.model");
const AC_ISSUE_M_T = require("../modules/ac_issue_m_t/ac_issue_m_t.model");
const AC_ISSUE_MATD_T = require("../modules/ac_issue_matd_t/ac_issue_matd_t.model");
const AC_CHK_T = require("../modules/ac_chk_t/ac_chk_t.model");
const AC_EXPECT_M = require("../modules/ac_expect_m/ac_expect_m.model");
const AC_EXPECT_SE = require("../modules/ac_expect_matd/ac_expect_matd.model");
const AC_EXPECT_MATD = require("../modules/ac_expect_matd/ac_expect_matd.model");
const AC_CO_M = require("../modules/ac_co_m/ac_co_m.model");
const SE_SALES = require("../modules/se_sales/se_sales.model");
const SE_SALES_D = require("../modules/se_sales_d/se_sales_d.model");
const AC_DESC_CHG = require("../modules/ac_desc_chg/ac_desc_chg.model");
const AC_PLAN_ORD = require("../modules/ac_plan_ord/ac_plan_ord.model");
const AC_PLAN_SIZE = require("../modules/ac_plan_size/ac_plan_size.model");
// Factory <-> FactoryDepartments(1:N)
FACTORY.hasMany(DEPARTMENTS, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
DEPARTMENTS.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> BasicData(1:N)
FACTORY.hasMany(BASIC_DATA, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
//  BasicDataCategory<-> BasicData(1:N)
BASIC_DATA.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> BasicDataCategory(1:N)
FACTORY.hasMany(BASIC_DATA_CATEGORY, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
BASIC_DATA_CATEGORY.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
BASIC_DATA.belongsTo(BASIC_DATA_CATEGORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "CATEGORY",
});
BASIC_DATA_CATEGORY.hasMany(BASIC_DATA, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "basicDataList",
});

// Factory <-> AC_IMP_MATERIAL_TRACKING(1:N)
FACTORY.hasMany(AC_IMP_MATERIAL_TRACKING, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_IMP_MATERIAL_TRACKING.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(AC_ITEM_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_ITEM_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(AC_ITEM_REF, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_ITEM_REF.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Program  <-> PROGRAM_FIELD_TITLE(1:N)
PROGRAM.hasMany(PROGRAM_FIELD_TITLE, {
  foreignKey: "program_code",
  sourceKey: "program_code",
});
PROGRAM_FIELD_TITLE.belongsTo(PROGRAM, {
  foreignKey: "program_code",
  targetKey: "program_code",
});
// Factory <-> User(1:N)
FACTORY.hasMany(USER, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
USER.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});

// Department <-> User(1:N)
DEPARTMENTS.hasMany(USER, {
  foreignKey: "department_code",
  sourceKey: "department_code",
});
USER.belongsTo(DEPARTMENTS, {
  foreignKey: "department_code",
  targetKey: "department_code",
});

// USER <-> USERS_PERMISSION(1:N)
USER.hasMany(USER_PERMISSION, {
  foreignKey: "user_code",
  sourceKey: "user_code",
});
USER_PERMISSION.belongsTo(USER, {
  foreignKey: "user_code",
  targetKey: "user_code",
});

// FACTORY <-> USERS_PERMISSION(1:N)
FACTORY.hasMany(USER_PERMISSION, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
USER_PERMISSION.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_SHOE_M<->FACTORY
FACTORY.belongsTo(AC_SHOE_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
AC_SHOE_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_PROD_M<->FACTORY
FACTORY.belongsTo(AC_PROD_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
AC_PROD_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_SHOE_REF<->FACTORY
FACTORY.belongsTo(AC_SHOE_REF, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
AC_SHOE_REF.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// AC_BOM_M <-> FACTORY(1:N)
FACTORY.hasMany(AC_BOM_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_BOM_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
// AC_SHOE_M <-> AC_PROD_M(1:N)
AC_SHOE_M.hasMany(AC_PROD_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "PROD",
});
AC_PROD_M.belongsTo(AC_SHOE_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "SHOE",
});
// AC_SHOE_M <-> AC_SHOE_REF(1:N)
AC_SHOE_M.hasMany(AC_SHOE_REF, {
  foreignKey: "customs_shoe_id",
  sourceKey: "customs_shoe_id",
  as: "ACSHOEREF",
});
AC_SHOE_REF.belongsTo(AC_SHOE_M, {
  foreignKey: "customs_shoe_id",
  sourceKey: "customs_shoe_id",
  as: "ACSHOEM",
});
// AC_BOM_M <-> AC_PROD_M(1:N)
AC_PROD_M.hasMany(AC_BOM_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_BOM_M.belongsTo(AC_PROD_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
// PROGRAM <-> USER_PERMISSION(1:N)
PROGRAM.hasMany(USER_PERMISSION, {
  foreignKey: "program_code",
  sourceKey: "program_code",
});
USER_PERMISSION.belongsTo(PROGRAM, {
  foreignKey: "program_code",
  targetKey: "program_code",
});
//AC_ITEM_M<->AC_ITEM_REF
AC_ITEM_REF.belongsTo(AC_ITEM_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "ITEM_ACNO",
});
AC_ITEM_M.hasMany(AC_ITEM_REF, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "basicDataList",
});
//FACTORY<->RD_SIZE_D
FACTORY.hasMany(RD_SIZE_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
RD_SIZE_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_SHOE_M<->RD_SIZE_D
AC_SHOE_M.hasMany(RD_SIZE_D, {
  foreignKey: "size_type",
  sourceKey: "size_type",
  as: "RD_SIZE_D",
});
RD_SIZE_D.belongsTo(AC_SHOE_M, {
  foreignKey: "size_type",
  targetKey: "size_type",
  as: "AC_SHOE_M",
});
//FACTORY<->AC_VEND_BASE
FACTORY.hasMany(AC_VEND_BASE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_VEND_BASE.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_SEND_BASE
FACTORY.hasMany(AC_SEND_BASE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_SEND_BASE.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_SRCORDER_M
FACTORY.hasMany(AC_SRCORDER_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_SRCORDER_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_REQ_M
FACTORY.hasMany(AC_REQ_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_REQ_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_REQ_ORDER
FACTORY.hasMany(AC_REQ_ORDER, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_REQ_ORDER.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->IV_TRANS_D_TW
FACTORY.hasMany(IV_TRANS_D_TW, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
IV_TRANS_D_TW.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_INM_M
FACTORY.hasMany(AC_INM_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_INM_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_CONT_M
FACTORY.hasMany(AC_CONT_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CONT_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_CONT_D
FACTORY.hasMany(AC_CONT_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CONT_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_INM_D
FACTORY.hasMany(AC_INM_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_INM_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_INM_M<->AC_INM_D
AC_INM_D.belongsTo(AC_INM_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "AIM",
});
AC_INM_M.hasMany(AC_INM_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "AID",
});
//FACTORY<->AC_CHG_M
FACTORY.hasMany(AC_CHG_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CHG_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_CHG_M
FACTORY.hasMany(AC_CHG_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CHG_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_CHG_M<->AC_INM_D
AC_CHG_D.belongsTo(AC_CHG_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "AcCM",
});
AC_CHG_M.hasMany(AC_CHG_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "AcCD",
});
//AC_CHG_M<->AC_CHG_A
AC_CHG_A.belongsTo(AC_CHG_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "AcCM",
});
AC_CHG_M.hasMany(AC_CHG_A, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "AcCA",
});
//AC_CHG_M<->AC_DESC_CHG
AC_DESC_CHG.belongsTo(AC_CHG_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "AcCM",
});
AC_CHG_M.hasMany(AC_DESC_CHG, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "AcDC",
});
//FACTORY<->AC_DESC_CHG
FACTORY.hasMany(AC_DESC_CHG, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_DESC_CHG.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});

//AC_CHG_M<->AC_DESC_CHG
AC_PLAN_SIZE.belongsTo(AC_PLAN_ORD, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "AcPO",
});
AC_PLAN_ORD.hasMany(AC_PLAN_SIZE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "AcPS",
});
//FACTORY<->AC_DESC_CHG
FACTORY.hasMany(AC_PLAN_SIZE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_PLAN_SIZE.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_DESC_CHG
FACTORY.hasMany(AC_PLAN_ORD, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_PLAN_ORD.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_CHG_A
FACTORY.hasMany(AC_CHG_A, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CHG_A.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_PROC_M
FACTORY.hasMany(AC_PROC_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_PROC_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_PROC_D
FACTORY.hasMany(AC_PROC_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_PROC_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//FACTORY<->AC_PROC_D
AC_PROC_M.hasMany(AC_PROC_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "APM",
});
AC_PROC_D.belongsTo(AC_PROC_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "APD",
});
//FACTORY<->AC_DESC_PROC
FACTORY.hasMany(AC_DESC_PROC, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_DESC_PROC.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
//AC_PROC_M<->AC_DESC_PROC
AC_DESC_PROC.belongsTo(AC_PROC_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "ADP",
});
AC_PROC_M.hasMany(AC_DESC_PROC, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "APMADP",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(SE_SHIPING_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_SHIPING_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(SE_SHIPPING_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_SHIPPING_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ITEM_M(1:N)
SE_SHIPING_M.hasMany(SE_SHIPING_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "SSD",
});
SE_SHIPING_D.belongsTo(SE_SHIPING_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "SSM",
});
// Factory <-> SE_PLAN_ORD(1:N)
FACTORY.hasMany(SE_PLAN_ORD, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_PLAN_ORD.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(SE_PLAN_SIZE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_PLAN_SIZE.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// // Factory <-> AC_ITEM_M(1:N)
SE_PLAN_ORD.hasMany(SE_PLAN_SIZE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "SPO",
});
SE_PLAN_SIZE.belongsTo(SE_PLAN_ORD, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "SPS",
});
// Factory <-> AC_ITEM_M(1:N)
FACTORY.hasMany(SE_PAY, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_PAY.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> SD_ORD_M(1:N)
FACTORY.hasMany(SD_ORD_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SD_ORD_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> SD_PRICE_ITEM(1:N)
FACTORY.hasMany(SD_PRICE_ITEM, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SD_PRICE_ITEM.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// // SD_ORD_M <-> SD_PRICE_ITEM(1:N)
SD_ORD_M.hasMany(SD_PRICE_ITEM, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
  as: "SdOM",
});
SD_PRICE_ITEM.belongsTo(SD_ORD_M, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
  as: "SPI",
});
// Factory <-> SD_PRICE_ITEM(1:N)
FACTORY.hasMany(SE_INV_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_INV_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ISSUE_M_T(1:N)
FACTORY.hasMany(AC_ISSUE_M_T, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_ISSUE_M_T.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_ISSUE_MATD_T(1:N)
FACTORY.hasMany(AC_ISSUE_MATD_T, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_ISSUE_MATD_T.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_CHK_T(1:N)
FACTORY.hasMany(AC_CHK_T, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CHK_T.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_EXPECT_M(1:N)
FACTORY.hasMany(AC_EXPECT_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_EXPECT_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_EXPECT_SE(1:N)
FACTORY.hasMany(AC_EXPECT_SE, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_EXPECT_SE.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_EXPECT_MATD(1:N)
FACTORY.hasMany(AC_EXPECT_MATD, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_EXPECT_MATD.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> AC_CO_M(1:N)
FACTORY.hasMany(AC_CO_M, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
AC_CO_M.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> SE_SALES(1:N)
FACTORY.hasMany(SE_SALES, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_SALES.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
// Factory <-> SE_SALES_D(1:N)
FACTORY.hasMany(SE_SALES_D, {
  foreignKey: "factory_code",
  sourceKey: "factory_code",
});
SE_SALES_D.belongsTo(FACTORY, {
  foreignKey: "factory_code",
  targetKey: "factory_code",
});
module.exports = { FACTORY, DEPARTMENTS, USER, USER_PERMISSION, PROGRAM };
