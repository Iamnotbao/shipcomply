const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const { pdfToPackingList1 } = require("../../utils/pdfToPackingList1");
const pakingListMRepository = require("./paking_list_m.repository");
const fs = require("fs");
const path = require("path");

async function getAllPLM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await pakingListMRepository.listOfPakingListM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
  );
}
async function getSPByID(factory_code, pay_no) {
  return await pakingListMRepository.getByID(factory_code, pay_no);
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
    const existABM = await getSPByID(
      acABM.factory_code,
      acABM.pay_no,
    );
    if (existABM) {
      const message =
        "Se Pay is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await pakingListMRepository.add(
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
  pay_no,
  acABM,
  pageSize,
  t,
) {
  try {
    const existABM = await getSPByID(factory_code, pay_no);
    if (!existABM) {
      console.log("ABMort material tracking is not exist !");
      return null;
    }
    const result = await pakingListMRepository.edit(
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
    const result = await pakingListMRepository.deleteABM(existABM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchPLM(
  factory_code,
  user_code,
  query_level,
  department_code,
  language,
  filters,
  limit,
  offset,
) {
  try {
    const acABMFound = await pakingListMRepository.search(
       factory_code,
  user_code,
  query_level,
  department_code,
  language,
  filters,
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
async function exportPDFToPakingList(
  filename, 
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


const detailData = [

  { carton_no: "1-2",   cust_size: "UK_4",   size: "37⅓", qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 21,  total_gw: 11.25, qty: 21,  nw: 10.20,  gw: 11.25,  measure: "0.010" },
  { carton_no: "3-4",   cust_size: "UK_4.5", size: "38",  qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 13,  total_gw: 13.48, qty: 13,  nw: 12.23,  gw: 13.48,  measure: "0.012" },
  { carton_no: "5-6",   cust_size: "UK_5",   size: "38⅔", qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 16,  total_gw: 16.85, qty: 16,  nw: 15.31,  gw: 16.85,  measure: "0.014" },
  { carton_no: "7-8",   cust_size: "UK_5.5", size: "39⅓", qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 16,  total_gw: 17.89, qty: 16,  nw: 16.22,  gw: 17.89,  measure: "0.016" },
  { carton_no: "9-10",  cust_size: "UK_6",   size: "40",  qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 18,  total_gw: 20.47, qty: 18,  nw: 18.59,  gw: 20.47,  measure: "0.018" },
  { carton_no: "11-12", cust_size: "UK_6.5", size: "40⅔", qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 11,  total_gw: 12.62, qty: 11,  nw: 11.47,  gw: 12.62,  measure: "0.011" },
  { carton_no: "13-14", cust_size: "UK_7",   size: "41⅓", qty_per_ctn: 10, total_ctns: 2,  ship_qty_prs: 11,  total_gw: 12.77, qty: 11,  nw: 11.63,  gw: 12.77,  measure: "0.011" },
  { carton_no: "15",    cust_size: "UK_7.5", size: "42",  qty_per_ctn: 5,  total_ctns: 1,  ship_qty_prs: 5,   total_gw: 5.92,  qty: 5,   nw: 5.37,   gw: 5.92,   measure: "0.005" },
];


    // 1. Generate buffer
    const pdfBuffer = await pdfToPackingList1(
      detailData,
      filename,
      "PACKING/WEIGTH LIST 1",
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
  getAllPLM,
  getSPByID,
  addSP,
  editSP,
  exportPDFABM,
  searchPLM,
  deleteABM,
  exportExcelMaterialABM,
  exportExcelCustomABM,
  exportPDFToPakingList
};
