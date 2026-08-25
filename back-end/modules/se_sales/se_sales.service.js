const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const seSalesRepository = require("./se_sales.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");

async function getAllSeSales(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await seSalesRepository.listAllSeSales(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllSalesDetails(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  return await seSalesRepository.listAllSalesDetails(
    search,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
}
async function getAllSalesDetails2(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  sales_id,
) {
  return await seSalesRepository.listAllSalesDetails2(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    sales_id,
  );
}
async function getSeShippingMByID(factory_code, cust_id, si_seq) {
  return await seSalesRepository.getByID(factory_code, cust_id, si_seq);
}
async function getSiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  return await seSalesRepository.createsiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
  );
}
async function getFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  language,
  page,
  limit,
  search,
) {
  return await seSalesRepository.fetchFieldDataDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    language ,
    page,
    limit,
    search,
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
async function addSeShipingM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getSeShippingMByID(
      acImp.factory_code,
      acImp.cust_id,
      acImp.si_seq,
    );
    if (existImp) {
      const message =
        "Import ac inm m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await seSalesRepository.add(
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
async function editSeShipingM(
  factory_code,
  department_code,
  user_code,
  query_level,
  cust_id,
  si_seq,
  editSeShipingM,
  pageSize,
  t,
) {
  try {
    const existInmM = await getSeShippingMByID(factory_code, cust_id, si_seq);
    if (!existInmM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await seSalesRepository.edit(
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
    const result = await seSalesRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchSeSales(
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
    const acImpFound = await seSalesRepository.search(
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
async function exportExcel(
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  const data = await getAllSalesDetails(
    query,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );

  const defaultColumns = [
    { key: "sales_no", header: "Sales No" },
    { key: "corp_name", header: "Corp Name" },
    { key: "sales_date", header: "Sales Date" },
    { key: "remark", header: "Remark" },
    { key: "sales_seq", header: "Sales Seq" },
    { key: "stt", header: "STT" },
    { key: "book_no", header: "Book No" },
    { key: "che", header: "CHE" },
    { key: "se_id", header: "SE ID" },
    { key: "se_seq", header: "SE Seq" },
    { key: "ship_seq", header: "Ship Seq" },
    { key: "pack_gu", header: "Pack GU" },
    { key: "status", header: "Status" },
    { key: "cbm", header: "CBM" },
    { key: "p_stoc", header: "P Stoc" },
    { key: "ac_chgno", header: "AC CHG No" },
    { key: "ac_no", header: "AC No" },
    { key: "ctns", header: "CTNS" },
    { key: "pdd", header: "PDD (NLT)" },
    { key: "dm_no", header: "DM No" },
  ];

  return await generateExcel(data, filename, defaultColumns);
}
async function exportExcel2(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  sales_id,
) {
  const data = await getAllSalesDetails2(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    sales_id,
  );

  const defaultColumns = [
    { key: "sales_no", header: "Sales No" },
    { key: "send_corp", header: "Send Corp" },
    { key: "corp_name", header: "Corp Name" },
    { key: "sales_date", header: "Sales Date" },
    { key: "stt", header: "STT" },
    { key: "che", header: "CHE" },
    { key: "sales_seq", header: "Sales Seq" },
    { key: "se_id", header: "SE ID" },
    { key: "se_seq", header: "SE Seq" },
    { key: "ship_seq", header: "Ship Seq" },
    { key: "pack_gu", header: "Pack GU" },
    { key: "book_no", header: "Book No" },
    { key: "status", header: "Status" },
    { key: "cbm", header: "CBM" },
    { key: "ac_chgno", header: "AC CHG No" },
    { key: "p_stoc", header: "P Stoc" },
    { key: "ctns", header: "CTNS" },
  ];

  return await generateExcel(data, filename, defaultColumns);
}
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllSeSales,
  getSeShippingMByID,
  getSiSeq,
  addSeShipingM,
  editSeShipingM,
  exportPDF,
  exportExcel,
  searchSeSales,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  exportExcel2,
  getFieldDataDropdown
};
