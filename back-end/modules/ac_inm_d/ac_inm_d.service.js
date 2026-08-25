const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acInmDRepository = require("./ac_imm_d.repository");

async function getAllAcInmD(
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acInmDRepository.listAllAcInmD(
    factory_code,
    inm_no,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAcInmDByID(factory_code, inm_no, seq) {
  return await acInmDRepository.getByID(factory_code, inm_no, seq);
}
async function getAllWithKey(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acInmDRepository.listAllWithInmNo(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function updateStatusAID(
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  data,
) {
  try {
    const updateAID = await acInmDRepository.updateStatus(
      factory_code,
      inm_no,
      department_code,
      user_code,
      query_level,
      data,
    );
    return updateAID;
  } catch (error) {
    console.log(error);
  }
}
async function getItemNoList(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus
) {
  return await acInmDRepository.fetchItemNoList(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    page,
    limit,
    search,
    isStatus
  );
}
async function getUnitList(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  item_no,
  page,
  limit,
  search,
) {
  return await acInmDRepository.fetchUnitListByItemNo(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    item_no,
    page,
    limit,
    search,
  );
}
async function addAID(
  factory_code,
  department_code,
  user_code,
  query_level,
  acInmD,
  pageSize,
  t,
) {
  try {
    const result = await acInmDRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acInmD,
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
async function editAID(
  factory_code,
  department_code,
  user_code,
  query_level,
  inm_no,
  seq,
  acInmD,
  pageSize,
  t,
) {
  try {
    const existImnD = await getAcInmDByID(factory_code, inm_no, seq);
    if (!existImnD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acInmDRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existImnD,
      acInmD,
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
async function deleteAcInmD(factory_code, inm_no, seq, t) {
  try {
    const existImp = await getAcInmDByID(factory_code, inm_no, seq);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acInmDRepository.deleteItem(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcInmD(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acImpFound = await acInmDRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
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
  getAllAcInmD,
  getAcInmDByID,
  getItemNoList,
  getUnitList,
  getAllWithKey,
  updateStatusAID,
  addAID,
  editAID,
  exportExcelAcImp,
  searchAcInmD,
  deleteAcInmD,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
