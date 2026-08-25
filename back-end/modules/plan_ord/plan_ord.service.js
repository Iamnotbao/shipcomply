const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const planOrdRepository = require("./plan_ord.repository");

async function getAllPlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await planOrdRepository.listAllPlanOrd(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}

async function searchPD(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const acImpFound = await planOrdRepository.searchPlanOrd(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function checkBox(
  ac_no,
  se_id,
  se_seq,
  ship_seq,
  se_ver,
  pack_gu,
  is_check,
  session_id,
  filters,
  factory_code,
  isAll
) {
  try {
    const acImpFound = await planOrdRepository.checkPlanItem(
      ac_no,
      se_id,
      se_seq,
      ship_seq,
      se_ver,
      pack_gu,
      is_check,
      session_id,
      filters,
      factory_code,
      isAll
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function confirmPD(
  factory_code,
  ac_no,
  language,
  cont_no,
  status1,
  session_id,
) {
  try {
    const acImpFound = await planOrdRepository.confirmPlanOrd(
      factory_code,
      ac_no,
      language,
      cont_no,
      status1,
      session_id,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function getPlanSelections(session_id) {
  try {
    const acImpFound = await planOrdRepository.getPlanSelections(session_id);
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function clearPlanSession(session_id) {
  try {
    const acImpFound = await planOrdRepository.clearPlanSession(session_id);
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  getAllPlanOrd,
  searchPD,
  checkBox,
  confirmPD,
  getPlanSelections,
  clearPlanSession,
};
