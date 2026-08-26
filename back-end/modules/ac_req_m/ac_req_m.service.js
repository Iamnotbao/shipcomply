const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acReqMRepository = require("./ac_req_m.repository");
const userService = require("../users/user.service");

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

  const result = await acReqMRepository.listAllARM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );

  if (Array.isArray(result)) {
    return {
      rows: result,
      count: result.length,
      hasMore: false,
    };
  }

  return result;
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
async function exportPDFARM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getAllARM(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  console.log("dataa", data);

  const plainFactory = data.rows.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename, "AC_REQ_M");
  return filename;
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
  exportPDFARM,
  searchARM,
  deleteARM,
  exportExcelMaterialARM,
  exportExcelCustomARM,
  applyFilterActivate,
  confirmAll,
};
