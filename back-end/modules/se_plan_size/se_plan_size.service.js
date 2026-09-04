const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const sePlanSizeRepository = require("./se_plan_size.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");

async function getAllSePlanSize(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  language,
  limit,
  offset,
) {
  return await sePlanSizeRepository.listAllSePlanSize(
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    pack_gu,
    se_ver,
    se_seq,
    ship_seq,
    language,
    limit,
    offset,
  );
}
async function getSePlanSizeByID(
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
) {
  return await sePlanSizeRepository.getByID(
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
    pk_seq,
  );
}
async function getSizeCtns(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  pk_seq,
  ship_seq,
  new_ctns,
) {
  return await sePlanSizeRepository.getCtns(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    pk_seq,
    ship_seq,
    new_ctns,
  );
}
async function updateSPOSummary(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
  transaction,
) {
  return await sePlanSizeRepository.updateSePlanOrdSummary(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    ship_seq,
    transaction,
  );
}
async function confirmAll(
  factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
) {
  return await sePlanSizeRepository.confirm(
    factory_code,
    user_code,
    department_code,
    query_level,
    se_id,
    pack_gu,
    se_ver,
    se_seq,
    ship_seq,
  );
}
async function autoGenerate(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
  transaction,
) {
  return await sePlanSizeRepository.autoGenerateSePlanSize(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    ship_seq,
    transaction,
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
async function addSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const existImp = await getSePlanOrdByID(
      acImp.factory_code,
      acImp.se_id,
      acImp.se_ver,
      acImp.se_seq,
      acImp.pack_gu,
      acImp.ship_seq,
    );
    if (existImp) {
      const message =
        "Import ac inm m is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await sePlanSizeRepository.add(
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
async function editSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
  editSePlanOrd,
  pageSize,
) {
  try {
    const existInmM = await getSePlanSizeByID(
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
      pk_seq,
    );
    if (!existInmM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await sePlanSizeRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existInmM,
      editSePlanOrd,
      pageSize,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    throw error;
  }
}
async function deleteAcImp(factory_code, invoice_no, sort, t) {
  try {
    const existImp = await getAcImpByID(factory_code, invoice_no, sort, acImp);
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await sePlanSizeRepository.deleteImp(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function deleteSePlanSize(
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
  data,
  t,
) {
  try {
    
    if (Array.isArray(data) && data.length > 0) {
      const result = await sePlanSizeRepository.deleteItems(data, t);
      if (!result) {
        console.log("Cannot delete because data from db is null!");
        return null;
      }
      return result;
    }
    const existImp = await getSePlanSizeByID(
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
      pk_seq,
    );
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await sePlanSizeRepository.deleteItem(existImp, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
    throw error;
  }
}
async function confirmItemsSePlanSize(
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  t,
) {
  try {
    if (Array.isArray(data) && data.length > 0) {
        
      const result = await sePlanSizeRepository.confirmItems(
        data,
        factory_code,
        department_code,
        user_code,
        query_level,
        t,
      );
      return result?.success ? result : null;
    }
    return null;
  } catch (error) {
    console.log("Cannot confirm", error);
    throw error;
  }
}
async function unconfirmItemsSePlanSize(
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  t,
) {
  try {
    if (Array.isArray(data) && data.length > 0) {
      const result = await sePlanSizeRepository.unconfirmItems(
        data,
        factory_code,
        department_code,
        user_code,
        query_level,
        t,
      );
      return result?.success ? result : null;
    }
    return null;
  } catch (error) {
    console.log("Cannot unconfirm", error);
    throw error;
  }
}
async function searchSePlanOrd(
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
    const acImpFound = await sePlanSizeRepository.search(
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
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}

module.exports = {
  getAllSePlanSize,
  getSePlanSizeByID,
  getSizeCtns,
  updateSPOSummary,
  autoGenerate,
  addSePlanOrd,
  editSePlanOrd,
  exportPDF,
  exportExcel,
  searchSePlanOrd,
  deleteAcImp,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  confirmAll,
  confirmItemsSePlanSize,
  unconfirmItemsSePlanSize,
  deleteSePlanSize,
};
