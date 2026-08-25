const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const { generateTestPDF } = require("../../utils/testPDF");
const acCoMRepository = require("./ac_co_m.repository");

async function getAllACM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acCoMRepository.listAllAcCoM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getACMByID(factory_code, co_id) {
  return await acCoMRepository.getByID(factory_code, co_id);
}
async function generateCoid(factory_code) {
  return await acCoMRepository.createCoid(factory_code);
}
async function getFieldDropdown(factory_code, field, page, limit, search) {
  return await acCoMRepository.fetchFieldDropdown(
    factory_code,
    field,
    page,
    limit,
    search,
  );
}
async function getAllShipOrderToExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acCoMRepository.getAllShipOrderToExcel(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function addACM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getACMByID(acABM.factory_code, acABM.co_id);
    if (existABM) {
      const message =
        "Ac Co M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acCoMRepository.add(
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
async function editACM(
  factory_code,
  department_code,
  user_code,
  query_level,
  co_id,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getACMByID(factory_code, co_id);
    if (!existABM) {
      console.log("ABMort material tracking is not exist !");
      return null;
    }
    const result = await acCoMRepository.edit(
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
    const result = await acCoMRepository.deleteABM(existABM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchACM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const acACMFound = await acCoMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return acACMFound;
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
async function exportExcelShipOrder(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const rows = await getAllShipOrderToExcel(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );

    const columns = [
      { header: "FACTORY_CODE",  key: "factory_code",   width: 15 },
      { header: "NLT",           key: "nlt",             width: 15 },
      { header: "CUST_NO",       key: "cust_no",         width: 20 },
      { header: "PO",            key: "po",              width: 25 },
      { header: "MER_PO",        key: "mer_po",          width: 25 },
      { header: "CUST_LOT",      key: "cust_lot",        width: 20 },
      { header: "CR_PROD",       key: "cr_prod",         width: 20 },
      { header: "PROD_NO",       key: "prod_no",         width: 25 },
      { header: "SE_QTY",        key: "se_qty",          width: 12 },
      { header: "SE_ID",         key: "se_id",           width: 20 },
      { header: "SE_VER",        key: "se_ver",          width: 10 },
      { header: "PACK_GU",       key: "pack_gu",         width: 10 },
      { header: "SE_SEQ",        key: "se_seq",          width: 10 },
      { header: "SHIP_SEQ",      key: "ship_seq",        width: 10 },
      { header: "NET_WEIGHT",    key: "net_weight",      width: 12 },
      { header: "GROSS",         key: "gross",           width: 12 },
      { header: "FA_CBM",        key: "fa_cbm",          width: 12 },
      { header: "BOARD_DATE",    key: "board_date",      width: 15 },
      { header: "BOAT_NAME",     key: "boat_name",       width: 25 },
      { header: "DESTINATION",   key: "dest_nm",         width: 25 },
      { header: "BOAT_COMPANY",  key: "boat_company_nm", width: 25 },
      { header: "BOAT_CBM",      key: "boat_cbm",        width: 12 },
      { header: "AR_NO",         key: "ar_no",           width: 20 },
      { header: "OVER_CBM",      key: "over_cbm",        width: 12 },
      { header: "SORTING_CBM",   key: "sorting_cbm",     width: 12 },
      { header: "CO_NO",         key: "co_no",           width: 20 },
      { header: "EL_NO",         key: "el_no",           width: 20 },
      { header: "BL_NO",         key: "bl_no",           width: 20 },
      { header: "COUNTRY",       key: "country",         width: 20 },
      { header: "WS_NO",         key: "ws_no",           width: 20 },
      { header: "QL_DATE",       key: "ql_date",         width: 15 },
      { header: "BY_OUT",        key: "by_out",          width: 15 },
      { header: "ORI_SE_ID",     key: "ori_se_id",       width: 20 },
      { header: "SHIP_ORDER",    key: "ship_order",      width: 20 },
      { header: "ZIP_INVOICE",   key: "zip_invoice",     width: 20 },
      { header: "INVOICE_NO",    key: "invoice_no",      width: 20 },
      { header: "NOTE",          key: "note",            width: 30 },
      { header: "PLAN_SHIP_DATE",key: "plan_ship_date",  width: 15 },
      { header: "AC_PROD",       key: "ac_prod",         width: 20 },
      { header: "AC_NO",         key: "ac_no",           width: 20 },
      { header: "AC_CHGNO",      key: "ac_chgno",        width: 20 },
      { header: "OUT_DATE",      key: "out_date",        width: 15 },
      { header: "CTNS",          key: "ctns",            width: 12 },
      { header: "SH_PAIRS",      key: "sh_pairs",        width: 12 },
      { header: "SUM_MONEY",     key: "sum_money",       width: 15 },
      { header: "INVOICE_ID",    key: "invoice_id",      width: 20 },
      { header: "SALES_INVOICE", key: "sales_invoice",   width: 20 },
      { header: "ZIP_PRICE",     key: "zip_price_str",   width: 20 },
      { header: "PROD_MAT",      key: "prod_mat",        width: 30 },
    ];
    console.log("check fileName",filename);
  
    return await generateExcel(rows, filename, columns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}
module.exports = {
  getAllACM,
  getACMByID,
  generateCoid,
  getFieldDropdown,
  exportExcelShipOrder,
  addACM,
  editACM,
  exportPDFABM,
  exportPDFTest,
  searchACM,
  deleteABM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
};
