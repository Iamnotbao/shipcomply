const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acIssueMatdTRepository = require("./ac_issue_matd_t.repository");

async function getAllAIMT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_no,
  language,
  limit,
  offset,
) {
  return await acIssueMatdTRepository.listOfAcIssueMatdT(
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_no,
    language,
    limit,
    offset,
  );
}
async function getAllAPDWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  limit,
  offset,
) {
  return await acIssueMatdTRepository.listAllAcProcDWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  );
}
async function getAllAPDMarkBWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  limit,
  offset,
) {
  return await acIssueMatdTRepository.listAllAcProcDWithViewMarkB(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  );
}
async function getAcIssueMatdTByID(factory_code, conf_seq, matd_seq) {
  return await acIssueMatdTRepository.getByID(factory_code, conf_seq, matd_seq);
}
async function getSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) {
  return await acIssueMatdTRepository.fetchSumData(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    ac_no,
  );
}
async function getUnitByGoodsCode(
  factory_code,
  department_code,
  user_code,
  query_level,
  goods_code,
  page,
  limit,
  search,
) {
  return await acIssueMatdTRepository.fetchUnitByGoodsCode(
    factory_code,
    department_code,
    user_code,
    query_level,
    goods_code,
    page,
    limit,
    search,
  );
}

async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
) {
  return await acIssueMatdTRepository.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_seq,
  );
}

async function editAIMT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
  acProcD,
  pageSize,
  t,
) {
  try {
    const existAPD = await getAcIssueMatdTByID(
      factory_code,
      conf_seq,
      matd_seq,
    );
    if (!existAPD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acIssueMatdTRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existAPD,
      acProcD,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acIssueMatdTRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcImp(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const acImpFound = await acIssueMatdTRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelAcImp(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getAllAcImp(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const plainFactory = data.map((d) => d.get({ plain: true }));
  return await generateExcel(plainFactory, filename);
}

async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllAIMT,
  getAllAPDWithView,
  getAllAPDMarkBWithView,
  getAcIssueMatdTByID,
  getSum,
  getUnitByGoodsCode,
  editAIMT,
  exportExcelAcImp,
  searchAcImp,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  confirmAll
};
