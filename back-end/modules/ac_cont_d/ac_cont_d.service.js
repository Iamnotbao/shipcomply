const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acContDRepository = require("./ac_cont_d.repository");

async function getAllAcCD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acContDRepository.listAllAcContD(
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
  cont_no,
  limit,
  offset,
) {
  return await acContDRepository.listAllAcContDWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    cont_no,
    limit,
    offset,
  );
}
async function getFieldWithFunction(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_itemno,
  type,
) {
  return await acContDRepository.fetchFieldWithFunction(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    ac_itemno,
    type,
  );
}
async function getAcContDByID(factory_code, cont_no, seq) {
  return await acContDRepository.getByID(factory_code, cont_no, seq);
}
async function getDropdownGoods(
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus,
  isExport,
) {
  return await acContDRepository.fetchDropdownGoodsCode(
    factory_code,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    isStatus,
    isExport,
  );
}
async function getDropdownGoodsWithFunc(
  factory_code,
  cont_no,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  mark,
) {
  return await acContDRepository.fetchDropdownGoodsCodeWithFunction(
    factory_code,
    cont_no,
    department_code,
    user_code,
    query_level,
    language,
    page,
    limit,
    search,
    mark,
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
  isStatus,
  isExport,
) {
  return await acContDRepository.fetchUnitByGoodsCode(
    factory_code,
    department_code,
    user_code,
    query_level,
    goods_code,
    page,
    limit,
    search,
    isStatus,
    isExport,
  );
}
async function getContPriceDrop(
  factory_code,
  department_code,
  user_code,
  query_level,
  item_acno,
  min_cont,
  page,
  limit,
  search,
) {
  return await acContDRepository.fetchContPriceDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    item_acno,
    min_cont,
    page,
    limit,
    search,
  );
}
async function getSumData(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
) {
  return await acContDRepository.fetchSumData(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    cont_no,
  );
}
async function addAcContD(
  factory_code,
  department_code,
  user_code,
  query_level,
  acCD,
  pageSize,
  t,
) {
  try {
    const result = await acContDRepository.add(
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
async function editAcContD(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
  seq,
  acContD,
  pageSize,
  t,
) {
  try {
    const existACD = await getAcContDByID(factory_code, cont_no, seq);
    if (!existACD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acContDRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existACD,
      acContD,
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
async function deleteAcContD(factory_code, cont_no, seq, t) {
  try {
    const existImp = await getAcContDByID(factory_code, cont_no, seq);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acContDRepository.deleteItem(existImp, t);
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
    const acImpFound = await acContDRepository.search(
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
  getAllAcCD,
  getAllAcCDWithView,
  getAcContDByID,
  getDropdownGoods,
  getUnitByGoodsCode,
  getDropdownGoodsWithFunc,
  getFieldWithFunction,
  getContPriceDrop,
  addAcContD,
  editAcContD,
  exportExcelAcImp,
  searchAcImp,
  deleteAcContD,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  getSumData,
};
