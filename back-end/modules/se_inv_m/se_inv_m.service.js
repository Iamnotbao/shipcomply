const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const seInvMRepository = require("./se_inv_m.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");
const { pdfToPackingList } = require("../../utils/pdfToPackingList");
const fs = require("fs");
const path = require("path");

async function getAllSeInvM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await seInvMRepository.ListOfSeInvM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getSeInvMByID(factory_code, ac_no, invoice_id) {
  return await seInvMRepository.getByID(factory_code, ac_no, invoice_id);
}
async function updateInvoiceD(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.updateInvoiceDate(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function updateHsC(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.updateHsCode(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function updateNw(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.updateNwGw(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function activeSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.active(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function cancelActiveSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.cancelActive(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function voidAllSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.voidAll(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function closeSeInvM(factory_code, ac_no, invoice_id, user_code) {
  return await seInvMRepository.close(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
}
async function getSiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  return await seInvMRepository.createsiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
  );
}
async function getInvoiceDropdown(factory_code, page, limit, search) {
  return await seInvMRepository.fetchInvoiceDropdown(
    factory_code,
    page,
    limit,
    search,
  );
}
async function getPackingSeid(factory_code, invoice_no) {
  return await seInvMRepository.getPackingSeidByInvoice(
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
async function addSeInvM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getSeInvMByID(
      acImp.factory_code,
      acImp.ac_no,
      acImp.invoice_id,
    );
    if (existImp) {
      const message =
        "Import ac inm m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await seInvMRepository.add(
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
async function editSeInvM(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  editSeShipingM,
  pageSize,
  t,
) {
  try {
    const existInmM = await getSeInvMByID(factory_code, ac_no, invoice_id);
    if (!existInmM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await seInvMRepository.edit(
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
    const result = await seInvMRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchSeInvM(
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
    const acImpFound = await seInvMRepository.search(
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
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
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
  { carton_no: 1, size_label: "UK_4",   qty: 10, net_weight: "9.27",  gross_weight: "10.23", dim_str: "62.5 43.5 32.3", cbm: "0.009", is_carton_row: false },
  { carton_no: 2, size_label: "UK_4",   qty: 1,  net_weight: "0.93",  gross_weight: "1.02",  dim_str: "22.2 12.8 32.3", cbm: "0.001", is_carton_row: true },

  // UK_4.5: 2 dòng
  { carton_no: 3, size_label: "UK_4.5", qty: 10, net_weight: "9.41",  gross_weight: "10.37", dim_str: "62.5 43.5 32.3", cbm: "0.009", is_carton_row: false },
  { carton_no: 4, size_label: "UK_4.5", qty: 3,  net_weight: "2.82",  gross_weight: "3.11",  dim_str: "38.2 22.2 32.3", cbm: "0.003", is_carton_row: true },

  // UK_5: 2 dòng
  { carton_no: 5, size_label: "UK_5",   qty: 10, net_weight: "9.57",  gross_weight: "10.53", dim_str: "62.5 43.5 32.3", cbm: "0.009", is_carton_row: false },
  { carton_no: 6, size_label: "UK_5",   qty: 6,  net_weight: "5.74",  gross_weight: "6.32",  dim_str: "44.0 38.2 32.3", cbm: "0.005", is_carton_row: true },

  // UK_5.5
  { carton_no: 7,  size_label: "UK_5.5", qty: 10, net_weight: "10.14", gross_weight: "11.18", dim_str: "62.5 46.5 34.3", cbm: "0.010", is_carton_row: false },
  { carton_no: 8,  size_label: "UK_5.5", qty: 6,  net_weight: "6.08",  gross_weight: "6.71",  dim_str: "47.0 38.2 34.3", cbm: "0.006", is_carton_row: true },

  // UK_6
  { carton_no: 9,  size_label: "UK_6",   qty: 10, net_weight: "10.33", gross_weight: "11.37", dim_str: "62.5 46.5 34.3", cbm: "0.010", is_carton_row: false },
  { carton_no: 10, size_label: "UK_6",   qty: 8,  net_weight: "8.26",  gross_weight: "9.10",  dim_str: "50.8 47.0 34.3", cbm: "0.008", is_carton_row: true },

  // UK_6.5
  { carton_no: 11, size_label: "UK_6.5", qty: 10, net_weight: "10.43", gross_weight: "11.47", dim_str: "62.5 46.5 34.3", cbm: "0.010", is_carton_row: false },
  { carton_no: 12, size_label: "UK_6.5", qty: 1,  net_weight: "1.04",  gross_weight: "1.15",  dim_str: "23.7 12.8 34.3", cbm: "0.001", is_carton_row: true },

  // UK_7
  { carton_no: 13, size_label: "UK_7",   qty: 10, net_weight: "10.57", gross_weight: "11.61", dim_str: "62.5 46.5 34.3", cbm: "0.010", is_carton_row: false },
  { carton_no: 14, size_label: "UK_7",   qty: 1,  net_weight: "1.06",  gross_weight: "1.16",  dim_str: "23.7 12.8 34.3", cbm: "0.001", is_carton_row: true },

  // UK_7.5: 1 dòng
  { carton_no: 15, size_label: "UK_7.5", qty: 5,  net_weight: "5.37",  gross_weight: "5.92",  dim_str: "24.2 32.3 36.3", cbm: "0.005", is_carton_row: false },
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
  getAllSeInvM,
  getSeInvMByID,
  getSiSeq,
  addSeInvM,
  editSeInvM,
  exportPDF,
  exportExcel,
  searchSeInvM,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  updateInvoiceD,
  updateHsC,
  updateNw,
  activeSeInvM,
  cancelActiveSeInvM,
  voidAllSeInvM,
  closeSeInvM,
  getInvoiceDropdown,
  getPackingSeid,
  exportPDFToPakingList,
};
