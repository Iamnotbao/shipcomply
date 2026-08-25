const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acProcMRepository = require("./ac_proc_m.repository");
const acInmDService = require("../ac_inm_d/ac_inm_d.service");

async function getAllAcProcM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acProcMRepository.listAllAcProcM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  return await acProcMRepository.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
  );
}
async function getAllAcProcMMarkB(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acProcMRepository.listAllAcProcMMarkB(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllAcProcMWithD(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acProcMRepository.listAllAcProcMWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getAllAcProcMWithDMarkB(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acProcMRepository.listAllAcProcMWithDetailsMarkB(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getAcProcMByID(factory_code, ac_no) {
  return await acProcMRepository.getByID(factory_code, ac_no);
}
async function generateAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
  mark,
) {
  return await acProcMRepository.createAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
    mark,
  );
}
async function exportPDF(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const data = await acInmDService.getAllWithKey(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const plainData = data.map((item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const flattened = { ...plain };
      if (plain.AIM) {
        flattened.issued_date = plain.AIM.issued_date || "";
        flattened.expire_date = plain.AIM.expire_date || "";
        flattened.req_no = plain.AIM.req_no || "";
        flattened.commno = plain.AIM.commno || "";
        flattened.status = plain.AIM.status || "";
        delete flattened.AIM;
      }
      return flattened;
    });
    await generatePDF(plainData, filename, "AC_INM_M");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function addAcProcM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acChgM,
  pageSize,
  mark,
  t,
) {
  try {
    const existImp = await getAcProcMByID(acChgM.factory_code, acChgM.ac_no);
    if (existImp) {
      const message =
        "Import ac chg m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acProcMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acChgM,
      pageSize,
      mark,
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
async function editAcProcM(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  acChgM,
  pageSize,
  mark,
  t,
) {
  try {
    const existChgM = await getAcProcMByID(factory_code, ac_no);
    if (!existChgM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acProcMRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existChgM,
      acChgM,
      pageSize,
      mark,
      t,
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
    const result = await acProcMRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcProcM(
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
    const acImpFound = await acProcMRepository.search(
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
async function searchAcProcMForMarkB(
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
    const acImpFound = await acProcMRepository.searchForMarkB(
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
async function exportExcelAcProcM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    // Define columns first - always needed
    const acProcMColumns = [
      { header: "AC_NO", key: "ac_no", width: 15 },
      { header: "AC_CHGENO", key: "ac_chgeno", width: 20 },
      { header: "AC_ITEMNM", key: "ac_itemnm", width: 40 },
      { header: "AC_ITEM", key: "ac_item", width: 30 },
      { header: "COUNTRY", key: "country", width: 20 },
      { header: "UNITNM", key: "unitnm", width: 15 },
      { header: "SKY", key: "sky", width: 10 },
      { header: "TAXRATE", key: "taxrate", width: 12 },
      { header: "AC_ITEMNO", key: "ac_itemno", width: 20 },
      { header: "ZERO", key: "zero", width: 10 },
      { header: "SEQ", key: "seq", width: 10 },
      { header: "OUT_DATE", key: "out_date", width: 15 },
      { header: "ETD", key: "etd", width: 15 },
      { header: "C_SHEETNO", key: "c_sheetno", width: 25 },
      { header: "CURR_RATE", key: "curr_rate", width: 15 },
      { header: "SUM_MONEY", key: "sum_money", width: 15 },
      { header: "COM_INVOICE", key: "com_invoice", width: 20 },
      { header: "COM_DATE", key: "com_date", width: 15 },
      { header: "ARR_DATE", key: "arr_date", width: 15 },
    ];

    // Get data
    const data = await getAllAcProcMWithD(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );

    // Convert to plain data if exists
    let plainData = [];
    if (data && data.length > 0) {
      plainData = data.map((d) => {
        // Handle both Sequelize models and plain objects
        return typeof d.get === "function" ? d.get({ plain: true }) : d;
      });
    }

    // Always generate Excel with headers, even if no data
    return await generateExcel(plainData, filename, acProcMColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}

// Alternative: If generateExcel needs at least 1 row, add empty row
async function exportExcelAcProcM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const acProcMColumns = [
      { header: "AC_NO", key: "ac_no", width: 15 },
      { header: "AC_CHGENO", key: "ac_chgeno", width: 20 },
      { header: "AC_ITEMNM", key: "ac_itemnm", width: 40 },
      { header: "AC_ITEM", key: "ac_item", width: 30 },
      { header: "COUNTRY", key: "country", width: 20 },
      { header: "UNITNM", key: "unitnm", width: 15 },
      { header: "SKY", key: "sky", width: 10 },
      { header: "TAXRATE", key: "taxrate", width: 12 },
      { header: "AC_ITEMNO", key: "ac_itemno", width: 20 },
      { header: "ZERO", key: "zero", width: 10 },
      { header: "SEQ", key: "seq", width: 10 },
      { header: "OUT_DATE", key: "out_date", width: 15 },
      { header: "ETD", key: "etd", width: 15 },
      { header: "C_SHEETNO", key: "c_sheetno", width: 25 },
      { header: "CURR_RATE", key: "curr_rate", width: 15 },
      { header: "SUM_MONEY", key: "sum_money", width: 15 },
      { header: "COM_INVOICE", key: "com_invoice", width: 20 },
      { header: "COM_DATE", key: "com_date", width: 15 },
      { header: "ARR_DATE", key: "arr_date", width: 15 },
    ];
    const { data } = await getAllAcProcMWithD(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );
    console.log("check the dataiiii", data);

    let plainData = [];
    if (data && data.length > 0) {
      plainData = data.map((d) => {
        return typeof d.get === "function" ? d.get({ plain: true }) : d;
      });
    } else {
      plainData = [{}];
    }

    return await generateExcel(plainData, filename, acProcMColumns);
  } catch (error) {
    console.error("Export Excel error:", error);
    throw error;
  }
}
async function exportExcelAcProcMMarkB(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const acProcMColumns = [
      { header: "AC_NO", key: "ac_no", width: 15 },
      { header: "AC_CHGENO", key: "ac_chgeno", width: 20 },
      { header: "AC_ITEMNM", key: "item_name", width: 40 },
      { header: "AC_ITEM", key: "ac_item", width: 30 },
      { header: "COUNTRY", key: "country", width: 20 },
      { header: "UNITNM", key: "unit_name", width: 15 },
      { header: "AC_QTY", key: "ac_qty", width: 12 },
      { header: "PRICE", key: "price", width: 12 },
      { header: "MONEY", key: "money", width: 15 },
      { header: "RB_MONEY", key: "rb_money", width: 15 },
      { header: "TAXRATE", key: "atax_rate", width: 12 },
      { header: "AC_ITEMNO", key: "ac_itemno", width: 20 },
      { header: "SEQ", key: "seq", width: 10 },
      { header: "SUM_QTY", key: "sum_qty", width: 15 },
      { header: "SUM_MONEY", key: "sum_money", width: 15 },
      { header: "SUM_RB_MONEY", key: "sum_rb_money", width: 15 },
      { header: "COM_INVOICE", key: "com_invoice", width: 20 },
      { header: "AC_DATE", key: "ac_date", width: 15 },
      { header: "STATUS", key: "status", width: 10 },
    ];

    const { data, totals } = await getAllAcProcMWithDMarkB(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );
    // Flatten data for Excel export
    let plainData = [];
    if (data && data.length > 0) {
      for (const item of data) {
        if (item.details && item.details.length > 0) {
          for (const detail of item.details) {
            plainData.push({
              ac_no: item.ac_no,
              ac_chgeno: item.ac_chgeno,
              com_invoice: item.com_invoice,
              ac_date: item.ac_date,
              status: item.status,
              sum_qty: item.sum_qty,
              sum_money: item.sum_money,
              sum_rb_money: item.sum_rb_money,
              ac_itemno: detail.ac_itemno,
              item_name: detail.item_name,
              ac_item: detail.ac_item,
              unit_name: detail.unit_name,
              ac_qty: detail.ac_qty,
              price: detail.price,
              money: detail.money,
              rb_money: detail.rb_money,
              atax_rate: detail.atax_rate,
              seq: detail.seq,
            });
          }
        } else {
          plainData.push({
            ac_no: item.ac_no,
            ac_chgeno: item.ac_chgeno,
            com_invoice: item.com_invoice,
            ac_date: item.ac_date,
            status: item.status,
            sum_qty: item.sum_qty,
            sum_money: item.sum_money,
            sum_rb_money: item.sum_rb_money,
          });
        }
      }

      if (totals && totals.last_ac_no) {
        plainData.push({
          ac_no: totals.last_ac_no,
          ac_chgeno: "--- GRAND TOTAL ---",
          item_name: "TOTAL",
          sum_qty: totals.sum_qty,
          sum_money: totals.sum_money,
          sum_rb_money: totals.sum_rb_money,
        });
      }
    } else {
      plainData = [{}];
    }
    // Generate Excel file
    return await generateExcel(plainData, filename, acProcMColumns);
  } catch (error) {
    console.error("Export Excel error (markB):", error);
    throw error;
  }
}
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
async function activateAcPM(
  factory_code,
  user_code,
  ac_no,
  curr_rate,
  language,
) {
  return await acProcMRepository.activate(
    factory_code,
    user_code,
    ac_no,
    curr_rate,
    language,
  );
}
async function cancelActivateAcPM(factory_code, ac_no, user_code, language) {
  return await acProcMRepository.cancelActivate(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function closeAcPM(factory_code, ac_no, user_code) {
  return await acProcMRepository.close(factory_code, ac_no, user_code);
}
async function voidAllAcPM(factory_code, ac_no, user_code, language) {
  return await acProcMRepository.voidAll(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}

async function activateAcPMMarkB(factory_code, user_code, ac_no, language) {
  return await acProcMRepository.activateMarkB(
    factory_code,
    user_code,
    ac_no,
    language,
  );
}
async function cancelActivateAcPMMarkB(
  factory_code,
  ac_no,
  user_code,
  language,
) {
  return await acProcMRepository.cancelActivateMarkB(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function closeAcPMMarkB(factory_code, ac_no, user_code) {
  return await acProcMRepository.closeMarkB(factory_code, ac_no, user_code);
}
async function voidAllAcPMMarkB(factory_code, ac_no, user_code, language) {
  return await acProcMRepository.voidAllMarkB(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function checkDuplicateAGEO(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgeno,
  out_date,
  ac_no,
) {
  return await acProcMRepository.checkDuplicateAcChgeno(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_chgeno,
    out_date,
    ac_no,
  );
}
module.exports = {
  getAllAcProcM,
  getAllAcProcMMarkB,
  getAcProcMByID,
  generateAcno,
  addAcProcM,
  editAcProcM,
  exportPDF,
  exportExcelAcProcM,
  exportExcelAcProcMMarkB,
  searchAcProcM,
  searchAcProcMForMarkB,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  activateAcPM,
  cancelActivateAcPM,
  closeAcPM,
  voidAllAcPM,
  activateAcPMMarkB,
  cancelActivateAcPMMarkB,
  closeAcPMMarkB,
  voidAllAcPMMarkB,
  confirmAll,
  checkDuplicateAGEO
};
