const field = (getControlLabel, key, fallback, name = key, options = {}) => ({
  title: getControlLabel(key, fallback),
  name,
  ...options,
});

const defaultHide = [];

export const CORE_TOOLBAR_TABLES = new Set([
  "FACTORY",
  "PERMISSION",
  "USER_PERMISSION",
  "USER",
  "DEPARTMENTS",
  "PROGRAM",
  "PROGRAM_FIELD_TITLE",
  "BASIC_DATA_CATEGORY",
  "BASIC_DATA",
  "AC_IMP_MATERIAL_TRACKING",
  "AC_ITEM_M",
  "AC_BOM_M",
  "AC_SHOE_M",
  "AC_PROD_M",
]);

export const createCoreToolbarTableConfig = ({ getControlLabel }) => ({
  FACTORY: {
    filters: [
      field(getControlLabel, "lbl_factory_code", "factory_code"),
      field(getControlLabel, "lbl_factory_name", "factory_name"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  PERMISSION: {
    filters: [
      field(getControlLabel, "lbl_factory_code", "factory_code"),
      field(getControlLabel, "lbl_factory_name", "factory_name"),
      field(getControlLabel, "lbl_user_code", "user_code"),
      field(getControlLabel, "lbl_user_name", "user_name"),
      field(getControlLabel, "lbl_program_code", "program_code"),
    ],
    hideButtons: [getControlLabel("btn_edit", "Edit")],
  },
  USER_PERMISSION: {
    filters: [],
    hideButtons: [getControlLabel("btn_search", "Search")],
  },
  USER: {
    filters: [
      field(getControlLabel, "lbl_factory_code", "factory_code"),
      field(getControlLabel, "lbl_factory_name", "factory_name"),
      field(getControlLabel, "lbl_department_code", "department_code"),
      field(getControlLabel, "lbl_user_code", "user_code"),
      field(getControlLabel, "lbl_user_name", "user_name"),
      field(getControlLabel, "lbl_supervisor_id", "supervisor_id"),
      field(
        getControlLabel,
        "lbl_allow_authorization",
        "allow_authorization",
      ),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  DEPARTMENTS: {
    filters: [
      field(getControlLabel, "lbl_factory_code", "factory_code"),
      field(getControlLabel, "lbl_factory_name", "factory_name"),
      field(getControlLabel, "lbl_department_code", "department_code"),
      field(getControlLabel, "lbl_department_name", "department_name"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  PROGRAM: {
    filters: [
      field(getControlLabel, "lbl_program_code", "program_code"),
      field(getControlLabel, "lbl_program_name", "program_name"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  PROGRAM_FIELD_TITLE: {
    filters: [
      field(getControlLabel, "lbl_program_code", "program_code"),
      field(getControlLabel, "lbl_program_name", "program_name"),
      field(getControlLabel, "lbl_field_code", "field_code"),
      field(getControlLabel, "lbl_title_name", "title_name"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  BASIC_DATA_CATEGORY: {
    filters: [
      field(getControlLabel, "lbl_category_code", "category_code"),
      field(getControlLabel, "lbl_category_name", "category_name"),
      field(getControlLabel, "lbl_code", "code", "code_no"),
      field(getControlLabel, "lbl_name", "name"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  BASIC_DATA: {
    filters: [],
    hideButtons: [
      getControlLabel("btn_search", "Search"),
      getControlLabel("btn_export", "Export"),
    ],
  },
  AC_IMP_MATERIAL_TRACKING: {
    filters: [
      field(getControlLabel, "lbl_invoice_no", "invoice_no"),
      field(
        getControlLabel,
        "lbl_declaration_category",
        "declaration_category",
        "declaration_category",
        {
          type: "dropdown",
          fetchKey: "declaration_category",
          tableName: "BASIC_DATA",
        },
      ),
      field(getControlLabel, "lbl_loading_way", "loading_way", "loading_way", {
        type: "dropdown",
        fetchKey: "loading_way",
        tableName: "BASIC_DATA",
      }),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
      field(getControlLabel, "lbl_record_date", "Record Date", "record_date", { type: "date" }),
      field(
        getControlLabel,
        "lbl_estimated_delivery_date",
        "Est. Delivery Date",
        "estimated_delivery_date",
        { type: "date" },
      ),
      field(
        getControlLabel,
        "lbl_actual_delivery_date",
        "Actual Delivery Date",
        "actual_delivery_date",
        { type: "date" },
      ),
      field(
        getControlLabel,
        "lbl_declaration_retrieve_date",
        "Declaration Retrieve Date",
        "declaration_retrieve_date",
        { type: "date" },
      ),
    ],
    hideButtons: defaultHide,
  },
  AC_ITEM_M: {
    filters: [
      field(getControlLabel, "lbl_item_acno", "item_acno"),
      field(getControlLabel, "lbl_item_no", "item_no", "item_no", { type: "dropdown" }),
      field(getControlLabel, "lbl_ac_item", "ac_item", "ac_item", { type: "dropdown" }),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  AC_BOM_M: {
    filters: [
      field(getControlLabel, "lbl_prod_acno", "prod_acno"),
      field(getControlLabel, "lbl_item_acno", "item_acno"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  AC_SHOE_M: {
    filters: [
      field(getControlLabel, "lbl_customs_shoe_id", "customs_shoe_id"),
      field(getControlLabel, "lbl_customs_tariff", "customs_tariff"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: defaultHide,
  },
  AC_PROD_M: {
    filters: [
      field(getControlLabel, "lbl_prod_acno", "prod_acno"),
      field(getControlLabel, "lbl_status", "status", "status", { type: "dropdown" }),
    ],
    hideButtons: [getControlLabel("btn_export", "Export")],
  },
});

export const isCoreToolbarTable = (table) => CORE_TOOLBAR_TABLES.has(table);
