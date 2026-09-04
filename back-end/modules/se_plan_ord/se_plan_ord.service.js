const { generateExcel, generateExcelWithSub } = require("../../utils/excel");
const { exportExcelCustoms } = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const sePlanOrdRepository = require("./se_plan_ord.repository");
const seShipingDService = require("../se_shiping_d/se_shiping_d.service");
const { RdTempCache } = require("../rd_temp/rd_temp");
const { readExcel } = require("../../utils/importExcel");
async function getAllSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await sePlanOrdRepository.listAllSePlanOrd(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllSePlanOrdLink(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await sePlanOrdRepository.listSePlanOrdLink(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllPlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  return await sePlanOrdRepository.listAllPlanOrd(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
}
async function getAllSePlanOrdDetails(
  filters,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  return await sePlanOrdRepository.listAllSePlanOrdDetails(
    filters,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
}
async function getMaterialOut(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) {
  return await sePlanOrdRepository.getMaterialOut(
    session_id,
    factory_code,
    department_code,
    user_code,
    query_level,
    search,
  );
}
async function getPeriodEndMaterial(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) {
  return await sePlanOrdRepository.getPeriodEndMaterial(
    session_id,
    factory_code,
    department_code,
    user_code,
    query_level,
    search,
  );
}
async function getShipOrder(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) {
  return await sePlanOrdRepository.getShipOrder(
    session_id,
    factory_code,
    department_code,
    user_code,
    query_level,
    search,
  );
}
async function getPP026Excel(session_id, factory_code, user_code, search) {
  return await sePlanOrdRepository.getPP026Excel(
    session_id,
    factory_code,
    user_code,
    search,
  );
}
async function getAllFieldDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  extraField,
) {
  return await sePlanOrdRepository.fetchFieldDropdown(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    extraField,
  );
}
async function checkBoxItem(
  sessionKey,
  factory_code,
  gridData,
  is_check,
  filters,
  isAll,
  language,
) {
  return await sePlanOrdRepository.checkItem(
    sessionKey,
    factory_code,
    gridData,
    is_check,
    filters,
    isAll,
    language,
  );
}
async function checkTextItem(sessionKey, gridData) {
  return await sePlanOrdRepository.checkTextItem(sessionKey, gridData);
}
async function getSePlanOrdByID(
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
) {
  return await sePlanOrdRepository.getByID(
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
  );
}
async function getShipSeq(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  department_code,
  user_code,
  query_level,
) {
  return await sePlanOrdRepository.createShipSeq(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    department_code,
    user_code,
    query_level,
  );
}
async function getCBM(factory_code, se_id, pack_gu, se_seq, se_ver, ship_seq) {
  return await sePlanOrdRepository.createCBM(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    ship_seq,
  );
}
async function getMoney(
  factory_code,
  se_id,
  department_code,
  user_code,
  query_level,
) {
  return await sePlanOrdRepository.createMoney(
    factory_code,
    se_id,
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
async function confirmCheckBox(
  factory_code,
  department_code,
  user_code,
  session_id,
  gridData,
) {
  try {
    const result = await sePlanOrdRepository.confirmCheck(
      factory_code,
      department_code,
      user_code,
      session_id,
      gridData,
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

async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
) {
  try {
    const result = await sePlanOrdRepository.confirm(
      factory_code,
      department_code,
      user_code,
      query_level,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
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
async function getTempTable(session_id, limit, offset) {
  try {
    const result = await sePlanOrdRepository.getTempTable(
      session_id,
      limit,
      offset,
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
async function getTempTextTable(session_id, limit, offset) {
  try {
    const result = await sePlanOrdRepository.getTempTextTable(
      session_id,
      limit,
      offset,
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
async function recreateTempTable(factory_code, user_code, session_id) {
  try {
    const result = await sePlanOrdRepository.recreateTempT(
      factory_code,
      user_code,
      session_id,
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
async function clearTempTable(session_id) {
  try {
    const result = await sePlanOrdRepository.clearTempTable(session_id);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from import material trackin service: ", error);
  }
}
async function clearTempTextTable(session_id) {
  try {
    const result = await sePlanOrdRepository.clearTempTextTable(session_id);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from import material trackin service: ", error);
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
    const result = await sePlanOrdRepository.add(
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
  editSePlanOrd,
  pageSize,
  t,
) {
  try {
    const existInmM = await getSePlanOrdByID(
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
    );
    if (!existInmM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await sePlanOrdRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existInmM,
      editSePlanOrd,
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
async function deleteSePlanOrd(
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  data,
  t,
) {
  try {
    
    if (Array.isArray(data) && data.length > 0) {
      const result = await sePlanOrdRepository.deleteItems(data, t);
      if (!result) {
        console.log("Cannot delete because data from db is null!");
        return null;
      }
      return result;
    }
    const existImp = await getSePlanOrdByID(
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
    );
    if (!existImp) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await sePlanOrdRepository.deleteItem(existImp, t);
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
async function confirmItemsSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  t,
) {
  try {
        
    console.log("check the data pass",data);
    
    if (Array.isArray(data) && data.length > 0) {
        
      const result = await sePlanOrdRepository.confirmItems(
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
async function unconfirmItemsSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  t,
) {
  try {
    if (Array.isArray(data) && data.length > 0) {
      const result = await sePlanOrdRepository.unconfirmItems(
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
    const acImpFound = await sePlanOrdRepository.search(
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
async function searchPD(
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
    const acImpFound = await sePlanOrdRepository.searchPlanOrd(
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
async function searchSePlanOrdLink(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  try {
    const acImpFound = await sePlanOrdRepository.searchLink(
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
  const data = await getAllSePlanOrdDetails(
    query,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
  console.log("check the dame", data);

  return await generateExcel(data, filename);
}
async function exportExcelMaterial(
  token,
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getMaterialOut(
    token,
    factory_code,
    department_code,
    user_code,
    query_level,
    query,
  );
  const defaultColumns = [
    { header: "ITEM_NO", key: "item_no", width: 20 },
    { header: "FACTORY_CODE", key: "factory_code", width: 15 },
    { header: "STOC_NO", key: "stoc_no", width: 20 },
    { header: "TRANS_TYPE", key: "trans_type", width: 15 },
    { header: "SPECIAL_INVENTORY", key: "special_inventory", width: 20 },
    { header: "MATERIAL_FILE", key: "material_file", width: 20 },
    { header: "MATERIAL_FILE_ITEM", key: "material_file_item", width: 20 },
    { header: "TRANS_DATE", key: "trans_date", width: 20 },
    { header: "OUT_QTY", key: "out_qty", width: 15 },
    { header: "UNIT", key: "unit", width: 10 },
    { header: "WORK_ORDER_NO", key: "work_order_no", width: 20 },
    { header: "PO", key: "po", width: 20 },
    { header: "AMOUNT", key: "amount", width: 15 },
    { header: "NAME_E", key: "name_e", width: 30 },
    { header: "TRANS_TYPE_TEXT", key: "trans_type_text", width: 20 },
    { header: "ITEM_TEXT", key: "item_text", width: 30 },
  ];
  return await generateExcelWithSub(data, filename, defaultColumns);
}
async function exportExcelEndMaterial(
  token,
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getPeriodEndMaterial(
    token,
    factory_code,
    department_code,
    user_code,
    query_level,
    query,
  );
  const defaultColumns = [
    { header: "ITEM_NO", key: "item_no", width: 20 },
    { header: "FACTORY_CODE", key: "factory_code", width: 15 },
    { header: "STOC_NO", key: "stoc_no", width: 20 },
    { header: "TRANS_TYPE", key: "trans_type", width: 15 },
    { header: "SPECIAL_INVENTORY", key: "special_inventory", width: 20 },
    { header: "MATERIAL_FILE", key: "material_file", width: 20 },
    { header: "MATERIAL_FILE_ITEM", key: "material_file_item", width: 20 },
    { header: "TRANS_DATE", key: "trans_date", width: 20 },
    { header: "OUT_QTY", key: "out_qty", width: 15 },
    { header: "UNIT", key: "unit", width: 10 },
    { header: "WORK_ORDER_NO", key: "work_order_no", width: 20 },
    { header: "PO", key: "po", width: 20 },
    { header: "AMOUNT", key: "amount", width: 15 },
    { header: "NAME_E", key: "name_e", width: 30 },
    { header: "TRANS_TYPE_TEXT", key: "trans_type_text", width: 20 },
    { header: "ITEM_TEXT", key: "item_text", width: 30 },
  ];
  return await generateExcelWithSub(data, filename, defaultColumns);
}
async function exportExcelShipOrder(
  token,
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getShipOrder(
    token,
    factory_code,
    department_code,
    user_code,
    query_level,
    query,
  );
  const defaultColumns = [
    { header: "ITEM_NO", key: "item_no", width: 20 },
    { header: "FACTORY_CODE", key: "factory_code", width: 15 },
    { header: "STOC_NO", key: "stoc_no", width: 20 },
    { header: "TRANS_TYPE", key: "trans_type", width: 15 },
    { header: "SPECIAL_INVENTORY", key: "special_inventory", width: 20 },
    { header: "MATERIAL_FILE", key: "material_file", width: 20 },
    { header: "MATERIAL_FILE_ITEM", key: "material_file_item", width: 20 },
    { header: "TRANS_DATE", key: "trans_date", width: 20 },
    { header: "OUT_QTY", key: "out_qty", width: 15 },
    { header: "UNIT", key: "unit", width: 10 },
    { header: "WORK_ORDER_NO", key: "work_order_no", width: 20 },
    { header: "PO", key: "po", width: 20 },
    { header: "AMOUNT", key: "amount", width: 15 },
    { header: "NAME_E", key: "name_e", width: 30 },
    { header: "TRANS_TYPE_TEXT", key: "trans_type_text", width: 20 },
    { header: "ITEM_TEXT", key: "item_text", width: 30 },
  ];
  return await generateExcelWithSub(data, filename, defaultColumns);
}
async function exportToPP026Excel(
  token,
  filename,
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getPP026Excel(token, factory_code, user_code, query);
  const defaultColumns = [
    { header: "ORG_ID", key: "org_id", width: 15 },
    { header: "SE_ID", key: "se_id", width: 20 },
    { header: "ITEM_NO", key: "item_no", width: 20 },
    { header: "NAME_E", key: "name_e", width: 30 },
    { header: "SIZE_NO", key: "size_no", width: 15 },
    { header: "WK_ID", key: "wk_id", width: 20 },
    { header: "DRAW_NO", key: "draw_no", width: 20 },
    { header: "STOC_NO", key: "stoc_no", width: 20 },
    { header: "DRAW_TYPE", key: "draw_type", width: 15 },
    { header: "REQ_DATE", key: "req_date", width: 20 },
    { header: "DRAW_DATE", key: "draw_date", width: 20 },
    { header: "STATUS", key: "status", width: 10 },
    { header: "COLUMN1", key: "column1", width: 20 },
    { header: "REQ_QTY", key: "req_qty", width: 15 },
    { header: "DRAW_QTY", key: "draw_qty", width: 15 },
    { header: "UNIT", key: "unit", width: 10 },
    { header: "SAP_SORTF", key: "sap_sortf", width: 15 },
    { header: "SAP_AUFNR", key: "sap_aufnr", width: 20 },
    { header: "SAP_WK_POSNR", key: "sap_wk_posnr", width: 15 },
    { header: "RSNUM", key: "rsnum", width: 15 },
    { header: "RSPOS", key: "rspos", width: 15 },
    { header: "SE_VER", key: "se_ver", width: 10 },
    { header: "SE_SEQ", key: "se_seq", width: 10 },
    { header: "SHIP_SEQ", key: "ship_seq", width: 10 },
    { header: "PACK_GU", key: "pack_gu", width: 10 },
    { header: "PART_NO", key: "part_no", width: 20 },
    { header: "SAP_OUT_QTY", key: "v_sap_outqty", width: 15 },
    { header: "SAP_UNIT", key: "v_sap_unit", width: 10 },
    { header: "GR_NO", key: "v_gr_no", width: 30 },
    { header: "GR_ITEM", key: "v_gr_item", width: 20 },
    { header: "CUR_NO", key: "v_cur_no", width: 10 },
    { header: "MONEY", key: "v_money", width: 15 },
    { header: "TRANS_TYPE", key: "v_trans_type", width: 20 },
    { header: "TRANS_DATE", key: "v_trans_date", width: 20 },
    { header: "SHIP_QTY", key: "v_ship_qty", width: 15 },
    { header: "SE_QTY", key: "v_se_qty", width: 15 },
    { header: "ISTAT", key: "v_istat", width: 10 },
    { header: "GAMNG", key: "v_gamng", width: 15 },
    { header: "ITEM_ACNO", key: "item_acno", width: 20 },
    { header: "AC_UNIT", key: "ac_unit", width: 10 },
    { header: "REF_ITEM_NO", key: "ref_item_no", width: 20 },
    { header: "FORMULA", key: "formula", width: 20 },
  ];
  return await generateExcel(data, filename, defaultColumns);
}
async function importExcel(factory_code, user_code, session_id, fileBuffer) {
  const { rows } = await getTempTextTable(session_id);
  console.log("truoc add", rows, fileBuffer);
  const rowsData = readExcel(fileBuffer, [
    "varchar03",
    "varchar04",
    "varchar05",
  ]);
  await clearTempTextTable(session_id);
  let imported = 0;
  for (const row of rowsData) {
    const item = {
      factory_code: factory_code ?? null,
      user_code: user_code ?? null,
      varchar03: row.varchar03 ?? null,
      varchar04: row.varchar04 ?? null,
      varchar05: row.varchar05 ?? null,
    };
    await checkTextItem(session_id, item);
    imported++;
  }
  const mmmm = await getTempTextTable(session_id);
  console.log("sau add", mmmm.rows);

  return { total: imported };
}

async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllSePlanOrd,
  getAllPlanOrd,
  getAllSePlanOrdLink,
  getSePlanOrdByID,
  getShipSeq,
  getAllFieldDropdown,
  getCBM,
  getMoney,
  getTempTable,
  getTempTextTable,
  clearTempTable,
  clearTempTextTable,
  checkBoxItem,
  addSePlanOrd,
  editSePlanOrd,
  exportPDF,
  exportExcel,
  searchSePlanOrd,
  searchPD,
  searchSePlanOrdLink,
  deleteSePlanOrd,
  exportExcelCustomAcImp,
  confirmCheckBox,
  recreateTempTable,
  importExcel,
  exportExcelMaterial,
  exportExcelEndMaterial,
  exportExcelShipOrder,
  exportToPP026Excel,
  getAllSePlanOrdDetails,
  confirm,
  unconfirmItemsSePlanOrd,
  confirmItemsSePlanOrd,
};
