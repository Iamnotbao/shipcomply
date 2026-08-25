const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const seShippingMRepository = require("./se_shiping_m.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");

async function getAllSeShipingM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  return await seShippingMRepository.listAllSeShipingM(
    factory_code,
    department_code,
    user_code,
    query_level,
    (language = "en"),
    limit,
    offset,
  );
}
async function getSeShippingMByID(factory_code, cust_id, si_seq) {
  return await seShippingMRepository.getByID(factory_code, cust_id, si_seq);
}
async function getSiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  return await seShippingMRepository.createsiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
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
    const result = await seShippingMRepository.add(
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
    const result = await seShippingMRepository.edit(
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
    const result = await seShippingMRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchSeShipingM(
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
    const acImpFound = await seShippingMRepository.search(
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
async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  cust_id,
  si_seq,
) {
  try {
    const response = await seShippingMRepository.confirm(
      factory_code,
      department_code,
      user_code,
      query_level,
      cust_id,
      si_seq,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  getAllSeShipingM,
  getSeShippingMByID,
  getSiSeq,
  addSeShipingM,
  editSeShipingM,
  exportPDF,
  exportExcel,
  searchSeShipingM,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  confirmAll
};
