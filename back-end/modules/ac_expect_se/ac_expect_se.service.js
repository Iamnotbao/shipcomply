const { generateExcel } = require("../../utils/excel");
const acExpectSeRepository = require("./ac_expect_se.repository");

async function getAllAcExpectSe(
  factory_code,
  expect_id,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acExpectSeRepository.listAllAcExpectSe(
    factory_code,
    expect_id,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllAcChgMWithD(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acExpectSeRepository.listAllAcChgMWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}

async function getFieldDropdown(factory_code, field, page, limit, search) {
  return await acExpectSeRepository.fetchFieldDropdown(
    factory_code,
    field,
    page,
    limit,
    search,
  );
}
async function getAcExpectMByID(factory_code, expect_id) {
  return await acExpectSeRepository.getByID(factory_code, expect_id);
}
async function generateExpectId(factory_code) {
  return await acExpectSeRepository.createExpectId(factory_code);
}


async function addAcExpectM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acExpectM,
  pageSize,
  t,
  type,
) {
  try {
    const existImp = await getAcExpectMByID(
      acExpectM.factory_code,
      acExpectM.expect_id,
    );
    if (existImp) {
      const message =
        "Import ac chg m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acExpectSeRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acExpectM,
      pageSize,
      t,
      type,
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
async function editAcExpectM(
  factory_code,
  department_code,
  user_code,
  query_level,
  expect_id,
  acChgM,
  pageSize,
  t,
  type,
) {
  try {
    const existChgM = await getAcExpectMByID(factory_code, expect_id);
    if (!existChgM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acExpectSeRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existChgM,
      acChgM,
      pageSize,
      t,
      type,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ac chg m service", error);
  }
}
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acExpectSeRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcExpectM(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const acImpFound = await acExpectSeRepository.search(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelAcChgM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const data = await getAllAcChgMWithD(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );
    const plainData =
      data && data.length > 0 ? data.map((d) => d.get({ plain: true })) : [];
    const acChgMColumns = [
      { header: "AC_NO", key: "AC_NO", width: 15 },
      { header: "AC_CHGNO", key: "AC_CHGNO", width: 20 },
      { header: "AC_ITEMNM", key: "AC_ITEMNM", width: 40 },
      { header: "AC_ITEM", key: "AC_ITEM", width: 30 },
      { header: "COUNTRY", key: "COUNTRY", width: 20 },
      { header: "UNITNM", key: "UNITNM", width: 15 },
      { header: "SKY", key: "SKY", width: 10 },
      { header: "TAXRATE", key: "TAXRATE", width: 12 },
      { header: "AC_ITEMNO", key: "AC_ITEMNO", width: 20 },
      { header: "ZERO", key: "ZERO", width: 10 },
      { header: "SEQ", key: "SEQ", width: 10 },
      { header: "OUT_DATE", key: "OUT_DATE", width: 15 },
      { header: "ETD", key: "ETD", width: 15 },
      { header: "C_SHEETNO", key: "C_SheetNo", width: 25 },
      { header: "CURR_RATE", key: "CURR_RATE", width: 15 },
      { header: "SUM_MONEY", key: "SUM_MONEY", width: 15 },
      { header: "COM_INVOICE", key: "COM_INVOICE", width: 20 },
      { header: "COM_DATE", key: "COM_DATE", width: 15 },
      { header: "ARR_DATE", key: "ARR_DATE", width: 15 },
    ];
    return await generateExcel(plainData, filename, acChgMColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}

async function activateAcCM(
  factory_code,
  user_code,
  ac_no,
  curr_rate,
  language,
) {
  return await acExpectSeRepository.activate(
    factory_code,
    user_code,
    ac_no,
    curr_rate,
    language,
  );
}

async function genOrderMaterial(factory_code, expect_id, user_code) {
  return await acExpectSeRepository.generateOrderMaterial(
    factory_code,
    expect_id,
    user_code,
  );
}
async function calculateWriteoff(factory_code, expect_id, user_code) {
  return await acExpectSeRepository.calculateWriteoffMaterial(
    factory_code,
    expect_id,
    user_code,
  );
}
async function reportShoeM(
  factory_code,
  department_code,
  query_level,
  user_code,
  language,
  expect_id,
) {
  return await acExpectSeRepository.reportShoeModel(
    factory_code,
    department_code,
    query_level,
    user_code,
    language,
    expect_id,
  );
}
async function reportWriteoff(
  factory_code,
  department_code,
  query_level,
  user_code,
  language,
  expect_id,
) {
  return await acExpectSeRepository.reportExpectWriteoff(
    factory_code,
    department_code,
    query_level,
    user_code,
    language,
    expect_id,
  );
}
async function exportExcelShoeM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  expect_id,
) {
  try {
    const data = await reportShoeM(
      factory_code,
      department_code,
      query_level,
      user_code,
      language,
      expect_id,
    );
    const plainData =
      data && data.length > 0 ? data.map((d) => d.get({ plain: true })) : [];
    const defaultColumns = [
      { header: "PROD_NO", key: "prod_no", width: 20 },
      { header: "PROD_NM", key: "prod_nm", width: 40 },
      { header: "BOM_PROD", key: "bom_prod", width: 20 },
      { header: "AC_SHOE", key: "ac_shoe", width: 20 },
      { header: "SE_QTY", key: "se_qty", width: 15 },
    ];
    return await generateExcel(plainData, filename, defaultColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}
async function exportExcelWriteoff(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  expect_id,
) {
  try {
    const data = await reportWriteoff(
      factory_code,
      department_code,
      query_level,
      user_code,
      language,
      expect_id,
    );
    const plainData =
      data && data.length > 0 ? data.map((d) => d.get({ plain: true })) : [];
    const defaultColumns = [
      { header: "EXPECT_ID", key: "expect_id", width: 15 },
      { header: "SEQ", key: "seq", width: 10 },
      { header: "MATD_NO", key: "matd_no", width: 20 },
      { header: "MATD_NAME", key: "matd_name", width: 40 },
      { header: "MATD_UNITNM", key: "matd_unitnm", width: 15 },
      { header: "LOSS_PER", key: "loss_per", width: 12 },
      { header: "EXPECT_QTY", key: "expect_qty", width: 15 },
      { header: "LEFT_QTY", key: "left_qty", width: 15 },
      { header: "ISSUE_QTY", key: "issue_qty", width: 15 },
      { header: "DRAW_QTY", key: "draw_qty", width: 15 },
    ];
    return await generateExcel(plainData, filename, defaultColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}
module.exports = {
  getAllAcExpectSe,
  getAcExpectMByID,
  generateExpectId,
  addAcExpectM,
  editAcExpectM,
  exportExcelAcChgM,
  searchAcExpectM,
  deleteAcImp,
  activateAcCM,
  genOrderMaterial,
  calculateWriteoff,
  exportExcelShoeM,
  exportExcelWriteoff,
  getFieldDropdown,
};
