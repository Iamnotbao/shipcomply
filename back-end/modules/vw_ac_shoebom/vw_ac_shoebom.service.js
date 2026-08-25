const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acShoeBomRepository = require("./vw_ac_shoebom.repository");

async function getListOfAcShoeBom(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  isAll = false,
) {
  return await acShoeBomRepository.getListOfASB(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
    isAll
  );
}
async function searchVwAcShoeBom(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acABMFound = await acShoeBomRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acABMFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFVwAcShoeBom(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const { rows } = await getListOfAcShoeBom(
    factory_code,
    department_code,
    user_code,
    query_level,
    "",
    "",
    true
  );
  return await generateExcel(rows, "VW_AC_SHOEBOM");
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getListOfAcShoeBom,
  exportPDFVwAcShoeBom,
  searchVwAcShoeBom,
  exportExcelMaterialABM,
  exportExcelCustomABM,
};
