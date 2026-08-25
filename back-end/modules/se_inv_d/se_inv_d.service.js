const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const seInvMRepository = require("./se_inv_d.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");

async function getAllSeInvD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  se_id,
  se_ver,
  se_seq,
  language,
  limit,
  offset,
) {
  return await seInvMRepository.fetchListOfSeInvD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  se_id,
  se_ver,
  se_seq,
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
module.exports = {
  getAllSeInvD,
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
  updateHsC
};
