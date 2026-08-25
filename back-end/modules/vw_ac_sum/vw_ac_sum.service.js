const { generateExcel } = require("../../utils/excel");
const vwAcSumRepository = require("./vw_ac_sum.repository");

async function getAllVwAcSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await vwAcSumRepository.fetchAllVwAcSum(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllVwAcSumDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  return await vwAcSumRepository.fetchAllVwAcSumDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
}
async function exportExcel(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  const data = await getAllVwAcSumDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
const defaultColumns = [
  { header: "AC_ITEMNO",   key: "ac_itemno",   width: 20 },
  { header: "AC_ITEMNAME", key: "ac_itemname", width: 40 },
  { header: "IN_QTY",      key: "in_qty",      width: 15 },
  { header: "OUT_QTY",     key: "out_qty",     width: 15 },
  { header: "LEFT_QTY",    key: "left_qty",    width: 15 },
  { header: "STOC_TYPE",   key: "stoc_type",   width: 15 },
];
  return await generateExcel(data, filename, defaultColumns);
}
async function searchVwAcSum(
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
    const acCIFound = await vwAcSumRepository.search(
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

module.exports = {
  getAllVwAcSum,
  exportExcel,
  searchVwAcSum,
};
