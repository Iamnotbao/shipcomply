const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acChgMRepository = require("./ac_chg_m.repository");
const acInmDService = require("../ac_inm_d/ac_inm_d.service");
const {
  pdfToCustomDeclaration,
} = require("../../utils/pdfToCustomDeclaration");
const { pdfToItemDetails } = require("../../utils/pdfToItemDetails");

async function getAllAcChgM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acChgMRepository.listAllAcInmM(
    factory_code,
    department_code,
    user_code,
    query_level,
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
  type,
) {
  return await acChgMRepository.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    type,
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
  return await acChgMRepository.listAllAcChgMWithDetails(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getAllAcChgMToExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acChgMRepository.listAllAcChgMToExcel(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getAllReportChgDToExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  return await acChgMRepository.listAllReportChgD(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
  );
}
async function getAllReportChgDWithName(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  return await acChgMRepository.listAllReportChgDWithName(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
  );
}
async function getAllAcReportDescProc(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  return await acChgMRepository.listAllReportDescProc(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
  );
}
async function getFieldDropdown(factory_code, field, page, limit, search) {
  return await acChgMRepository.fetchFieldDropdown(
    factory_code,
    field,
    page,
    limit,
    search,
  );
}
async function getAcChgMByID(factory_code, ac_no) {
  return await acChgMRepository.getByID(factory_code, ac_no);
}
async function generateAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
  type,
) {
  return await acChgMRepository.createAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
    type,
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
async function exportPDFChgDToExcel(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  try {
    const data = await getAllReportChgDToExcel(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
    );
    const orderData = await getAllAcReportDescProc(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
    );
    const test =
      orderData?.length > 0
        ? orderData
        : [
            {
              ori: "ori001",
              desc_item: "Bang gia",
              addo: "addo001",
            },
            {
              ori: "ori002",
              desc_item: "Bang Ke toan",
              addo: "addo002",
            },
          ];
    console.log("test ", test);
    await pdfToCustomDeclaration(
      data,
      filename,
      "TỜ KHAI HÀNG HÓA XUẤT KHẨU",
      test,
    );
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportPDFChgDToExcelWithName(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  try {
    const data = await getAllReportChgDWithName(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
    );
    await pdfToCustomDeclaration(data, filename, "TỜ KHAI HÀNG HÓA XUẤT KHẨU");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportPDFItems(filename) {
  try {
    await pdfToItemDetails(filename, "PHẦN DÀNH CHO KIỂM TRA CỦA HẢI QUAN");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function addAcChgM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acChgM,
  pageSize,
  t,
  type,
) {
  try {
    const existImp = await getAcChgMByID(acChgM.factory_code, acChgM.ac_no);
    if (existImp) {
      const message =
        "Import ac chg m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acChgMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acChgM,
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
async function editAcChgM(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  acChgM,
  pageSize,
  t,
  type,
) {
  try {
    const existChgM = await getAcChgMByID(factory_code, ac_no);
    if (!existChgM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acChgMRepository.edit(
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
    const result = await acChgMRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcInmM(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acImpFound = await acChgMRepository.search(
      search,
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
    const plainData = data && data.length > 0 ? data : [];
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
async function exportExcelAcChgMToTransfer(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const rows = await getAllAcChgMToExcel(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      filters,
    );

    if (!rows || rows.length === 0) {
      return { message: "No data found" };
    }

    // Tính tổng toàn bộ
    const totalQty = rows.reduce((sum, r) => sum + parseFloat(r.qty || 0), 0);
    const totalMoney = rows.reduce(
      (sum, r) => sum + parseFloat(r.money || 0),
      0,
    );

    const plainData = [
      ...rows,
      {
        ac_no: "TOTAL",
        min_cont: null,
        v_po: null,
        ac_itemno: null,
        shoe_id: null,
        t_acprod: null,
        t_name: null,
        qty: totalQty,
        price: null,
        money: totalMoney,
        sum_qty: null,
        sum_money: null,
        tax: null,
      },
    ];

    const columns = [
      { header: "AC_NO", key: "ac_no", width: 20 },
      { header: "MIN_CONT", key: "min_cont", width: 20 },
      { header: "V_PO", key: "v_po", width: 40 },
      { header: "AC_ITEMNO", key: "ac_itemno", width: 20 },
      { header: "SHOE_ID", key: "shoe_id", width: 20 },
      { header: "T_ACPROD", key: "t_acprod", width: 25 },
      { header: "T_NAME", key: "t_name", width: 50 },
      { header: "QTY", key: "qty", width: 15 },
      { header: "PRICE", key: "price", width: 15 },
      { header: "MONEY", key: "money", width: 15 },
      { header: "SUM_QTY", key: "sum_qty", width: 15 },
      { header: "SUM_MONEY", key: "sum_money", width: 15 },
      { header: "TAX", key: "tax", width: 15 },
    ];

    return await generateExcel(plainData, filename, columns);
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
  return await acChgMRepository.activate(
    factory_code,
    user_code,
    ac_no,
    curr_rate,
    language,
  );
}
async function activateAcCMExp(factory_code, ac_no, user_code, language) {
  return await acChgMRepository.activateExp(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function cancelActivateAcCM(factory_code, ac_no, user_code, language) {
  return await acChgMRepository.cancelActivate(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function cancelActivateAcCMExp(factory_code, ac_no, user_code, language) {
  return await acChgMRepository.cancelActivateExp(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function refreshGrossW(factory_code, ac_no) {
  return await acChgMRepository.refreshGrossWeight(factory_code, ac_no);
}
async function closeAcCM(factory_code, ac_no, user_code) {
  return await acChgMRepository.close(factory_code, ac_no, user_code);
}
async function voidAllAcCM(factory_code, ac_no, user_code, language) {
  return await acChgMRepository.voidAll(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function voidAllAcCMExp(factory_code, ac_no, user_code, language) {
  return await acChgMRepository.voidAllExp(
    factory_code,
    ac_no,
    user_code,
    language,
  );
}
async function confirmPassD(factory_code, ac_no, out_date) {
  return await acChgMRepository.confirmPassDate(factory_code, ac_no, out_date);
}
async function checkDuplicateAGO(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgno,
  out_date,
  ac_no,
  type
) {
  return await acChgMRepository.checkDuplicateAcChgno(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_chgno,
    out_date,
    ac_no,
    type
  );
}
module.exports = {
  getAllAcChgM,
  getAcChgMByID,
  generateAcno,
  addAcChgM,
  editAcChgM,
  exportPDF,
  exportExcelAcChgM,
  searchAcInmM,
  deleteAcImp,
  exportExcelAcChgMToTransfer,
  exportPDFChgDToExcel,
  activateAcCM,
  cancelActivateAcCM,
  closeAcCM,
  voidAllAcCM,
  activateAcCMExp,
  cancelActivateAcCMExp,
  refreshGrossW,
  voidAllAcCMExp,
  confirmPassD,
  getAllReportChgDToExcel,
  getAllAcReportDescProc,
  exportPDFChgDToExcelWithName,
  exportPDFItems,
  getFieldDropdown,
  confirmAll,
  checkDuplicateAGO,
};
