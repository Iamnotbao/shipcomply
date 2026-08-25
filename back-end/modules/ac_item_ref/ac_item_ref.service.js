const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acItemRefRepository = require("./ac_item_ref.repository");

async function getAllAcIR(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acItemRefRepository.listAllIR(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAcIRByID(factory_code, item_acno, item_no) {
  return await acItemRefRepository.getByID(factory_code, item_acno, item_no);
}
async function getByItemNo(item_no) {
  return await acItemRefRepository.getByItemNo(item_no);
}
async function getAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acItemRefRepository.listAllWithItemAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getAllWithItemNo(item_no) {
  return await acItemRefRepository.listAllWithItemNo(item_no);
}
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const air = await acItemRefRepository.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return air;
  } catch (error) {
    console.log(error);
  }
}
async function updateStatusAcIR(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  data,
) {
  try {
    const updateSAIR = await acItemRefRepository.updateStatus(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level,
      data,
    );
    return updateSAIR;
  } catch (error) {
    console.log(error);
  }
}
async function addAcIR(
  factory_code,
  department_code,
  user_code,
  query_level,
  acIR,
  pageSize,
  t,
) {
  try {
    const existIR = await getAcIRByID(
      acIR.factory_code,
      acIR.item_acno,
      acIR.item_no,
    );
    if (existIR) {
      const message =
        "ac item ref is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acItemRefRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acIR,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from IRort material trackin service: ", error);
  }
}
async function editAcIR(
  factory_code,
  department_code,
  user_code,
  query_level,
  item_acno,
  item_no,
  acIR,
  pageSize,
  t,
) {
  try {
    const existIR = await getAcIRByID(factory_code, item_acno, item_no, acIR);
    if (!existIR) {
      console.log("ac item ref is not exist !");
      return null;
    }
    const result = await acItemRefRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existIR,
      acIR,
      pageSize,
      t,
    );
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
    const result = await acItemRefRepository.deleteIR(existIR, t);
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
  query_level,
  limit,
  offset,
) {
  try {
    const acIRFound = await acItemRefRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
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
  getAllAcIR,
  getAllWithItemAcno,
  getAllWithItemNo,
  getAcIRByID,
  getByItemAcno,
  getByItemNo,
  updateStatusAcIR,
  addAcIR,
  editAcIR,
  exportPDFAcIR,
  searchAcIR,
  deleteAcIR,
  exportPDFAcIR,
};
