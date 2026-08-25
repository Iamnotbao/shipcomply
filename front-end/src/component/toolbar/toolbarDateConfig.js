const DATE_RANGE_LABELS = {
  VW_AC_SRCORDER: [
    ["order_date", "Order Date"],
    ["vr_cfmday", "Vr Cfm"],
  ],
  AC_SRCORDER_M: [
    ["order_date", "Order Date"],
    ["vr_cfmday", "Vr Cfm"],
  ],
  VW_AC_ALLCHK: [
    ["rcpt_date", "Rcpt Date"],
    ["vr_cfmday", "Vr Cfm"],
  ],
  VW_CONT_IMP: [
    ["lbl_issued_date", "Issued Date"],
    ["lbl_expire_date", "Expire Date"],
  ],
  VW_CONT_EXP: [
    ["lbl_issued_date", "Issued Date"],
    ["lbl_expire_date", "Expire Date"],
  ],
  AC_INM_M: [
    ["lbl_issued_date", "Issued Date"],
    ["lbl_expire_date", "Expire Date"],
  ],
  VW_CHG_M: [["out_date", "Out Date"]],
  VW_CHG_EXP: [["out_date", "Out Date"]],
  AC_PROC_M: [["ac_date", "Ac Date"]],
  AC_PROC_M_1: [["ac_date", "Ac Date"]],
  SE_SHIPING_M: [["start_date", "Start Date"]],
  SD_ORD_M_C: [["nlt", "NLT"]],
  SD_ORD_M: [
    ["se_day", "Se Day"],
    ["nst", "NST"],
    ["nlt", "NLT"],
  ],
  PLAN_ORD: [["p_shipdate", "Ship Date"]],
  SE_INV_M: [["invoice_date", "Invoice Date"]],
  CHG_M: [["out_date", "Out Date"]],
  AC_ISSUE_M_T: [
    ["out_date", "Out Date"],
    ["col4", "Col 4"],
    ["col3", "Col 3"],
  ],
  VW_AC_CHGSUM: [
    ["out_date", "Out Date"],
    ["fact_date", "Fact Date"],
  ],
  SE_SALES: [["sales_date", "Sales Date"]],
  AC_CO_M: [
    ["p_shipdate", "Start Ship Date"],
    ["board_date", "Board Date"],
    ["nlt", "nlt"],
  ],
  SE_PLAN_ORD_LINK: [["ship_date", "Ship Date"]],
  SE_PLAN_ORD: [
    ["p_shipdate", "Start Ship Date"],
    ["p_exdate", "Ex Date"],
    ["nst", "NST"],
    ["nlt", "NLT"],
  ],
  RD_TEMP: [["trans_date", "Trans Date"]],
};

export const getToolbarDateRangeConfig = (table, getControlLabel) => {
  const labels = DATE_RANGE_LABELS[table] || DATE_RANGE_LABELS.VW_CONT_IMP;

  const rows = labels.map(([key, fallback]) => ({
    label: getControlLabel(key, fallback),
  }));

  return {
    rows,
    row1Label: rows[0]?.label,
    row2Label: rows[1]?.label,
    row3Label: rows[2]?.label,
    row4Label: rows[3]?.label,
    hasRow2: rows.length >= 2,
    hasRow3: rows.length >= 3,
    hasRow4: rows.length >= 4,
  };
};

export default DATE_RANGE_LABELS;
