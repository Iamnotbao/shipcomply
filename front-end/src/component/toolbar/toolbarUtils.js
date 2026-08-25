export const TOOLBAR_STATUS_MAP = {
  Cancel: 0,
  New: 1,
  Confirm: 7,
  Close: 9,
};

export const TOOLBAR_DATE_FIELDS = new Set([
  "actual_delivery_date",
  "estimated_delivery_date",
  "declaration_retrieve_date",
  "record_date",
  "req_date",
  "order_date",
  "s_date",
  "e_date",
]);

export const TOOLBAR_DROPDOWN_VALUE_FIELDS = {
  invoice_no: ["invoice_no"],
  packing_seid: ["se_id"],
  ac_chgno: ["ac_chgno"],
  cont_no: ["cont_no"],
  ac_no: ["ac_no"],
  chg_type: ["code_no"],
  ac_itemno: ["ac_itemno"],
  stoc_type: ["code_no"],
  send_corp: ["code_no"],
  sales_no: ["col2"],
  send_type: ["code_no"],
  type: ["code_no"],
  expect_id: ["expect_id"],
  print_id: ["print_id"],
  se_id: ["se_id"],
  se_custid: ["cust_id"],
  agent: ["code_no"],
  item_no: ["item_no"],
  declaration_category: ["code_no"],
  loading_way: ["code_no"],
  vend_no: ["vend_no"],
  ac_send: ["code_no"],
  ac_type: ["code_no"],
};

export const sanitizeToolbarSearch = (searchValue = {}) => {
  const next = { ...searchValue };

  if (next.status !== undefined && next.status !== "") {
    next.status = Object.prototype.hasOwnProperty.call(TOOLBAR_STATUS_MAP, next.status)
      ? TOOLBAR_STATUS_MAP[next.status]
      : -1;
  }

  if (next.formula !== undefined && next.formula !== "") {
    const numericValue = Number(next.formula);
    next.formula = Number.isNaN(numericValue) ? next.formula : numericValue;
  }

  Object.keys(next).forEach((key) => {
    if (next[key] === "" || next[key] === null || next[key] === undefined) {
      delete next[key];
    }
  });

  return next;
};

export const getToolbarDropdownValue = (fieldName, selectedItem) => {
  const fields = TOOLBAR_DROPDOWN_VALUE_FIELDS[fieldName] || [];
  return fields
    .filter((field) => selectedItem?.[field] !== undefined)
    .map((field) => selectedItem[field])
    .join("-");
};

export const splitToolbarFilters = (filters = []) => ({
  primary: filters.filter(
    (field) =>
      field.type !== "date" &&
      field.type !== "checkbox" &&
      field.type !== "dateRangeGroup",
  ),
  secondary: filters.filter(
    (field) =>
      field.type === "date" ||
      field.type === "checkbox" ||
      field.type === "dateRangeGroup",
  ),
});
