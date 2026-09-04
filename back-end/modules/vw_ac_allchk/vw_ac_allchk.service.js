const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generateVwAcAllChkExcel } = require("../../utils/ExcelToVwAcAllChk");
const { generatePDF } = require("../../utils/pdf");
const vwAcSrcOrderRepository = require("./vw_ac_allchk.repository");

async function getListOfAcAllChk(
  factory_code,
  vend_no,
  order_no,
  chk_no,
  rs_date,
  re_date,
  s_cfm,
  e_cfm,
  is_item,
  ac_type,
  limit,
  offset,
) {
  return await vwAcSrcOrderRepository.getListOfALLCHK(
    factory_code,
    vend_no,
    order_no,
    chk_no,
    rs_date,
    re_date,
    s_cfm,
    e_cfm,
    is_item,
    ac_type,
    limit,
    offset,
  );
}
async function checkB(factory_code, is_check, session_id, gridData, all_items) {
  return await vwAcSrcOrderRepository.checkBox(
    factory_code,
    is_check,
    session_id,
    gridData,
    all_items,
  );
}
async function confirmAll(
  factory_code,
  user_code,
  department_code,
  req_no,
  vend_no,
  session_id,
) {
  return await vwAcSrcOrderRepository.confirm(
    factory_code,
    user_code,
    department_code,
    req_no,
    vend_no,
    session_id,
  );
}
async function getDropdownByField(
  factory_code,
  field,
  page,
  limit,
  search,
) {
  return await vwAcSrcOrderRepository.getDropdownByF(
    factory_code,
    field,
    page,
    limit,
    search,
  );
}
async function approveCont(factory_code, req_no, invoice_no, user_code) {
  return await vwAcSrcOrderRepository.approveContract(
    factory_code,
    req_no,
    invoice_no,
    user_code,
  );
}
async function revertApprove(factory_code, user_code, req_no, invoice_no) {
  return await vwAcSrcOrderRepository.revertApproveContract(
    factory_code,
    user_code,
    req_no,
    invoice_no,
  );
}
async function addContractNumb(
  factory_code,
  req_no,
  vend_no,
  req_date,
  ac_type,
) {
  return await vwAcSrcOrderRepository.addContractNumber(
    factory_code,
    req_no,
    vend_no,
    req_date,
    ac_type,
  );
}
async function searchVwAcAllChk(keyword, factory_code, limit, offset) {
  try {
    const acASFound = await vwAcSrcOrderRepository.search(
      keyword,
      factory_code,
      limit,
      offset,
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
async function exportVwAcAllChkExcel(filters) {
  return await generateVwAcAllChkExcel(filters);
}

module.exports = {
  getListOfAcAllChk,
  approveCont,
  revertApprove,
  addContractNumb,
  checkB,
  confirmAll,
  exportPDFVwAcShoeBom,
  searchVwAcAllChk,
  exportVwAcAllChkExcel,
  getDropdownByField
};
