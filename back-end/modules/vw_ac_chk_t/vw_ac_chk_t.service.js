const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcChkTRepository = require("./vw_ac_chk_t.repository");

async function getAllVwAcChkT(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  ac_itemno,
  language,
  limit,
  offset,
) {
  return await vwAcChkTRepository.listAllVwAcChkT(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    ac_itemno,
    language,
    limit,
    offset,
  );
}
async function getAllVwAcChkTWithDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  ac_itemno,
  language,
) {
  return await vwAcChkTRepository.listAllVwAcChkTWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    ac_itemno,
    language,
  );
}
async function getCont(factory_code, department_code, user_code, query_level) {
  return await vwAcChkTRepository.getContno(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function fetchFieldDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
  page,
  limit,
  search,
) {
  return await vwAcChkTRepository.fetchFieldDataDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    cont_no,
    page,
    limit,
    search,
  );
}
async function fetchInAcno(
  factory_code,
  src,
  out_dtype,
  matd_no,
  page,
  limit,
  search,
) {
  return await vwAcChkTRepository.fetchInAcnoDataDropdown(
    factory_code,
    src,
    out_dtype,
    matd_no,
    page,
    limit,
    search,
  );
}
async function fetchInCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  page,
  limit,
  search,
  mark,
  vend_no,
  d_type,
) {
  return await vwAcChkTRepository.fetchInContDataDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    page,
    limit,
    search,
    mark,
    vend_no,
    d_type,
  );
}
async function copyCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  old_cont_no,
  new_cont_no,
) {
  return await vwAcChkTRepository.copyContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
  );
}
async function extendCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  language,
) {
  return await vwAcChkTRepository.extendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    filters,
    language,
  );
}
async function confirmExtendCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) {
  return await vwAcChkTRepository.confirmExtendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
  );
}
async function searchVwAcContImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  limit,
  offset,
) {
  try {
    const acCIFound = await vwAcChkTRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      filters,
      limit,
      offset,
    );
    return acCIFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcel(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  ac_itemno,
) {
  const data = await getAllVwAcChkTWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    ac_itemno,
    language,
  );
const defaultColumns = [
  { header: "AC_NO",      key: "ac_no",      width: 15 },
  { header: "AC_ITEMNO",  key: "ac_itemno",  width: 20 },
  { header: "LOCK_SEQ",   key: "lock_seq",   width: 15 },
  { header: "LOCK_DATE",  key: "lock_date",  width: 15 },
  { header: "CONF_SEQ",   key: "conf_seq",   width: 15 },
  { header: "MATD_SEQ",   key: "matd_seq",   width: 15 },
  { header: "ISSUE_SEQ",  key: "issue_seq",  width: 15 },
  { header: "OUT_ACNO",   key: "out_acno",   width: 15 },
  { header: "PROD_NO",    key: "prod_no",    width: 15 },
  { header: "MATD_NO",    key: "matd_no",    width: 15 },
  { header: "IN_ACNO",    key: "in_acno",    width: 15 },
  { header: "AC_DATE",    key: "ac_date",    width: 15 },
  { header: "UNIT",       key: "unit",       width: 10 },
  { header: "PRICE",      key: "price",      width: 15 },
  { header: "PAIRS",      key: "pairs",      width: 10 },
  { header: "UNIT_QTY",   key: "unit_qty",   width: 12 },
  { header: "LOSS_PER",   key: "loss_per",   width: 12 },
  { header: "QTY",        key: "qty",        width: 10 },
  { header: "OVER_QTY",   key: "over_qty",   width: 12 },
  { header: "SRC",        key: "src",        width: 10 },
  { header: "REMARK",     key: "remark",     width: 30 },
  { header: "STATUS",     key: "status",     width: 10 },
];
  return await generateExcel(data, filename, defaultColumns);
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllVwAcChkT,
  fetchFieldDropdown,
  fetchInAcno,
  fetchInCont,
  getCont,
  exportExcel,
  extendCont,
  confirmExtendCont,
  searchVwAcContImp,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  copyCont,
};
