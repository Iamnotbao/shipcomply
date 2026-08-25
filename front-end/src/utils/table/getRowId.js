/**
 * Generate unique row ID based on table type and row data
 * Different tables have different primary key combinations
 *
 * @param {Object} row - The row data
 * @param {string} tableName - The name of the table
 * @returns {string} Unique row identifier
 */
// Counter for generating unique IDs
let idCounter = 0;

export const getRowId = (row, tableName) => {
  // Return fallback if row is null/undefined
  if (!row) {
    idCounter++;
    return `empty-${Date.now()}-${idCounter}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // Helper to create safe ID - replace undefined/null with fallback
  const safeId = (...parts) => {
    const cleanParts = parts.map((p) =>
      p === null || p === undefined || p === "" ? "undefined" : String(p),
    );
    const id = cleanParts.join("-");
    // If any part is undefined, add unique suffix to prevent duplicates
    const hasUndefined = cleanParts.some((part) => part === "undefined");
    if (hasUndefined) {
      idCounter++;
      return `${id}-${Date.now()}-${idCounter}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    return id;
  };

  // Define ID generators for each table type
  const idGenerators = {
    USER: (r) => safeId(r.factory_code, r.department_code, r.user_code),
    FACTORY: (r) => safeId(r.factory_code),
    DEPARTMENTS: (r) => safeId(r.factory_code, r.department_code),
    USER_PERMISSION: (r) =>
      safeId(r.factory_code, r.department_code, r.user_code, r.program_code),
    USER_PERMISSION_DEPARTMENT: (r) =>
      safeId(r.factory_code, r.department_code),
    BASIC_DATA_CATEGORY: (r) => safeId(r.factory_code, r.category_code),
    BASIC_DATA: (r) => safeId(r.factory_code, r.category_code, r.code_no),
    AC_BASIC_DATA: (r) => safeId(r.factory_code, r.category_code, r.item_acno),
    PROGRAM: (r) => safeId(r.program_code),
    PROGRAM_FIELD_TITLE: (r) => safeId(r.program_code, r.field_code),
    AC_IMP_MATERIAL_TRACKING: (r) =>
      safeId(r.factory_code, r.invoice_no, r.sort),
    AC_ITEM_M: (r) => safeId(r.factory_code, r.item_acno),
    AC_ITEM_REF: (r) => safeId(r.factory_code, r.item_acno, r.item_no),
    AC_SHOE_M: (r) => safeId(r.factory_code, r.customs_shoe_id),
    AC_SHOE_REF: (r) => safeId(r.factory_code, r.customs_shoe_id, r.prod_no),
    AC_PROD_M: (r) => safeId(r.factory_code, r.customs_shoe_id, r.prod_acno),
    AC_BOM_M: (r) => safeId(r.factory_code, r.prod_acno, r.item_acno),
    RD_SIZE_D: (r) =>
      safeId(r.factory_code, r.size_type, r.size_no, r.size_seq),
    VW_AC_SHOEBOM: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.customs_shoe_id ?? "unknown",
        r?.prod_acno ?? "unknown",
        r?.item_acno ?? "unknown",
      ),
    VW_AC_SRCORDER: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.id ?? "unknown"),
    VW_AC_ALLCHK: (r) =>
      safeId(
        r?.rcpt_date ?? "unknown",
        r?.chk_no ?? "unknown",
        r?.chk_seq ?? "unknown",
      ),
    VW_CONT_IMP: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.cont_no ?? "unknown"),
    VW_CHG_M: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.ac_no ?? "unknown"),
    VW_CONT_USE: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.cont_no ?? "unknown",
        r?.seq ?? "unknown",
        r?.ac_date??"unknown",
        r?.ac_chgno??"unknown",
        r?.ac_itemname??"unknown",
        r?.ac_itemno??"unknown",
        r?.ac_no??"unknown",
        r?.mincont??"unknown",
        r?.money??"unknown",
        r?.qty??"unknown",
        r?.seq??"unknown",
        r?.unit??"unknown",
        r?.unit_name??"unknown",
      ),
    AC_CONT_D: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.cont_no ?? "unknown",
        r?.seq ?? "unknown",
      ),
    AC_VEND_BASE: (r) =>
      safeId(r?.vend_no ?? "unknown", r?.ac_send ?? "unknown"),
    AC_SEND_BASE: (r) => safeId(r?.ac_send ?? "unknown"),
    AC_SRCORDER_M: (r) => safeId(r.factory_code, r.id),
    AC_REQ_M: (r) => safeId(r.factory_code, r.req_no),
    AC_REQ_ORDER: (r) => safeId(r.factory_code, r.req_no, r.req_seq),
    AC_INM_M: (r) => safeId(r.factory_code ?? "unknown", r.inm_no ?? "unknown"),
    AC_INM_D: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.inm_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    AC_CHG_M: (r) => safeId(r.factory_code ?? "unknown", r.ac_no ?? "unknown"),
    AC_CHG_D: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    AC_CHG_A: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    AC_DESC_CHG: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),

    AC_PLAN_ORD: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
      ),
    AC_PLAN_SIZE: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.size_no ?? "unknown",
      ),
    AC_PLAN_PACK: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.pk_seq ?? "unknown",
      ),
    AC_DESC_PROC: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    VW_ACREQ_D: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.req_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    VW_APDUE_ALL: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ap_id ?? "unknown",
        r?.due_id ?? "unknown",
      ),
    AC_PROC_M: (r) => safeId(r.factory_code ?? "unknown", r.ac_no ?? "unknown"),
    AC_PROC_M_1: (r) =>
      safeId(r.factory_code ?? "unknown", r.ac_no ?? "unknown"),
    AC_PROC_D: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    AC_PROC_D_1: (r) =>
      safeId(
        r.factory_code ?? "unknown",
        r.ac_no ?? "unknown",
        r.seq ?? "unknown",
      ),
    IV_TRANS_D_TW: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.trans_no ?? "unknown",
        r?.trans_seq ?? "unknown",
      ),
    SE_SHIPING_M: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.cust_id ?? "unknown",
        r?.si_seq ?? "unknown",
      ),
    SE_SHIPING_D: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.cust_id ?? "unknown",
        r?.si_seq ?? "unknown",
        r?.si_type ?? "unknown",
      ),
    SE_PLAN_ORD: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
      ),
    SE_PLAN_SIZE: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.pk_seq ?? "unknown",
      ),
    SD_ORD_M_C: (r) => safeId(r?.org_id ?? "unknown", r?.se_id ?? "unknown"),
    VW_CONT_EXP: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.cont_no ?? "unknown"),
    SE_PAY: (r) => safeId(r?.factory_code ?? "unknown", r?.pay_no ?? "unknown"),
    SD_ORD_M: (r) =>
      safeId(
        r?.org_id ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.se_ver ?? "unknown",
      ),
    SD_PRICE_ITEM: (r) =>
      safeId(
        r?.org_id ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.se_ver ?? "unknown",
      ),
    SD_PRICE_ITEM_1: (r) =>
      safeId(
        r?.prod_no ?? "unknown",
        r?.factory_code ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.se_ver ?? "unknown",
      ),
    VW_CHG_EXP: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.se_id?? "unknown",
        r?.ship_seq?? "unknown",
      ),
    VW_CHG_EXMP: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.seq ?? "unknown",
      ),
    PLAN_ORD: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
      ),
    SE_INV_M: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.invoice_id ?? "unknown",
      ),
    CHG_M: (r) => safeId(r?.factory_code ?? "unknown", r?.ac_no ?? "unknown"),
    SE_INV_D: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.acno ?? "unknown",
        r?.invoice_id ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pk_seq ?? "unknown",
      ),
    PAKING_LIST_M: (r) =>
      safeId(
        r?.org_id ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.ship_seq ?? "unknown",
      ),
    PAKING_LIST_D: (r) =>
      safeId(
        r?.org_id ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pk_seq ?? "unknown",
        r?.size_seq ?? "unknown",
        r?.size_no ?? "unknown",
      ),
    AC_ISSUE_M_T: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.conf_seq ?? "unknown"),
    VW_AC_ISSUE_T: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.conf_seq ?? "unknown",
        r?.matd_no ?? "unknown",
      ),
    VW_AC_CHK_T: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.conf_seq ?? "unknown"),
    AC_ISSUE_MATD_T: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.conf_seq ?? "unknown",
        r?.matd_seq ?? "unknown",
      ),
    AC_CHK_T: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.conf_seq ?? "unknown",
        r?.matd_seq ?? "unknown",
        r?.issue_seq ?? "unknown",
      ),
    VW_AC_SUM: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.ac_itemno ?? "unknown",r?.ac_itemname ?? "unknown",r?.in_qty?? "unknown",r?.out_qty?? "unknown",r?.left_qty?? "unknown",r?.stoc_type??"unknown"),
    VW_AC_CHGSUM: (r) =>
      safeId(
        r?.org_id ?? "unknown",
        r?.ac_no ?? "unknown",
        r?.ac_itemno ?? "unknown",
        r?.ac_date ?? "unknown",
      ),
    SE_SALES: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.sales_id ?? "unknown"),
    SE_SALES_D: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.sales_id ?? "unknown",
        r?.sales_seq ?? "unknown",
      ),
    AC_EXPECT_M: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.expect_id ?? "unknown"),
    AC_EXPECT_SE: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.expect_id ?? "unknown", r?.seq),
    AC_EXPECT_MATD: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.expect_id ?? "unknown", r?.seq),
    AC_CO_M: (r) => safeId(r?.factory_code ?? "unknown", r?.co_id ?? "unknown"),
    SE_PLAN_ORD_LINK: (r) =>
      safeId(
        r?.factory_code ?? "unknown",
        r?.se_id ?? "unknown",
        r?.se_ver ?? "unknown",
        r?.se_seq ?? "unknown",
        r?.ship_seq ?? "unknown",
        r?.pack_gu ?? "unknown",
      ),
    RD_TEMP: (r) => safeId(r?.item_no ?? "unknown", r?.code_no ?? "unknown"),
    SAP_TRANS_TYPE: (r) =>
      safeId(r?.factory_code ?? "unknown", r?.type_no ?? "unknown"),
    TEXT_IMPORT: (r) =>
      safeId(
        r?.varchar03 ?? "unknown",
        r?.varchar04 ?? "unknown",
        r?.varchar05 ?? "unknown",
      ),
  };

  // Get the appropriate generator for this table type
  const generator = idGenerators[tableName];

  // Use generator if available, otherwise fallback to common ID fields
  if (generator) {
    try {
      const generatedId = generator(row);
      // Debug: Log if we're generating duplicate undefined IDs
      if (
        generatedId &&
        generatedId.startsWith(
          "undefined-undefined-undefined-undefined-undefined",
        ) &&
        generatedId === "undefined-undefined-undefined-undefined-undefined"
      ) {
        console.warn(
          `[getRowId] Table ${tableName} generated duplicate ID without timestamp:`,
          generatedId,
          "Row:",
          row,
        );
      }
      return generatedId;
    } catch (error) {
      console.warn(
        `Error generating ID for table ${tableName}:`,
        error,
        "Row:",
        row,
      );
      idCounter++;
      return `error-${tableName}-${idCounter}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
  }

  // Fallback: try common ID field names
  idCounter++;
  return (
    row.id ||
    row.code ||
    row.seq_no ||
    `fallback-${tableName}-${idCounter}-${Math.random()
      .toString(36)
      .substr(2, 9)}`
  );
};
