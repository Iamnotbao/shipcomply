const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acDescProcRepository = require("./ac_desc_proc.repository");

async function getAllADP(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  limit,
  offset,
) {
  return await acDescProcRepository.listAllAcDescProc(
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
async function getAcDescProcByID(factory_code, ac_no, seq) {
  return await acDescProcRepository.getByID(factory_code, ac_no, seq);
}
async function getSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) {
  return await acDescProcRepository.fetchSumData(
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
  return await acDescProcRepository.fetchUnitByGoodsCode(
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
async function addAcDescProc(
  factory_code,
  department_code,
  user_code,
  query_level,
  aPD,
  pageSize,
  t,
) {
  try {
    const result = await acDescProcRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      aPD,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from import material trackin service: ", error);
  }
}
async function editAcDescProc(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  seq,
  acDescProc,
  pageSize,
  t,
) {
  try {
    const existAPD = await getAcDescProcByID(factory_code, ac_no, seq);
    if (!existAPD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acDescProcRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existAPD,
      acDescProc,
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
    const result = await acDescProcRepository.deleteImp(existImp, t);
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
    const acImpFound = await acDescProcRepository.search(
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
  getAllADP,
  getAcDescProcByID,
  getSum,
  getUnitByGoodsCode,
  addAcDescProc,
  editAcDescProc,
  exportExcelAcImp,
  searchAcImp,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
