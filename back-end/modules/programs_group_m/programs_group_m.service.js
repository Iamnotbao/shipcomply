const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const programsGroupMRepository = require("./programs_group_m.repository");
const acItemRefRepository = require("../ac_item_ref/ac_item_ref.service");

async function getAllPGM(
) {
  return await programsGroupMRepository.listAllPGM(
  );
}
async function getAcIMByID(factory_code, item_acno) {
  return await programsGroupMRepository.getByID(factory_code, item_acno);
}
async function getAllACIMByItemAcno(item_acno) {
  return await programsGroupMRepository.getAllACIMByIA(item_acno);
}
async function addAcIM(acIM, t) {
  try {
    const existIM = await getAcIMByID(acIM.factory_code, acIM.item_acno);
    if (existIM) {
      const message =
        "AC Item M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await programsGroupMRepository.add(acIM, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from ac item m service: ", error);
  }
}
async function editAcIM(factory_code, item_acno, acIM, t) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await programsGroupMRepository.edit(existIM, acIM, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcImp(factory_code, item_acno, t) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await programsGroupMRepository.deleteIM(existIM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcIM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level
) {
  try {
    const acIMFound = await programsGroupMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level
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
  query_level
) {
  try {
    const data = await acItemRefRepository.getAllWithItemAcno(
      factory_code,
      department_code,
      user_code,
      query_level
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
async function exportExcelAcIM(data, sheetName = "AC_ITEM_M") {
  return await generateExcel(data, sheetName);
}
// async function exportExcelMaterialAcImp(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomAcImp(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllPGM,
  getAcIMByID,
  getAllACIMByItemAcno,
  addAcIM,
  editAcIM,
  exportPDFAcIM,
  exportExcelAcIM,
  searchAcIM,
  deleteAcImp,
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
