const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acSendBaseRepository = require("./ac_send_base.repository");

async function getAllAcSB(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acSendBaseRepository.listAllSB(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAcSBByID(factory_code, ac_send) {
  return await acSendBaseRepository.getByID(factory_code, ac_send);
}
async function getFieldDrop(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  d_type,
  page,
  limit,
  search,
  isStatus
) {
  return await acSendBaseRepository.getFieldDropDown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    d_type,
    page,
    limit,
    search,
    isStatus
  );
}
async function getByItemNo(item_no) {
  return await acSendBaseRepository.getByItemNo(item_no);
}
async function getAllAcSendByCategory(
  factory_code,
  category_code,
  user_code,
  department_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await acSendBaseRepository.getAllAcSendByCate(
    factory_code,
    category_code,
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
async function getAllTypeByCategory(
  factory_code,
  category_code,
  user_code,
  department_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await acSendBaseRepository.getAllTypeByCate(
    factory_code,
    category_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    isStatus
  );
}
1;
async function getAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acSendBaseRepository.listAllWithItemAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
) {
  try {
    const air = await acSendBaseRepository.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level,
    );
    return air;
  } catch (error) {
    console.log(error);
  }
}
async function addAcSB(
  factory_code,
  department_code,
  user_code,
  query_level,
  acSB,
  pageSize,
  t,
) {
  try {
    const existIR = await getAcSBByID(acSB.factory_code, acSB.ac_send);
    if (existIR) {
      const message =
        "ac send base is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acSendBaseRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acSB,
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
async function editAcSB(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_send,
  acSB,
  pageSize,
  t,
) {
  try {
    const existSB = await getAcSBByID(factory_code, ac_send);
    if (!existSB) {
      console.log("ac send base is not exist !");
      return null;
    }
    const result = await acSendBaseRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existSB,
      acSB,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ac send base service", error);
  }
}
async function deleteAcSB(factory_code, ac_send, t) {
  try {
    const existIR = await getAcSBByID(factory_code, ac_send);
    if (!existIR) {
      console.log("ac send base is not exist !");
      return null;
    }
    const result = await acSendBaseRepository.deleteSB(existIR, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcSB(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acSBFound = await acSendBaseRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acSBFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcSB(filename) {
  const data = await getAllAcSB();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename);
  return filename;
}
// async function exportExcelMaterialacSB(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomacSB(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllAcSB,
  getAllWithItemAcno,
  getAllAcSendByCategory,
  getAllTypeByCategory,
  getAcSBByID,
  getByItemAcno,
  getByItemNo,
  getFieldDrop,
  addAcSB,
  editAcSB,
  exportPDFAcSB,
  searchAcSB,
  deleteAcSB,
  // exportExcelMaterialacSB,
  // exportExcelCustomacSB
};
