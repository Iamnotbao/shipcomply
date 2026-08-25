const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const chgMRepository = require("./chg_m.repository");

async function getListOfChgM(factory_code, language, limit, offset) {
  return await chgMRepository.getListOfChgM(
    factory_code,
    language,
    limit,
    offset,
  );
}
async function checkBox(
  factory_code,
  ac_no,
  is_check,
  session_id,
  filters,
  isAll,
  language,
) {
  try {
    const checkFound = await chgMRepository.checkSeInvTemp(
      factory_code,
      ac_no,
      is_check,
      session_id,
      filters,
      isAll,
      language,
    );

    return checkFound;
  } catch (error) {
    console.log(error);
  }
}
async function autoAdd(factory_code, language, user_code, session_id) {
  try {
    const acImpFound = await chgMRepository.autoAddSeInvM(
      factory_code,
      language,
      user_code,
      session_id,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function getSeInvSelections(session_id) {
  try {
    const acImpFound = await chgMRepository.getSeInvSelections(session_id);
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function clearSeInvSession(session_id) {
  try {
    const acImpFound = await chgMRepository.clearSeInvSession(session_id);
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function searchChgM(factory_code, language, search, limit, offset) {
  try {
    const acCIFound = await chgMRepository.search(
      factory_code,
      language,
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
  filters = {},
) {
  const data = await chgMRepository.getContractDetails(
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
  getListOfChgM,
  exportExcelVwAcCI,
  checkBox,
  getSeInvSelections,
  clearSeInvSession,
  autoAdd,
  searchChgM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
};
