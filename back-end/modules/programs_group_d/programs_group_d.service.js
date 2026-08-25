const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const programsGroupDRepository = require("./programs_group_d.repository");

async function getAllPGD() {
  return await programsGroupDRepository.listAllPGD();
}
async function getAcIRByID(factory_code, item_acno, item_no) {
  return await programsGroupDRepository.getByID(
    factory_code,
    item_acno,
    item_no
  );
}
async function getByItemNo(item_no) {
  return await programsGroupDRepository.getByItemNo(item_no);
}
async function getAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level
) {
  return await programsGroupDRepository.listAllWithItemAcno(
    factory_code,
    department_code,
    user_code,
    query_level
  );
}
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level
) {
  try {
    const air = await programsGroupDRepository.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level
    );
    return air;
  } catch (error) {
    console.log(error);
  }
}
async function addAcIR(acIR, t) {
  try {
    const existIR = await getAcIRByID(
      acIR.factory_code,
      acIR.item_acno,
      acIR.item_no
    );
    if (existIR) {
      const message =
        "ac item ref is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await programsGroupDRepository.add(acIR, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from IRort material trackin service: ", error);
  }
}
async function editAcIR(factory_code, item_acno, item_no, acIR, t) {
  try {
    const existIR = await getAcIRByID(factory_code, item_acno, item_no, acIR);
    if (!existIR) {
      console.log("ac item ref is not exist !");
      return null;
    }
    const result = await programsGroupDRepository.edit(existIR, acIR, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ac item ref service", error);
  }
}
async function deleteAcIR(factory_code, item_acno, item_no, t) {
  try {
    const existIR = await getAcIRByID(factory_code, item_acno, item_no, acIR);
    if (!existIR) {
      console.log("ac item ref is not exist !");
      return null;
    }
    const result = await programsGroupDRepository.deleteIR(existIR, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcIR(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level
) {
  try {
    const acIRFound = await programsGroupDRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level
    );
    return acIRFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIR(filename) {
  const data = await getAllAcIR();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename);
  return filename;
}
// async function exportExcelMaterialAcIR(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomAcIR(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllPGD,
  getAllWithItemAcno,
  getAcIRByID,
  getByItemAcno,
  getByItemNo,
  addAcIR,
  editAcIR,
  exportPDFAcIR,
  searchAcIR,
  deleteAcIR,
  exportPDFAcIR,
  // exportExcelMaterialAcIR,
  // exportExcelCustomAcIR
};
