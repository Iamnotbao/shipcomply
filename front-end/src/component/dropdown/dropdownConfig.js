export const DROPDOWN_LABEL_FIELDS = {
  FACTORY: "factory_code",
  DEPARTMENTS: "department_code",
  USER: "user_code",
  PROGRAM: "program_code",
  USER_PERMISSION: "label",
  BASIC_DATA: "code_no",
  AC_SHOE_M: "size_no",
  AC_SHOE_REF: "prod_no",
  MM_ITEM: "item_no",
  AC_ITEM_M: "item_no",
  AC_CONT_M: "cont_no",
  AC_REQ_M: "declaration_category",
  AC_CONT_D: "goods_code",
};

export const DROPDOWN_CODE_FIELDS = {
  FACTORY: "factory_code",
  DEPARTMENTS: "department_code",
  USER: "user_code",
  PROGRAM: "program_code",
  USER_PERMISSION: "value",
  BASIC_DATA: "code_no",
  AC_SHOE_M: "size_no",
  AC_SHOE_M_1: "customs_shoe_id",
  AC_PROD_M_1: "prod_acno",
  AC_SHOE_REF: "prod_no",
  AC_PROD_M: "prod_acno",
  AC_VEND_BASE_1: "code_no",
  AC_VEND_BASE_2: "vend_no",
  AC_REQ_M_3: "invoice_no",
  AC_REQ_M_2: "ac_no",
  MM_ITEM: "item_no",
  AC_ITEM_M: "item_acno",
  AC_ITEMUNIT: "unit_no",
  PO_VENDER_M: "vend_no",
  AC_CONT_M: "cont_no",
  AC_REQ_M: "declaration_category",
  AC_REQ_M_1: "ac_type",
  AC_CONT_D: "goods_code",
  VW_CONT_IMP: "cont_no",
  VW_CONT_EXP: "cont_no",
  SE_SHIPING_M: "cust_id",
  AC_VEND_BASE: "vend_no",
  SD_ORD_M_C: "value",
  SE_CUST: "cust_id",
  SE_PAY: "pay_no",
  PAKING_LIST_M: "invoice_no",
  SD_ORD_M_C_1: "ship_seq",
  VW_SALES_SH: "col2",
  VW_SALES_SH_1: "code_no",
  AC_EXPECT_M_1: "code_no",
  AC_EXPECT_M: "expect_id",
  SE_PLAN_ORD: "se_id",
  VW_AC_ALLCHK: "__composite__",
  AC_IMP_MATERIAL_TRACKING: "invoice_no",
  AC_SEND_BASE: "stoc_type",
  AC_CONT_D_1: "__composite__",
  RD_SIZE_M: "size_type",
  SD_PACK_M: "__composite__",
  VW_AC_CHGSUM: "ac_no",
  USER_1: "supervisor_id",
};

export const DROPDOWN_NAME_FIELDS = {
  FACTORY: { en: "factory_name_e", vi: "factory_name_l", zh: "factory_name_t" },
  DEPARTMENTS: {
    en: "department_name_e",
    vi: "department_name_l",
    zh: "department_name_t",
  },
  USER: { en: "user_name_e", vi: "user_name_l", zh: "user_name_t" },
  PROGRAM: { en: "program_name_e", vi: "program_name_l", zh: "program_name_t" },
  BASIC_DATA: { en: "name_e", vi: "name_l", zh: "name_t" },
  AC_VEND_BASE: { en: "name", vi: "name", zh: "name" },
  MM_ITEM: { en: "name_e", vi: "name_l", zh: "name_t" },
  AC_SHOE_REF: { en: "name_e", vi: "name_s", zh: "name_t" },
  AC_ITEM_M: {
    en: "item_acname_e",
    vi: "item_acname_l",
    zh: "item_acname_t",
  },
};

const HEADER_FIELD_TABLES = new Set(["AC_SRCORDER_M", "CHG_M", "AC_CO_M"]);

export const normalizeSeq = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? String(value) : parsed.toFixed(2);
};

export const getDropdownCodeField = (table, headerField) => {
  if (["VW_AC_ALLCHK", "AC_CONT_D_1", "SD_PACK_M"].includes(table)) {
    return "__composite__";
  }
  if (table === "VW_AC_CHG") return headerField || "code_no";
  if (HEADER_FIELD_TABLES.has(table)) return headerField || "id";
  return DROPDOWN_CODE_FIELDS[table] || "id";
};

export const getDropdownItemCode = (item, table, codeField) => {
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return item;
  if (table === "VW_AC_ALLCHK") {
    return `${item.chk_no ?? ""}__${normalizeSeq(item.seq ?? item.chk_seq)}`;
  }
  if (table === "AC_CONT_D_1") {
    return `${item.cont_no ?? ""}__${normalizeSeq(item.seq)}`;
  }
  if (table === "SD_PACK_M") {
    return `${item.se_id ?? ""}__${normalizeSeq(item.se_seq)}__${item.pack_gu ?? ""}__${item.se_ver ?? ""}`;
  }
  return item[codeField] ?? "";
};

export const getSelectedDropdownCode = (select, table, codeField) => {
  if (!select || (Array.isArray(select) && select.length === 0)) return "";
  if (typeof select === "object" && !Array.isArray(select)) {
    return getDropdownItemCode(select, table, codeField);
  }
  return select || "";
};

export const getDropdownWidth = (table) => {
  if (table === "USER_PERMISSION") return 100;
  if (table === "USER") return 380;
  if (table === "FACTORY" || table === "DEPARTMENTS") return 360;
  return 250;
};

export const getDropdownTitles = ({ getControlLabel, t, field }) => ({
  factory: getControlLabel("lddl_factory", "Factory"),
  status: t("Status"),
  department: getControlLabel("lddl_department", "Department"),
  user: field || "user_code",
  user_1: getControlLabel("lddl_supervisor_id", "Supervisor"),
  users_permission: getControlLabel("txt_level", "Level"),
  program: getControlLabel("lddl_program", "Program Code"),
  basic_data: field || "",
  ac_shoe_m: field || "",
  ac_shoe_ref: field || "",
  ac_vend_base: field || "",
  ac_req_m: field || "",
  ac_srcorder_m: field || "",
  mm_item: field || "",
  ac_item_m: getControlLabel("itemnm", "Item Name") || "",
  ac_item_m_1: field || "",
  unit: field || "",
  po_vender_m: field || "",
  ac_cont_m: field || "",
  bank_param: field || "",
  bvend_no: field || "",
  goods_code: field || "ac_itemno",
  min_cont: field || "",
  cust_id: field || "",
  se_id: field || "",
  se_ver: field || "",
  se_seq: field || "",
  pack_gu: field || "",
  send_addr: field || "",
  column2: field || "",
  se_cust: field || "",
  ac_itemno: field || "ac_itemno",
  ac_shoe_m_1: field || "ac_shoe_m_1",
  se_pay: field || "se_pay",
  invoice_no: field || "invoice_no",
  packing_seid: field || "packing_seid",
  chg_type: field || "chg_type",
  ac_chgno: field || "ac_chgno",
  ac_no: field || "ac_no",
  cont_no: field || "cont_no",
  stoc_type: field || "",
  sales_no: field || "",
  send_type: field || "",
  send_corp: field || "",
  type: field || "",
  expect_id: field || "",
  print_id: field || "",
  se_custid: field || "",
  agent: field || "",
  item_no: field || "",
  declaration_category: field || "",
  loading_way: field || "",
  vend_no: field || "",
  ac_send: field || "",
  ac_type: field || "",
  vw_ac_allchk: field || "",
  price: field || "",
  in_cont: field || "",
  ac_item: field || "",
  ac_prod_m_1: field || "",
  prod_acno: field || "",
  size_type: field || "",
  in_acno: field || "",
});

export const getDropdownDisplayLabel = ({
  item,
  table,
  option,
  codeField,
  headerField,
  language,
}) => {
  if (!item) return "";
  if (typeof item === "string") return item;

  const code = item[codeField];

  if (table === "AC_ITEM_M") {
    const itemNo = item.item_acno || item.code_no;
    const itemName =
      item.itemnm ||
      item.item_acname_e ||
      item.item_acname_l ||
      item.item_acname_t ||
      null;
    if (item.ac_item) return `${item.ac_item} - ${itemNo || ""} - ${itemName || ""}`;
    if (itemName && itemNo) return `${itemNo} - ${itemName}`;
    return itemNo || code || "";
  }
  if (table === "PAKING_LIST_M") return String(item.invoice_no ?? "");
  if (table === "SD_ORD_M_C_1") {
    return `${item.se_id ?? ""}-${item.ship_seq ?? ""}-${item.se_custid ?? ""}`;
  }
  if (table === "AC_ITEMUNIT") {
    const unitCode = item.unit || item.unit_code || item.code_no;
    return item.unit_name && unitCode ? `${unitCode} - ${item.unit_name}` : unitCode || "";
  }
  if (table === "AC_VEND_BASE_2") {
    const vendNo = item.vend_no || item.code_no;
    const fullName = item.FULLNM_E || item.fullnm_e || item.name;
    return fullName && vendNo ? `${vendNo} - ${fullName}` : vendNo || code || "";
  }
  if (table === "VW_AC_ALLCHK") {
    return `${item.chk_no ?? ""} - ${item.chk_seq ?? item.seq ?? ""}`;
  }
  if (table === "AC_CONT_D_1" && option === "price") {
    return `${item.cont_no ?? ""}-${item.seq ?? ""} - ${item.price ?? ""}`;
  }
  if (table === "AC_CONT_D_1" && option === "ac_itemno") {
    return `${item.cont_no ?? ""}-${item.seq ?? ""} - ${item.goods_code ?? ""}`;
  }
  if (table === "SD_PACK_M" && option === "se_id") {
    return `${item.se_id ?? ""}-${item.se_seq ?? ""} - ${item.pack_gu ?? ""} - ${item.se_ver ?? ""}`;
  }
  if (table === "AC_VEND_BASE_1") {
    return item.name && item.code_no ? `${item.code_no} - ${item.name}` : item.code_no || "";
  }
  if (table === "AC_CONT_D" && option === "price") {
    return `${item.cont_no ?? ""} - ${item.cont_price ?? ""} - ${item.seq ?? ""}`;
  }
  if (table === "BASIC_DATA") {
    const name = item.name || item.name_e || item.name_l || item.name_t;
    return name && item.code_no ? `${item.code_no} - ${name}` : item.code_no || "";
  }
  if (table === "AC_SHOE_M") return String(item.size_no ?? "");
  if (table === "AC_CONT_M" && option === "big_contno") return String(item.cont_no ?? "");
  if (table === "AC_CONT_M" && option === "bank_param") return String(item[headerField] ?? "");
  if (table === "AC_REQ_M") return String(item.ac_type ?? "");
  if (table === "AC_REQ_M_3") return String(item[headerField] ?? "");
  if (table === "PO_VENDER_M" && option === "po_vender_m") {
    return item.vend_name && item.vend_no
      ? `${item.vend_no} - ${item.vend_name}`
      : item.vend_no || "";
  }
  if (table === "AC_SRCORDER_M" && option === "ac_srcorder_m") {
    return String(item[headerField] ?? "");
  }
  if (table === "CHG_M" || table === "AC_CO_M") return String(item[headerField] ?? "");
  if (table === "VW_AC_CHG" && headerField === "stoc_type") {
    return String(item.code_name ?? "");
  }
  if (table === "VW_CONT_IMP" && headerField === "cont_no_1") {
    return `${item.cont_no ?? ""}-${item.issued_date ?? ""}-${item.expire_date ?? ""}`;
  }
  if (table === "VW_SALES_SH") return `${item.col2 ?? ""}-${item.sales_date ?? ""}`;
  if (table === "VW_SALES_SH_1" || table === "SE_PLAN_ORD") {
    return `${item.code_no ?? ""}-${item.name ?? ""}`;
  }

  const localizedNames = DROPDOWN_NAME_FIELDS[table];
  if (localizedNames) {
    const nameField = localizedNames[language] || localizedNames.en;
    const name = item[nameField];
    if (code && name) return `${code} - ${name}`;
    return code || name || "";
  }

  return item[DROPDOWN_LABEL_FIELDS[table]] || code || "";
};
