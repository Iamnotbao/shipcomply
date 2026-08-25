const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwApdueAllRepository = require("./vw_apdue_all.repository");

async function getListOfVApA(
  vend_no,
  com_invoice,
  col6,
  col4,
  language,
  limit,
  offset,
) {
  return await vwApdueAllRepository.getListOfVwApDueAll(
    vend_no,
    com_invoice,
    col6,
    col4,
    language,
    limit,
    offset,
  );
}
async function getAllVwApDueAllWithD(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await vwApdueAllRepository.listAllVwApDueAllWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}

async function exportVApAExcel(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {

    const { data } = await getAllVwApDueAllWithD(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );
     // Define Excel columns based on SQL result
    const transferColumns = [
      { header: "RCPT_DATE", key: "rcpt_date", width: 12 },
      { header: "AP_REFNO", key: "ap_refno", width: 15 },
      { header: "AP_REFSEQ", key: "ap_refseq", width: 12 },
      { header: "ITEM_NO", key: "item_no", width: 15 },
      { header: "ITEM_NAME", key: "item_name", width: 40 },
      { header: "UNITNM", key: "unitnm", width: 12 },
      { header: "ITEM_ACNO", key: "item_acno", width: 15 },
      { header: "ITEM_NAME1", key: "item_name1", width: 40 },
      { header: "UNIT1", key: "unit1", width: 12 },
      { header: "UNITNM1", key: "unitnm1", width: 12 },
      { header: "RCPT_QTY", key: "rcpt_qty", width: 12 },
      { header: "AC_QTY", key: "ac_qty", width: 12 },
      { header: "AP_QTY", key: "ap_qty", width: 12 },
      { header: "PRICE", key: "price", width: 12 },
      { header: "EXCHG_RATE", key: "exchg_rate", width: 12 },
      { header: "B_PRICE", key: "b_price", width: 12 },
      { header: "AP_BMONEY", key: "ap_bmoney", width: 15 },
      { header: "B_APMONEY", key: "b_apmoney", width: 15 },
    ];

    // Convert to plain data
    let plainData = [];
    if (data && data.length > 0) {
      plainData = data.map((d) => {
        return typeof d.get === "function" ? d.get({ plain: true }) : d;
      });
    } else {
      plainData = [{}]; // Empty row if no data
    }

    // Generate Excel file
    return await generateExcel(plainData, filename, transferColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}
module.exports = {
  getListOfVApA,
  exportVApAExcel
};
