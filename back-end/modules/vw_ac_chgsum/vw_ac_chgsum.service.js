const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcChgSumRepository = require("./vw_ac_chgsum.repository");

async function getAllVwAcChgsum(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await vwAcChgSumRepository.listAllVwAcChgsum(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
/*******  8750959f-e97c-4a6e-a33a-6326c6e26554  *******/
async function getOutVwAcChgsum(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  language,
) {
  return await vwAcChgSumRepository.listOutVwAcChgsum(
    factory_code,
    department_code,
    user_code,
    query_level,
    filters,
    language,
  );
}
async function getCont(factory_code, department_code, user_code, query_level) {
  return await vwAcChgSumRepository.getContno(
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
  return await vwAcChgSumRepository.fetchFieldDataDropdown(
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
  return await vwAcChgSumRepository.fetchInAcnoDataDropdown(
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
  return await vwAcChgSumRepository.fetchInContDataDropdown(
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
  return await vwAcChgSumRepository.copyContract(
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
  return await vwAcChgSumRepository.extendContract(
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
  return await vwAcChgSumRepository.confirmExtendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
  );
}
async function searchVwAcChgSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  language,
  limit,
  offset,
) {
  try {
    const acCIFound = await vwAcChgSumRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      filters,
      language,
      limit,
      offset,
    );
    return acCIFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelVwAcCI(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  lanaguage,
  filters = {},
) {
  const data = await vwAcChgSumRepository.getContractDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    lanaguage,
    filters,
  );
  console.log("check the excel of vw", data);

  return await generateExcel(data, filename);
}
async function exportExcelOutVwAcChgsum(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  lanaguage,
  filters = {},
) {
  const data = await getOutVwAcChgsum(
    factory_code,
    department_code,
    user_code,
    query_level,
    filters,
    lanaguage,
  );
  const defaultColumns = [
    { header: "AC_NO", key: "ac_no", width: 15 },
    { header: "AC_CHGNO", key: "ac_chgno", width: 20 },
    { header: "STOC_TYPE", key: "stoc_type", width: 15 },
    { header: "AC_ITEMNM", key: "ac_itemnm", width: 40 },
    { header: "AC_ITEMNO", key: "ac_itemno", width: 20 },
    { header: "MONEY", key: "money", width: 15 },
    { header: "CURR_RATE", key: "curr_rate", width: 15 },
    { header: "B_MONEY", key: "b_money", width: 15 },
    { header: "UNITNM", key: "unitnm", width: 15 },
    { header: "AC_DATE", key: "ac_date", width: 15 },
    { header: "QTY", key: "qty", width: 10 },
    { header: "SRC", key: "src", width: 10 },
    { header: "OVER_QTY", key: "over_qty", width: 12 },
    { header: "FACT_DATE", key: "fact_date", width: 15 },
    { header: "PRICE", key: "price", width: 15 },
  ];
  return await generateExcel(data, filename, defaultColumns);
}
async function verifyRemain(factory_code, ac_no, ac_itemno, language) {
  return await vwAcChgSumRepository.verifyRemainder(
    factory_code,
    ac_no,
    ac_itemno,
    language,
  );
}
async function updateQty(factory_code, ac_no, ac_itemno, n_mqty, n_src) {
  return await vwAcChgSumRepository.updateOverQty(
    factory_code,
    ac_no,
    ac_itemno,
    n_mqty,
    n_src,
  );
}
``;
async function restoreS(factory_code, ac_no, src) {
  return await vwAcChgSumRepository.restoreStatus(
   factory_code, ac_no, src
  );
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllVwAcChgsum,
  fetchFieldDropdown,
  fetchInAcno,
  fetchInCont,
  getCont,
  exportExcelVwAcCI,
  extendCont,
  confirmExtendCont,
  searchVwAcChgSum,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  copyCont,
  exportExcelOutVwAcChgsum,
  verifyRemain,
  updateQty,
  restoreS
};
