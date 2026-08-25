const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcChgExmpRepository = require("./vw_chg_exmp.repository");

async function getListOfVCE(factory_code, cont_no, language, limit, offset) {
  return await vwAcChgExmpRepository.getListOfVwChgExmp(
    factory_code,
    cont_no,
    language,
    limit,
    offset,
  );
}
async function searchVwAcContImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) {
  try {
    const acCIFound = await vwAcChgExmpRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
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
  filters = {},
) {
  const data = await vwAcChgExmpRepository.getContractDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
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
  getListOfVCE,
  exportExcelVwAcCI,
  searchVwAcContImp,
  exportExcelMaterialABM,
  exportExcelCustomABM,
};
