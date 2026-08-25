const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcChgExpRepository = require("./vw_chg_exp.repository");

async function getListOfAcCE(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await vwAcChgExpRepository.getListOfAcChgExp(
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
  return await vwAcChgExpRepository.getContractSetting(
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
  return await vwAcChgExpRepository.getListOfContImp(
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
  return await vwAcChgExpRepository.copyContract(
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
  return await vwAcChgExpRepository.extendContract(
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
  return await vwAcChgExpRepository.confirmExtendContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
  );
}
async function searchVwChgExp(
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
    const acCIFound = await vwAcChgExpRepository.search(
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
  const data = await vwAcChgExpRepository.getContractDetails(
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
  getListOfAcCE,
  getCIContract,
  exportExcelVwAcCI,
  extendCont,
  confirmExtendCont,
  searchVwChgExp,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  copyCont,
};
