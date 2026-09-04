const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acChgDRepository = require("./ac_chg_d.repository");

async function getAllAcCD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acChgDRepository.listAllAcContD(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getAllAcCDWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  limit,
  offset,
) {
  return await acChgDRepository.listAllAcChgDWithView(
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
async function getAllAcCDExpWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  limit,
  offset,
) {
  return await acChgDRepository.listAllAcChgDExpWithView(
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
async function getAcChgDByID(factory_code, ac_no, seq) {
  return await acChgDRepository.getByID(factory_code, ac_no, seq);
}
async function refreshS(factory_code, ac_no) {
  return await acChgDRepository.refreshSeq(factory_code, ac_no);
}
async function copyItemsFromShoe(
  factory_code,
  ac_no,
  cont_no,
  shoe_id,
  language,
) {
  return await acChgDRepository.copyItemsFromShoeId(
    factory_code,
    ac_no,
    cont_no,
    shoe_id,
    language,
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
  return await acChgDRepository.fetchSumData(
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
  return await acChgDRepository.fetchUnitByGoodsCode(
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
async function autoAddAcChgD(factory_code, department_code, user_code, ac_no,language) {
  const result = await acChgDRepository.autoAdd(
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
async function calculateRefPrice(factory_code, com_invoice, item_acno, t) {
  const result = await acChgDRepository.calculateRPrice(
   factory_code, com_invoice, item_acno, t
  );
  if (!result) {
    console.log("data is null!");
    return null;
  }
  return result;
}
async function addAcChgD(
  factory_code,
  department_code,
  user_code,
  query_level,
  acCD,
  pageSize,
  t,
) {
  try {
    const result = await acChgDRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acCD,
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
async function editAcChgD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  seq,
  acChgD,
  pageSize,
  t,
) {
  try {
    const existAcCD = await getAcChgDByID(factory_code, ac_no, seq);
    if (!existAcCD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acChgDRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existAcCD,
      acChgD,
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
    const result = await acChgDRepository.deleteImp(existImp, t);
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
    const acImpFound = await acChgDRepository.search(
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
async function refreshP(factory_code, ac_no,language) {
  try {
    const acImpFound = await acChgDRepository.refreshPrice(factory_code, ac_no,language);
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  getAllAcCD,
  getAllAcCDWithView,
  getAllAcCDExpWithView,
  getAcChgDByID,
  getSum,
  getUnitByGoodsCode,
  autoAddAcChgD,
  addAcChgD,
  editAcChgD,
  exportExcelAcImp,
  searchAcImp,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  refreshS,
  copyItemsFromShoe,
  refreshP,
  calculateRefPrice
};
