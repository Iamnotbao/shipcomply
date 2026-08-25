const { generateExcel } = require("../../utils/excel");
const { generatePDF } = require("../../utils/pdf");
const acSrcorderMRepository = require("./ac_srcorder_m.repository");
const acItemRefRepository = require("../ac_item_ref/ac_item_ref.service");
const pool = require("../../config/db");
const {
  generateCustomsDeclarationExcel,
} = require("../../utils/ExcelToAcReqOrder");
const { generateAcSrcorderMExcel } = require("../../utils/ExcelToAcSrcorderM");
async function getAllAcSrcOrderM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acSrcorderMRepository.listAllAcSOM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAcSrcOrderMByField(factory_code, field) {
  return await acSrcorderMRepository.getByField(factory_code, field);
}
async function getDropdownByField(
  factory_code,
  field,
  page,
  limit,
  search,
  isStatus,
) {
  return await acSrcorderMRepository.getDropdownByF(
    factory_code,
    field,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getAcIMByID(factory_code, item_acno) {
  return await acSrcorderMRepository.getByID(factory_code, item_acno);
}
async function getAllACIMByItemAcno(item_acno) {
  return await acSrcorderMRepository.getAllACIMByIA(item_acno);
}
async function addAcSrcorderM(acIM, t) {
  try {
    const existIM = await getAllAcSrcOrderM(acIM.factory_code, acIM.item_acno);
    if (existIM) {
      const message =
        "AC Item M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acSrcorderMRepository.add(acIM, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from ac item m service: ", error);
  }
}
async function editAcSrcorderM(factory_code, item_acno, acIM, t) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acSrcorderMRepository.edit(existIM, acIM, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcSrcorderM(factory_code, item_acno, t) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acSrcorderMRepository.deleteAcSrcorderM(existIM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcSrcorderM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acIMFound = await acSrcorderMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acIMFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const data = await acItemRefRepository.getAllWithItemAcno(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const plainData = data.map((item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const flattened = { ...plain };
      if (plain.ITEM_ACNO) {
        flattened.item_acname_t = plain.ITEM_ACNO.item_acname_t || "";
        flattened.item_acname_e = plain.ITEM_ACNO.item_acname_e || "";
        flattened.item_acname_l = plain.ITEM_ACNO.item_acname_l || "";
        flattened.category_status = plain.ITEM_ACNO.status || "";
        delete flattened.ITEM_ACNO;
      }
      return flattened;
    });
    await generatePDF(plainData, filename, "AC_ITEM_M");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportExcelAcReqOrder(data) {
  return await generateCustomsDeclarationExcel(data, pool);
}
async function exportExcelAcSrcorderM(data) {
  return await generateAcSrcorderMExcel(data, pool);
}
module.exports = {
  getAllAcSrcOrderM,
  exportExcelAcReqOrder,
  getAcIMByID,
  getAllACIMByItemAcno,
  getAcSrcOrderMByField,
  getDropdownByField,
  addAcSrcorderM,
  editAcSrcorderM,
  exportPDFAcIM,
  exportExcelAcSrcorderM,
  searchAcSrcorderM,
  deleteAcSrcorderM,
};
