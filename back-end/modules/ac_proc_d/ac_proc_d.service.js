const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acProcDRepository = require("./ac_proc_d.repository");

async function getAllAPD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acProcDRepository.listAllAcContD(
    factory_code,
    department_code,
    user_code,
    query_level,
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
  return await acProcDRepository.listAllAcProcDWithView(
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
  return await acProcDRepository.listAllAcProcDWithViewMarkB(
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
async function getAcProcDByID(factory_code, ac_no, seq) {
  return await acProcDRepository.getByID(factory_code, ac_no, seq);
}
async function getSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) {
  return await acProcDRepository.fetchSumData(
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
  return await acProcDRepository.fetchUnitByGoodsCode(
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
async function autoAddAcProcD(factory_code, department_code, user_code, ac_no,language,) {
  const result = await acProcDRepository.autoAdd(
    factory_code,
    department_code,
    user_code,
    ac_no,
    language
  );
  if (!result) {
    console.log("Cannot add because data from db is null");
    return null;
  }
  return result;
}
async function autoAddAcProcDMarkB(
  factory_code,
  department_code,
  user_code,
  ac_no,
  language,
) {
  const result = await acProcDRepository.autoAddMarkB(
    factory_code,
    department_code,
    user_code,
    ac_no,
    language,
  );
  if (!result) {
    console.log("Cannot add because data from db is null");
    return null;
  }
  return result;
}
async function updateExRateMarkB(factory_code, ac_no, in_crate, language) {
  const result = await acProcDRepository.updateExchangeRateMarkB(
    factory_code,
    ac_no,
    in_crate,
    language,
  );
  if (!result) {
    console.log("Cannot add because data from db is null");
    return null;
  }
  return result;
}
async function addAcProcD(
  factory_code,
  department_code,
  user_code,
  query_level,
  aPD,
  pageSize,
  t,
) {
  try {
    const result = await acProcDRepository.add(
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

async function editAcProcD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  seq,
  acProcD,
  pageSize,
  t,
) {
  try {
    const existAPD = await getAcProcDByID(factory_code, ac_no, seq);
    if (!existAPD) {
      console.log("Import material tracking is not exist!");
      return null;
    }
    const result = await acProcDRepository.edit(
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
    throw error; // ✅ throw lên để controller nhận được message thật
  }
}
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acProcDRepository.deleteImp(existImp, t);
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
    const acImpFound = await acProcDRepository.search(
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
  getAllAPD,
  getAllAPDWithView,
  getAllAPDMarkBWithView,
  getAcProcDByID,
  getSum,
  getUnitByGoodsCode,
  autoAddAcProcD,
  updateExRateMarkB,
  autoAddAcProcDMarkB,
  addAcProcD,
  editAcProcD,
  exportExcelAcImp,
  searchAcImp,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
