const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcChgMRepository = require("./vw_chg_m.repository");

async function getListOfAcCM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await vwAcChgMRepository.getListOfAcChgM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
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
  return await vwAcChgMRepository.getContractSetting(
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
  return await vwAcChgMRepository.getListOfContImp(
    factory_code,
    department_code,
    user_code,
    query_level,
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
  return await vwAcChgMRepository.copyContract(
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
  return await vwAcChgMRepository.extendContract(
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
  return await vwAcChgMRepository.confirmExtendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
  );
}
async function searchVwChgM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
  limit,
  offset,
) {
  try {
    const acCIFound = await vwAcChgMRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
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
  const data = await vwAcChgMRepository.getContractDetails(
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
  getListOfAcCM,
  getCIContract,
  exportExcelVwAcCI,
  extendCont,
  confirmExtendCont,
  searchVwChgM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  copyCont,
};
