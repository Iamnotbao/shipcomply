const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acChkTRepository = require("./ac_chk_t.repository");

async function getAllACT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
  language,
  limit,
  offset,
) {
  return await acChkTRepository.listOfAcChkT(
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_seq,
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
  return await acChkTRepository.listAllAcProcDWithView(
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
  return await acChkTRepository.listAllAcProcDWithViewMarkB(
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
async function getAcChkTByID(factory_code, conf_seq, matd_seq, issue_seq) {
  return await acChkTRepository.getByID(
    factory_code,
    conf_seq,
    matd_seq,
    issue_seq,
  );
}
async function getSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) {
  return await acChkTRepository.fetchSumData(
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
  return await acChkTRepository.fetchUnitByGoodsCode(
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
async function autoAddAcProcD(factory_code, department_code, user_code, ac_no) {
  const result = await acChkTRepository.autoAdd(
    factory_code,
    department_code,
    user_code,
    ac_no,
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
  const result = await acChkTRepository.autoAddMarkB(
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
  const result = await acChkTRepository.updateExchangeRateMarkB(
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
async function addAcChkT(
  factory_code,
  department_code,
  user_code,
  query_level,
  aPD,
  pageSize,
  t,
) {
  try {
    const existImp = await getAcChkTByID(
      aPD.factory_code,
      aPD.conf_seq,
      aPD.matd_seq,
      aPD.issue_seq,
    );
    if (existImp) {
      const message =
        "Import material tracking is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acChkTRepository.add(
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

async function editAcChkT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
  issue_seq,
  acProcD,
  pageSize,
  t,
) {
  try {
    const existAPD = await getAcChkTByID(
      factory_code,
      conf_seq,
      matd_seq,
      issue_seq,
    );
    if (!existAPD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acChkTRepository.edit(
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
async function deleteACT(factory_code, conf_seq,matd_seq,issue_seq, t) {
  try {
    const existImp = await getAcChkTByID(factory_code, conf_seq, matd_seq, issue_seq);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acChkTRepository.deleteACT(existImp, t);
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
    const acImpFound = await acChkTRepository.search(
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
  getAllACT,
  getAllAPDWithView,
  getAllAPDMarkBWithView,
  getAcChkTByID,
  getSum,
  getUnitByGoodsCode,
  autoAddAcProcD,
  updateExRateMarkB,
  autoAddAcProcDMarkB,
  addAcChkT,
  editAcChkT,
  exportExcelAcImp,
  searchAcImp,
  deleteACT,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
