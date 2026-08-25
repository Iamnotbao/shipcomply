const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acIssueMTRepository = require("./ac_issue_m_t.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");
const { pdfToPackingList } = require("../../utils/pdfToPackingList");
const fs = require("fs");
const path = require("path");

async function getAllAcIssueM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await acIssueMTRepository.listAcIssueM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllForExcelDetail(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acIssueMTRepository.listAllForExcelDetail(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function getAllForExcelSummary(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  return await acIssueMTRepository.listAllForExcelSummary(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
}
async function activateAIMT(factory_code, user_code, conf_seq, language) {
  return await acIssueMTRepository.active(
    factory_code,
    user_code,
    conf_seq,
    language,
  );
}
async function getAcIssueMTByID(factory_code, conf_seq) {
  return await acIssueMTRepository.getByID(factory_code, conf_seq);
}
async function updateInvoiceD(factory_code, ac_no, invoice_id, user_code) {
  return await acIssueMTRepository.updateInvoiceDate(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function updateHsC(factory_code, ac_no, invoice_id, user_code) {
  return await acIssueMTRepository.updateHsCode(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function updateNw(factory_code, ac_no, invoice_id, user_code) {
  return await acIssueMTRepository.updateNwGw(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function activeSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await acIssueMTRepository.active(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function cancelActiveSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await acIssueMTRepository.cancelActive(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}

async function voidAllAIMT(
  factory_code,
  user_code,
  conf_seq,
  lock_seq,
  language,
) {
  return await acIssueMTRepository.voidAll(
    factory_code,
    user_code,
    conf_seq,
    lock_seq,
    language,
  );
}

async function calculateAIMT(factory_code, user_code, conf_seq, language) {
  return await acIssueMTRepository.calculate(
    factory_code,
    user_code,
    conf_seq,
    language,
  );
}
async function getSiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  return await acIssueMTRepository.createsiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
  );
}
async function getInvoiceDropdown(factory_code, page, limit, search) {
  return await acIssueMTRepository.fetchInvoiceDropdown(
    factory_code,
    page,
    limit,
    search,
  );
}
async function getPackingSeid(factory_code, invoice_no) {
  return await acIssueMTRepository.getPackingSeidByInvoice(
    factory_code,
    invoice_no,
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
async function addAcIssueMT(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getAcIssueMTByID(acImp.factory_code, acImp.conf_seq);
    if (existImp) {
      const message =
        "Import ac inm m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acIssueMTRepository.add(
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
async function editAcIssueMT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  editSeShipingM,
  pageSize,
  t,
) {
  try {
    const existInmM = await getAcIssueMTByID(factory_code, conf_seq);
    if (!existInmM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acIssueMTRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existInmM,
      editSeShipingM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ac inm m service", error);
  }
}
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acIssueMTRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcIssueM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  search,
  limit,
  offset,
) {
  try {
    const acImpFound = await acIssueMTRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
      limit,
      offset,
    );
    return acImpFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportExcel(
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await seShipingDService.getAllWithKey(
    query,
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  console.log("kodakdad", data);

  const plainData = data.map((item) => {
    const plain = item.get ? item.get({ plain: true }) : item;
    const flattened = {};
    if (plain.SSM) {
      flattened.start_date = plain.SSM.start_date || "";
      flattened.end_date = plain.SSM.end_date || "";
      flattened.status = plain.SSM.status || "";
    }
    Object.keys(plain).forEach((key) => {
      if (key !== "SSM") {
        flattened[key] = plain[key] || "";
      }
    });

    return flattened;
  });
  return await generateExcel(plainData, filename);
}
async function exportExcelDetail(
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  const data = await getAllForExcelDetail(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    query,
  );
  console.log("kodakdad", data);

  const plainData = data.map((item) => {
    const plain = item.get ? item.get({ plain: true }) : item;
    const flattened = {};
    if (plain.SSM) {
      flattened.start_date = plain.SSM.start_date || "";
      flattened.end_date = plain.SSM.end_date || "";
      flattened.status = plain.SSM.status || "";
    }
    Object.keys(plain).forEach((key) => {
      if (key !== "SSM") {
        flattened[key] = plain[key] || "";
      }
    });

    return flattened;
  });
  const columnDefinitions = [
    { header: "CHG No", key: "chg_no", width: 20 },
    { header: "AC Date", key: "ac_date", width: 15 },
    { header: "Y Seq", key: "y_seq", width: 12 },
    { header: "Conf Seq", key: "conf_seq", width: 12 },
    { header: "AC No", key: "ac_no", width: 20 },
    { header: "Source", key: "src", width: 10 },
    { header: "In AC No", key: "in_acno", width: 20 },
    { header: "In CHG No", key: "in_chgno", width: 20 },
    { header: "In Date", key: "d_year", width: 15 },
    { header: "CHG Series", key: "t_chgs", width: 20 },
    { header: "In Type", key: "t_intype", width: 15 },
    { header: "Prod No", key: "prod_no", width: 20 },
    { header: "Prod Name", key: "prod_name", width: 25 },
    { header: "Size Desc", key: "size_desc", width: 20 },
    { header: "Matd No", key: "matd_no", width: 20 },
    { header: "Unit Qty", key: "unit_qty", width: 12 },
    { header: "New Unit Qty", key: "new_unit_qty", width: 15 },
    { header: "Loss Per", key: "loss_per", width: 12 },
    { header: "BOM Loss Per", key: "bom_loss_per", width: 15 },
    { header: "Qty", key: "qty", width: 12 },
    { header: "Pairs", key: "pairs", width: 12 },
    { header: "Price", key: "price", width: 12 },
    { header: "Matd Seq", key: "matd_seq", width: 12 },
    { header: "Issue Seq", key: "issue_seq", width: 12 },
  ];
  return await generateExcel(plainData, filename, columnDefinitions);
}
async function exportExcelSummary(
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  const data = await getAllForExcelSummary(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    query,
  );
  console.log("kodakdad", data);

  const plainData = data.map((item) => {
    const plain = item.get ? item.get({ plain: true }) : item;
    const flattened = {};
    if (plain.SSM) {
      flattened.start_date = plain.SSM.start_date || "";
      flattened.end_date = plain.SSM.end_date || "";
      flattened.status = plain.SSM.status || "";
    }
    Object.keys(plain).forEach((key) => {
      if (key !== "SSM") {
        flattened[key] = plain[key] || "";
      }
    });
    return flattened;
  });
  // columnDefined cho Summary
  const columnDefinedSummary = [
    { header: "Factory Code", key: "factory_code", width: 15 },
    { header: "Conf Seq", key: "conf_seq", width: 12 },
    { header: "AC No", key: "ac_no", width: 20 },
    { header: "CHG No", key: "chg_no", width: 20 },
    { header: "Year No", key: "year_no", width: 12 },
    { header: "AC Date", key: "ac_date", width: 15 },
    { header: "Conf Date", key: "conf_date", width: 15 },
    { header: "ACBOM No", key: "acbom_no", width: 15 },
    { header: "Lock Seq", key: "lock_seq", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Min Prod No", key: "min_prod_no", width: 20 },
    { header: "Prod Name", key: "prod_name", width: 25 },
    { header: "Max Prod No", key: "max_prod_no", width: 20 },
    { header: "SE ID List", key: "se_id_list", width: 25 },
  ];
  return await generateExcel(plainData, filename, columnDefinedSummary);
}
async function exportPDFToPakingList(
  filename, // "Paking List.pdf"
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    // const data = await getAllData(...);  // query DB sau

    const headerData = {
      invoice_no: "A12440950",
      invoice_date: "May. 13, 2024",
      consignee_line1: "adidas LLP",
      consignee_line2:
        "Dostyk Ave., 210A, block 3, 4th floor 050004 Almaty Kazakstan",
      shipper: "CHI HUNG CO., LTD 2010",
      shipper_addr:
        "My Hiep Quarter, Thai Hoa Ward, Tan Uyen City, Binh Duong Province",
      shipper_tel: "84-650-3625022",
      shipper_fax: "84-650-3658241",
      fcr_no: "",
      sailing_date: "May. 13, 2024",
      port_from: "Ho Chi Minh, Vietnam",
      port_to: "KAZAKHSTAN",
      cust_order: "0300423502",
      po_no: "0134360199",
      art_no: "ID0892",
      description: "Footwear",
      country: "MADE IN VIETNAM",
      size_range: "4 ~ 7-",
      total_qty: 101,
      total_net: "101.02",
      total_gross: "111.25",
      total_cbm: ".097",
      total_cartons: 15,
      total_cartons_text: "FIFTEEN",
    };

    // UK_4: 2 dòng (10 prs + 1 prs)
    const detailData = [
      // UK_4: 2 dòng (10 prs + 1 prs)
      {
        carton_no: 1,
        size_label: "UK_4",
        qty: 10,
        net_weight: "9.27",
        gross_weight: "10.23",
        dim_str: "62.5 43.5 32.3",
        cbm: "0.009",
        is_carton_row: false,
      },
      {
        carton_no: 2,
        size_label: "UK_4",
        qty: 1,
        net_weight: "0.93",
        gross_weight: "1.02",
        dim_str: "22.2 12.8 32.3",
        cbm: "0.001",
        is_carton_row: true,
      },

      // UK_4.5: 2 dòng
      {
        carton_no: 3,
        size_label: "UK_4.5",
        qty: 10,
        net_weight: "9.41",
        gross_weight: "10.37",
        dim_str: "62.5 43.5 32.3",
        cbm: "0.009",
        is_carton_row: false,
      },
      {
        carton_no: 4,
        size_label: "UK_4.5",
        qty: 3,
        net_weight: "2.82",
        gross_weight: "3.11",
        dim_str: "38.2 22.2 32.3",
        cbm: "0.003",
        is_carton_row: true,
      },

      // UK_5: 2 dòng
      {
        carton_no: 5,
        size_label: "UK_5",
        qty: 10,
        net_weight: "9.57",
        gross_weight: "10.53",
        dim_str: "62.5 43.5 32.3",
        cbm: "0.009",
        is_carton_row: false,
      },
      {
        carton_no: 6,
        size_label: "UK_5",
        qty: 6,
        net_weight: "5.74",
        gross_weight: "6.32",
        dim_str: "44.0 38.2 32.3",
        cbm: "0.005",
        is_carton_row: true,
      },

      // UK_5.5
      {
        carton_no: 7,
        size_label: "UK_5.5",
        qty: 10,
        net_weight: "10.14",
        gross_weight: "11.18",
        dim_str: "62.5 46.5 34.3",
        cbm: "0.010",
        is_carton_row: false,
      },
      {
        carton_no: 8,
        size_label: "UK_5.5",
        qty: 6,
        net_weight: "6.08",
        gross_weight: "6.71",
        dim_str: "47.0 38.2 34.3",
        cbm: "0.006",
        is_carton_row: true,
      },

      // UK_6
      {
        carton_no: 9,
        size_label: "UK_6",
        qty: 10,
        net_weight: "10.33",
        gross_weight: "11.37",
        dim_str: "62.5 46.5 34.3",
        cbm: "0.010",
        is_carton_row: false,
      },
      {
        carton_no: 10,
        size_label: "UK_6",
        qty: 8,
        net_weight: "8.26",
        gross_weight: "9.10",
        dim_str: "50.8 47.0 34.3",
        cbm: "0.008",
        is_carton_row: true,
      },

      // UK_6.5
      {
        carton_no: 11,
        size_label: "UK_6.5",
        qty: 10,
        net_weight: "10.43",
        gross_weight: "11.47",
        dim_str: "62.5 46.5 34.3",
        cbm: "0.010",
        is_carton_row: false,
      },
      {
        carton_no: 12,
        size_label: "UK_6.5",
        qty: 1,
        net_weight: "1.04",
        gross_weight: "1.15",
        dim_str: "23.7 12.8 34.3",
        cbm: "0.001",
        is_carton_row: true,
      },

      // UK_7
      {
        carton_no: 13,
        size_label: "UK_7",
        qty: 10,
        net_weight: "10.57",
        gross_weight: "11.61",
        dim_str: "62.5 46.5 34.3",
        cbm: "0.010",
        is_carton_row: false,
      },
      {
        carton_no: 14,
        size_label: "UK_7",
        qty: 1,
        net_weight: "1.06",
        gross_weight: "1.16",
        dim_str: "23.7 12.8 34.3",
        cbm: "0.001",
        is_carton_row: true,
      },

      // UK_7.5: 1 dòng
      {
        carton_no: 15,
        size_label: "UK_7.5",
        qty: 5,
        net_weight: "5.37",
        gross_weight: "5.92",
        dim_str: "24.2 32.3 36.3",
        cbm: "0.005",
        is_carton_row: false,
      },
    ];
    // 1. Generate buffer
    const pdfBuffer = await pdfToPackingList(
      detailData,
      filename,
      "PACKING/WEIGTH LIST",
    );

    // 2. Ghi ra file tạm — dùng path tuyệt đối, tên file không có dấu /
    //    __dirname trỏ tới thư mục của service file hiện tại
    const safeFilename = filename.replace(/[/\\]/g, "_"); // "Paking List.pdf"
    const filePath = path.join(__dirname, "../../", safeFilename);
    fs.writeFileSync(filePath, pdfBuffer);

    // 3. Trả về đường dẫn để controller dùng res.download()
    return filePath;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
module.exports = {
  getAllAcIssueM,
  getAcIssueMTByID,
  getSiSeq,
  addAcIssueMT,
  editAcIssueMT,
  exportPDF,
  exportExcel,
  searchAcIssueM,
  deleteAcImp,
  updateInvoiceD,
  updateHsC,
  updateNw,
  activeSeInvM,
  cancelActiveSeInvM,
  voidAllAIMT,
  getInvoiceDropdown,
  getPackingSeid,
  exportPDFToPakingList,
  activateAIMT,
  calculateAIMT,
  getAllForExcelDetail,
  getAllForExcelSummary,
  exportExcelDetail,
  exportExcelSummary,
};
