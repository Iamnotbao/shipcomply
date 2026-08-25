const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const vwAcSrcOrderRepository = require("./vw_ac_srcorder.repository");

async function getListOfAcSrcorder(
  factory_code,
  department_code,
  user_code,
  query_level,
  vend_no,
  invoice_no,
  limit,
  offset,
  language,
  is_max,
) {
  return await vwAcSrcOrderRepository.getListOfAAS(
    factory_code,
    department_code,
    user_code,
    query_level,
    vend_no,
    invoice_no,
    limit,
    offset,
    language,
    is_max,
  );
}
async function checkBoxL(
  factory_code,
  order_no,
  order_seq,
  is_check,
  is_max,
  plan_iqty,
  session_id,
  all_items,
) {
  return await vwAcSrcOrderRepository.checkBoxLeft(
    factory_code,
    order_no,
    order_seq,
    is_check,
    is_max,
    plan_iqty,
    session_id,
    all_items,
  );
}
async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  vend_no,
  session_id,
) {
  return await vwAcSrcOrderRepository.confirmSelection(
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    vend_no,
    session_id,
  );
}
async function updateBlQty(
  factory_code,
  is_max,
  is_check,
  gridData,
  new_bl_qty,
  plan_iqty,
  session_id,
  force
) {
  return await vwAcSrcOrderRepository.updateBlQtyManual(
    factory_code,
    is_max,
    is_check,
    gridData,
    new_bl_qty,
    plan_iqty,
    session_id,
    force
  );
}
async function getRD(session_id) {
  return await vwAcSrcOrderRepository.getRDTemp(session_id);
}
async function clearRD(session_id) {
  return await vwAcSrcOrderRepository.clearRDTemp(session_id);
}
async function getPlanMax(factory_code, order_no, order_seq, is_max) {
  return await vwAcSrcOrderRepository.getPlanIQty(
    factory_code,
    order_no,
    order_seq,
    is_max,
  );
}
async function updateCus(
  session_id,
  factory_code,
  order_no,
  order_seq,
  item_id,
  item_type,
  new_bl_qty,
  is_check = "Y",
  is_max = false,
  plan_iqty,
  order_qty,
  chge_ordqty,
  order_acqty,
  req_acqty,
  force
) {
  return await vwAcSrcOrderRepository.updateCustom(
    session_id,
    factory_code,
    order_no,
    order_seq,
    item_id,
    item_type,
    new_bl_qty,
    is_check ,
    is_max ,
    plan_iqty,
    order_qty,
    chge_ordqty,
    order_acqty,
    req_acqty,
    force
  );
}
async function searchVwAcSrcorder(
  keyword,
  factory_code,
  language,
  limit,
  offset,
  is_max,
) {
  try {
    const acASFound = await vwAcSrcOrderRepository.search(
      keyword,
      factory_code,
      language,
      limit,
      offset,
      is_max,
    );
    return acASFound;
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
  );
  await generatePDF(rows, filename, "VW_AC_SHOEBOM");
  return filename;
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getListOfAcSrcorder,
  getRD,
  clearRD,
  checkBoxL,
  exportPDFVwAcShoeBom,
  updateBlQty,
  searchVwAcSrcorder,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  getPlanMax,
  confirmAll,
  updateCus,
};
