const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcContImpRepository = require("./vw_cont_imp.repository");

async function getListOfCI(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await vwAcContImpRepository.getListOfContImp(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getCIContract(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await vwAcContImpRepository.getContractSetting(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getListOfCI(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await vwAcContImpRepository.getListOfContImp(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  page,
  search,
) {
  return await vwAcContImpRepository.getContno(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    page,
    search,
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
  return await vwAcContImpRepository.fetchFieldDataDropdown(
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
async function fetchGroupFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
) {
  return await vwAcContImpRepository.fetchGroupFieldDataDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
  );
}
async function fetchMinCont(
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
  return await vwAcContImpRepository.fetchMinContDataDropdown(
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
  return await vwAcContImpRepository.fetchInContDataDropdown(
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
  limit,
) {
  return await vwAcContImpRepository.copyContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
    limit,
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
  return await vwAcContImpRepository.extendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    filters,
    language,
  );
}
async function updateLastExpDate(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
  last_edate,
) {
  return await vwAcContImpRepository.updateLastExpireDate(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
    last_edate,
  );
}
async function confirmExtendCont(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) {
  return await vwAcContImpRepository.confirmExtendContract(
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
  search,
  limit,
  offset,
) {
  try {
    const acCIFound = await vwAcContImpRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
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
  const data = await vwAcContImpRepository.getContractDetails(
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
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getListOfCI,
  getCIContract,
  fetchFieldDropdown,
  fetchGroupFieldDataDropdown,
  fetchMinCont,
  fetchInCont,
  getCont,
  exportExcelVwAcCI,
  extendCont,
  confirmExtendCont,
  searchVwAcContImp,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  copyCont,
  updateLastExpDate,
};
