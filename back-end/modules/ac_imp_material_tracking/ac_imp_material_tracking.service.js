const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acImpMaterialTrackingReposity = require("./ac_imp_material_tracking.repository");

async function getAllAcImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  language,
  isAll = false,
) {
  return await acImpMaterialTrackingReposity.listAllImp(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
    language,
    isAll
  );
}
async function getAcImpByID(factory_code, invoice_no, sort) {
  return await acImpMaterialTrackingReposity.getByID(
    factory_code,
    invoice_no,
    sort,
  );
}
async function getCom(
  factory_code,
  field,
  value,
  department_code,
  user_code,
  query_level,
  limit,
  page,
  search,
) {
  return await acImpMaterialTrackingReposity.getComInvoice(
    factory_code,
    field,
    value,
    department_code,
    user_code,
    query_level,
    limit,
    page,
    search,
  );
}
async function getCol4(
  factory_code,
  field,
  value,
  invoice_no,
  department_code,
  user_code,
  query_level,
) {
  return await acImpMaterialTrackingReposity.getCol4Dropdown(
    factory_code,
    field,
    value,
    invoice_no,
    department_code,
    user_code,
    query_level,
  );
}
async function getSort(
  factory_code,
  com_invoice,
  department_code,
  user_code,
  query_level,
) {
  return await acImpMaterialTrackingReposity.getSortData(
    factory_code,
    com_invoice,
    department_code,
    user_code,
    query_level,
  );
}
async function getFieldDropDown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  com_invoice,
  sort,
  page,
  limit,
  search,
) {
  return await acImpMaterialTrackingReposity.getFieldDropDown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    com_invoice,
    sort,
    page,
    limit,
    search,
  );
}
async function addAcImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getAcImpByID(
      acImp.factory_code,
      acImp.invoice_no,
      acImp.sort,
    );
    if (existImp) {
      const message =
        "Import material tracking is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acImpMaterialTrackingReposity.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acImp,
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
async function editAcImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  invoice_no,
  sort,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acImpMaterialTrackingReposity.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existImp,
      acImp,
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
    const result = await acImpMaterialTrackingReposity.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcImp(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acImpFound = await acImpMaterialTrackingReposity.search(
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
  const {rows} = await getAllAcImp(
    factory_code,
    department_code,
    user_code,
    query_level,
    "",
    "",
    "",
    true
  );
  return await generateExcel(rows, filename);
}
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllAcImp,
  getAcImpByID,
  getFieldDropDown,
  getCom,
  getCol4,
  getSort,
  addAcImp,
  editAcImp,
  exportExcelAcImp,
  searchAcImp,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
