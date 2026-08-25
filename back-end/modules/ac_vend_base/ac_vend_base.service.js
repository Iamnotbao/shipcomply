const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acVendBaseRepository = require("./ac_vend_base.repository");
const acItemRefRepository = require("../ac_item_ref/ac_item_ref.service");

async function getAllAcVB(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acVendBaseRepository.listAllVB(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAcVBByID(factory_code, vend_no, ac_send) {
  return await acVendBaseRepository.getByID(factory_code, vend_no, ac_send);
}
async function getAllAcSendByCategory(
  factory_code,
  category_code,
  vend_no,
  user_code,
  department_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await acVendBaseRepository.getAllAcSendByCate(
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getAllVendNoByStatus(
  factory_code,
  user_code,
  department_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await acVendBaseRepository.getAllVendNoByStatus(
    factory_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}
async function addAcVB(
  factory_code,
  department_code,
  user_code,
  query_level,
  acVB,
  pageSize,
  t,
) {
  try {
    const existVB = await getAcVBByID(
      acVB.factory_code,
      acVB.vend_no,
      acVB.ac_send,
    );
    if (existVB) {
      const message =
        "AC Vend Base is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acVendBaseRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acVB,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from AC Vend Base service: ", error);
  }
}
async function editAcVB(
  factory_code,
  department_code,
  user_code,
  query_level,
  vend_no,
  ac_send,
  acVB,
  pageSize,
  t,
) {
  try {
    const existVB = await getAcVBByID(factory_code, vend_no, ac_send);
    if (!existVB) {
      console.log("Ac Vend Base is not exist !");
      return null;
    }
    const result = await acVendBaseRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existVB,
      acVB,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from Ac Vend Base service", error);
  }
}
async function deleteAcVB(factory_code, vend_no, ac_send, t) {
  try {
    const existVB = await getAcVBByID(factory_code, vend_no, ac_send);
    if (!existVB) {
      console.log("Ac Vend Base is not exist !");
      return null;
    }
    const result = await acVendBaseRepository.deleteVB(existVB, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcVB(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acVBFound = await acVendBaseRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acVBFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcVB(
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
    await generatePDF(plainData, filename, "AC_VEND_BASE");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportExcelAcVB(data, sheetName = "AC_VEND_BASE") {
  return await generateExcel(data, sheetName);
}
// async function exportExcelMaterialacVBp(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomacVBp(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllAcVB,
  getAcVBByID,
  getAllAcSendByCategory,
  getAllVendNoByStatus,
  addAcVB,
  editAcVB,
  exportPDFAcVB,
  exportExcelAcVB,
  searchAcVB,
  deleteAcVB,
  // exportExcelMaterialacVBp,
  // exportExcelCustomacVBp
};
