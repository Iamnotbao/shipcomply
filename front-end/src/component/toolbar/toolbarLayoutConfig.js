const FLEX_ACTION_TABLES = new Set([
  "USER_PERMISSION",
  "BASIC_DATA",
  "AC_VEND_BASE",
  "AC_SEND_BASE",
  "AC_REQ_ORDER",
  "VW_AC_SRCORDER",
  "VW_AC_ALLCHK",
  "IV_TRANS_D_TW",
  "AC_SHOE_REF",
  "AC_REQ_M",
  "AC_CONT_D",
  "AC_INM_D",
  "AC_INM_M",
  "VW_CONT_USE",
  "SE_PAY",
  "VW_CHG_EXMP",
  "AC_CHG_D",
  "AC_CHG_A",
  "AC_DESC_CHG",
  "AC_PROC_D",
  "AC_PROC_D_1",
  "SE_SHIPING_D",
  "SE_PLAN_SIZE",
  "AC_DESC_PROC",
  "SE_INV_D",
  "AC_ISSUE_MATD_T",
  "VW_AC_ISSUE_T",
  "AC_CHK_T",
  "AC_PLAN_SIZE",
  "AC_PLAN_ORD",
  "RD_TEMP",
]);

const FIXED_ACTION_WIDTHS = {
  AC_PROC_M: "165px",
  AC_PROC_M_1: "165px",
  VW_CHG_M: "160px",
  VW_CHG_EXP: "235px",
  AC_EXPECT_M: "600px",
  SE_PLAN_ORD: "400px",
  AC_ISSUE_M_T: "80px",
  VW_AC_CHGSUM: "180px",
  AC_CO_M: "310px",
};

const WIDE_LANGUAGE_TABLES = new Set(["VW_CONT_IMP", "VW_CONT_EXP", "AC_INM_M"]);
const FULL_WIDTH_TABLES = new Set([
  "AC_SHOE_REF",
  "AC_SHOE_M",
  "IV_TRANS_D_TW",
  "RD_TEMP",
  "SE_INV_M",
  "AC_IMP_MATERIAL_TRACKING",
  "AC_REQ_M",
]);

export const getToolbarActionFlex = (table) =>
  FLEX_ACTION_TABLES.has(table) ? "1 1 auto" : "0 0 auto";

export const getToolbarActionMaxWidth = (table, language) => {
  if (FIXED_ACTION_WIDTHS[table]) return FIXED_ACTION_WIDTHS[table];
  if (WIDE_LANGUAGE_TABLES.has(table)) return language === "zh" ? "360px" : "270px";
  if (FULL_WIDTH_TABLES.has(table)) return "385px";
  return "100%";
};

export const getToolbarAlignItems = (table) =>
  table === "SD_ORD_M" ? "center" : "flex-start";
