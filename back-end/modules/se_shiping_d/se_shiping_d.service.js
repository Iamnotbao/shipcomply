const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const seShipingDRepository = require("./se_shiping_d.repository");

async function getAllSeShippingD(
  factory_code,
  cust_id,
  si_seq,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await seShipingDRepository.listAllSeShippingD(
    factory_code,
    cust_id,
    si_seq,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getSeShipingDByID(factory_code, cust_id, si_seq, si_type) {
  return await seShipingDRepository.getByID(
    factory_code,
    cust_id,
    si_seq,
    si_type,
  );
}
async function getAllWithKey(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await seShipingDRepository.listAllWithCust(
    query,
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
    const updateAID = await seShipingDRepository.updateStatus(
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
) {
  return await seShipingDRepository.fetchItemNoList(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    page,
    limit,
    search,
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
  return await seShipingDRepository.fetchUnitListByItemNo(
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
async function addSSD(
  factory_code,
  department_code,
  user_code,
  query_level,
  seShippingD,
  pageSize,
  t,
) {
  try {
    const existImp = await getSeShipingDByID(
      seShippingD.factory_code,
      seShippingD.cust_id,
      seShippingD.si_seq,
      seShippingD.si_type,
    );
    if (existImp) {
      const message =
        "Import material tracking is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await seShipingDRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      seShippingD,
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
async function editSSD(
  factory_code,
  department_code,
  user_code,
  query_level,
  cust_id,
  si_seq,
  si_type,
  acInmD,
  pageSize,
  t,
) {
  try {
    const existImnD = await getSeShipingDByID(
      factory_code,
      cust_id,
      si_seq,
      si_type,
    );
    if (!existImnD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await seShipingDRepository.edit(
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
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await seShipingDRepository.deleteImp(existImp, t);
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
    const acImpFound = await seShipingDRepository.search(
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
  getAllSeShippingD,
  getSeShipingDByID,
  getItemNoList,
  getUnitList,
  getAllWithKey,
  updateStatusAID,
  addSSD,
  editSSD,
  exportExcelAcImp,
  searchAcInmD,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
