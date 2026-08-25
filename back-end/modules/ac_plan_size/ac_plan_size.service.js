const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acPlanSizeRepository = require("./ac_plan_size.repository");

async function getListOfAPS(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
  ac_no,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
) {
  return await acPlanSizeRepository.getListOfAcPLanSize(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
    ac_no,
    se_id,
    se_seq,
    se_ver,
    pack_gu,
    ship_seq,
  );
}
async function updateProdAc(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
  ac_no,
  prod_acno,
) {
  return await acPlanSizeRepository.updateProdAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    se_seq,
    se_ver,
    pack_gu,
    ship_seq,
    ac_no,
    prod_acno,
  );
}
async function getAPSByID(
  factory_code,
  ac_no,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
  size_no,
) {
  return await acPlanSizeRepository.getByID(
    factory_code,
    ac_no,
    se_id,
    se_seq,
    se_ver,
    pack_gu,
    ship_seq,
    size_no,
  );
}
async function getFieldDropdown(factory_code, language, page, limit, search) {
  return await acPlanSizeRepository.fetchFieldDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
}
async function addSP(
  factory_code,
  department_code,
  user_code,
  query_level,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getSPByID(acABM.factory_code, acABM.pay_no);
    if (existABM) {
      const message =
        "Se Pay is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acPlanSizeRepository.add(
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
async function editSP(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
  ac_no,
  size_no,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getAPSByID(
      factory_code,
      ac_no,
      se_id,
      se_seq,
      se_ver,
      pack_gu,
      ship_seq,
      size_no,
    );
    if (!existABM) {
      console.log("ABMort material tracking is not exist !");
      return null;
    }
    const result = await acPlanSizeRepository.edit(
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
    const result = await acPlanSizeRepository.deleteABM(existABM, t);
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
    const acABMFound = await acPlanSizeRepository.search(
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
  const data = await getAllABM(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename, "AC_BOM_M");
  return filename;
}
async function exportExcelMaterialABM(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomABM(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getListOfAPS,
  getAPSByID,
  addSP,
  editSP,
  exportPDFABM,
  searchABM,
  deleteABM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  getFieldDropdown,
  updateProdAc,
  getAPSByID,
};
