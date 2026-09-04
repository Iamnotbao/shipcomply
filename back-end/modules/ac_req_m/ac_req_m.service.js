const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acReqMRepository = require("./ac_req_m.repository");
const userService = require("../users/user.service");
const { generateExcelWithSub } = require("../../utils/excel");

async function getAllARM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  const existUser = await userService.getUniqueUser(user_code);
  if (!existUser) {
    const message = "User is not exist or null from service!";
    return { message };
  }
  return await acReqMRepository.listAllARM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAllSubByARM(
  factory_code,
  req_no,
  department_code,
  user_code,
  query_level,
  search,
) {
  const existUser = await userService.getUniqueUser(user_code);
  if (!existUser) {
    const message = "User is not exist or null from service!";
    return { message };
  }
  return await acReqMRepository.listAllSubByARM(
    factory_code,
    req_no,
    department_code,
    user_code,
    query_level,
    search,
  );
}
async function getARMByID(factory_code, req_no) {
  return await acReqMRepository.getByID(factory_code, req_no);
}
async function getInvoiceNoList(
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus,
) {
  return await acReqMRepository.listAllInvoiceNo(
    factory_code,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getAllAcType(
  factory_code,
  user_code,
  department_code,
  query_level,
  invoice_no,
) {
  return await acReqMRepository.listAllAcType(
    factory_code,
    user_code,
    department_code,
    query_level,
    invoice_no,
  );
}
async function getAcTypeDropdown(
  factory_code,
  invoice_no,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus,
) {
  return await acReqMRepository.getAcTypeFromMaterPur(
    factory_code,
    invoice_no,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getAcNoList(
  factory_code,
  invoice_no,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus,
) {
  return await acReqMRepository.listAllAcNo(
    factory_code,
    invoice_no,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    isStatus,
  );
}
async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
) {
  return await acReqMRepository.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
  );
}
async function getReqNo(
  factory_code,
  year_month,
  factory_abbreviation,
  department_code,
  user_code,
  query_level,
) {
  return await acReqMRepository.createReqNo(
    factory_code,
    year_month,
    factory_abbreviation,
    department_code,
    user_code,
    query_level,
  );
}
async function addARM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acARM,
  pageSize,
  t,
) {
  try {
    const existARM = await getARMByID(acARM.factory_code, acARM.req_no);
    if (existARM) {
      const message =
        "Ac Req M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acReqMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acARM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from Ac Req M service: ", error);
  }
}
async function editARM(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  acARM,
  pageSize,
  t,
) {
  try {
    const existARM = await getARMByID(factory_code, req_no, acARM);
    if (!existARM) {
      console.log("ARMort material tracking is not exist !");
      return null;
    }
    const result = await acReqMRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existARM,
      acARM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ARMort material tracking service", error);
  }
}
async function deleteARM(factory_code, req_no, t) {
  try {
    const existARM = await getARMByID(factory_code, req_no);
    if (!existARM) {
      console.log("Ac Req M is not exist !");
      return null;
    }
    const result = await acReqMRepository.deleteARM(existARM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchARM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acARMFound = await acReqMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acARMFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelARM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  search,
) {
  const {rows} = await getAllSubByARM(
    factory_code,
    req_no,
    department_code,
    user_code,
    query_level,
    search
  );
  console.log("chec all  rows",rows);
  
  const defaultColumns = [
    { header: "Application No", key: "req_no", width: 20 },
    { header: "Item No", key: "req_seq", width: 15 },
    { header: "Source ID", key: "src_id", width: 20 },
    { header: "Procurement Type", key: "order_type", width: 15 },
    { header: "PO Date", key: "order_date", width: 20 },
    { header: "PO Number", key: "order_no", width: 20 },
    { header: "Order Item", key: "order_seq", width: 20 },
    { header: "Delivery Method", key: "ac_send", width: 15 },
    { header: "Contract No.", key: "cont_no", width: 40 },
    { header: "Customs No.", key: "ac_no", width: 20 },
    { header: "Factory Item No.", key: "ac_code", width: 20 },
    { header: "Customs Material No.", key: "item_acno", width: 20 },
    { header: "Customs quantity", key: "order_acqty", width: 20 },
    { header: "Requested Customs Qty", key: "req_acqty", width: 20 },
    { header: "Declared Qty.", key: "chge_qty", width: 20 },
    { header: "Received Qty", key: "y_rcpt", width: 20 },
    { header: "Qualified Qty", key: "pass_qty", width: 20 },
    { header: "Applied Qty", key: "req_qty", width: 20 },
    { header: "Currency", key: "currency", width: 20 },
    { header: "Price", key: "price", width: 20 },
    { header: "Amount", key: "amount", width: 20 },
    { header: "Receipt No.", key: "chk_no", width: 20 },
    { header: "Check Item No.", key: "chk_seq", width: 20 },
  ];

  return await generateExcelWithSub(rows, filename, defaultColumns);
}
async function exportExcelMaterialARM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomARM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
async function applyFilterActivate(orgId, reqNo, empId, pCharset) {
  return await acReqMRepository.applyFilter(orgId, reqNo, empId, pCharset);
}
module.exports = {
  getAllARM,
  getARMByID,
  getInvoiceNoList,
  getAcNoList,
  getReqNo,
  getAllAcType,
  getAcTypeDropdown,
  addARM,
  editARM,
  exportExcelARM,
  searchARM,
  deleteARM,
  exportExcelMaterialARM,
  exportExcelCustomARM,
  applyFilterActivate,
  confirmAll,
};
