const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const { generateTestPDF } = require("../../utils/testPDF");
const acBomMService = require("./ac_bom_m.repository");

async function getAllABM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  isAll = false,
) {
  return await acBomMService.listAllABM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
    isAll,
  );
}
async function getABMByID(factory_code, prod_acno, item_acno) {
  return await acBomMService.getByID(factory_code, prod_acno, item_acno);
}
async function addABM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getABMByID(
      acABM.factory_code,
      acABM.prod_acno,
      acABM.item_acno,
    );
    if (existABM) {
      const message =
        "Ac Bom M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acBomMService.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acABM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from Ac Bom M service: ", error);
  }
}
async function editABM(
  factory_code,
  department_code,
  user_code,
  query_level,
  prod_acno,
  item_acno,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getABMByID(
      factory_code,
      prod_acno,
      item_acno,
      acABM,
    );
    if (!existABM) {
      console.log("ABMort material tracking is not exist !");
      return null;
    }
    const result = await acBomMService.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existABM,
      acABM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ABMort material tracking service", error);
  }
}
async function deleteABM(factory_code, prod_acno, item_acno, t) {
  try {
    const existABM = await getAcABMByID(factory_code, prod_acno, item_acno);
    if (!existABM) {
      console.log("ABMort material tracking is not exist !");
      return null;
    }
    const result = await acBomMService.deleteABM(existABM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchABM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acABMFound = await acBomMService.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acABMFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFABM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const { rows } = await getAllABM(
    factory_code,
    department_code,
    user_code,
    query_level,
    "",
    "",
    true,
  );
  const actualRows = rows.map((r) => r.get({ plain: true }));
  return await generateExcel(actualRows, "AC_BOM_M");
}
async function exportPDFTest(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getAllABM(
    factory_code,
    department_code,
    user_code,
    query_level,
    10,
    0,
  );
  const plainFactory = data?.rows.map((d) => d.get({ plain: true }));
  await generateTestPDF(plainFactory, filename, "AC_BOM_M");
  return filename;
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllABM,
  getABMByID,
  addABM,
  editABM,
  exportPDFABM,
  exportPDFTest,
  searchABM,
  deleteABM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
};
