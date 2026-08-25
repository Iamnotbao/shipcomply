const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acReqOrderRepository = require("./ac_req_order.repository");
const acItemRefRepository = require("../ac_item_ref/ac_item_ref.service");

async function getAllAcRO(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acReqOrderRepository.listAllARO(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getAcROByID(factory_code, req_no, req_seq) {
  return await acReqOrderRepository.getByID(factory_code, req_no, req_seq);
}
async function getAllAcSendByCategory(
  factory_code,
  category_code,
  vend_no,
  user_code,
  department_code,
  query_level,
) {
  return await acReqOrderRepository.getAllAcSendByCate(
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
  );
}
async function getAllVendNoByStatus(
  factory_code,
  user_code,
  department_code,
  query_level,
) {
  return await acReqOrderRepository.getAllVendNoByStatus(
    factory_code,
    user_code,
    department_code,
    query_level,
  );
}
async function getAcROByReqNo(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  limit,
  offset,
) {
  return await acReqOrderRepository.getByReqNo(
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    limit,
    offset,
  );
}
async function getAllAcROByID(
  factory_code,
  department_code,
  user_code,
  query_level,
  id,
  limit,
  offset,
) {
  return await acReqOrderRepository.getAllById(
    factory_code,
    department_code,
    user_code,
    query_level,
    id,
    limit,
    offset,
  );
}
async function addAcRO(acRO, pageSize, t) {
  try {
    const existRO = await getAcROByID(
      acRO.factory_code,
      acRO.req_no,
      acRO.req_seq,
    );
    if (existRO) {
      const message =
        "AC Req Order is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acReqOrderRepository.add(acRO, pageSize, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from AC Req Order service: ", error);
  }
}
async function editAcRO(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  req_seq,
  acRO,
  pageSize,
  t,
) {
  try {
    const existRO = await getAcROByID(factory_code, req_no, req_seq);
    if (!existRO) {
      console.log("Ac Req Order is not exist !");
      return null;
    }
    const result = await acReqOrderRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existRO,
      acRO,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from Ac Req Order service", error);
  }
}
async function deleteacRO(factory_code, req_no, req_seq, t) {
  try {
    const existVB = await getAcROByID(factory_code, req_no, req_seq);
    if (!existVB) {
      console.log("Ac Vend Base is not exist !");
      return null;
    }
    const result = await acReqOrderRepository.deleteRO(existVB, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcRO(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const acROFound = await acReqOrderRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return acROFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFacRO(
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
    await generatePDF(plainData, filename, "AC_REQ_ORDER");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportExcelacRO(data, sheetName = "AC_REQ_ORDER") {
  return await generateExcel(data, sheetName);
}

module.exports = {
  getAllAcRO,
  getAcROByID,
  getAllAcSendByCategory,
  getAllVendNoByStatus,
  getAcROByReqNo,
  getAllAcROByID,
  getAcROByID,
  addAcRO,
  editAcRO,
  exportPDFacRO,
  exportExcelacRO,
  searchAcRO,
  deleteacRO,
};
