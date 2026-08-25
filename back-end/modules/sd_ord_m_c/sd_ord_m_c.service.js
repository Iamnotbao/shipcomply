const sdOrdMCRepository = require("./sd_ord_m_c.repository");

async function getAllFieldDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  extraField,
) {
  return await sdOrdMCRepository.fetchFieldDropdown(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    extraField,
  );
}
async function getAllPackingSeidDropdown(factory_code, page, limit, search) {
  return await sdOrdMCRepository.fetchPackingSeidDropdown(
    factory_code,
    page,
    limit,
    search,
  );
}
async function checkBox(
  se_id,
  se_seq,
  pack_gu,
  pack_status,
  is_check,
  session_id,
  filters,
  isAll,
  factory_code,
) {
  return await sdOrdMCRepository.checkPlanItem(
    se_id,
    se_seq,
    pack_gu,
    pack_status,
    is_check,
    session_id,
    filters,
    isAll,
    factory_code,
  );
}
async function getSysTree(session_id) {
  return await sdOrdMCRepository.getPlanSelections(session_id);
}
async function clearSysTree(session_id) {
  return await sdOrdMCRepository.clearPlanSession(session_id);
}
async function getAllSeOrdItem(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await sdOrdMCRepository.listAllSeOrdItem(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function searchSeOrdItem(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await sdOrdMCRepository.search(
    query,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function createPlan(
  factory_code,
  plan_date,
  session_id,
  user_code,
  department_code,
  last_user,
) {
  return await sdOrdMCRepository.generatePlan(
    factory_code,
    plan_date,
    session_id,
    user_code,
    department_code,
    last_user,
  );
}
async function updatePDD(factory_code, user_code, filters) {
  return await sdOrdMCRepository.updatePlanShipDate(
    factory_code,
    user_code,
    filters,
  );
}
module.exports = {
  getAllFieldDropdown,
  getAllPackingSeidDropdown,
  getAllSeOrdItem,
  searchSeOrdItem,
  checkBox,
  getSysTree,
  createPlan,
  updatePDD,
  clearSysTree
};
