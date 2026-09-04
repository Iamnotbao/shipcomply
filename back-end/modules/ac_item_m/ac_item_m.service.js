const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acItemMRepository = require("./ac_item_m.repository");
const acItemRefRepository = require("../ac_item_ref/ac_item_ref.service");
const { readExcel } = require("../../utils/importExcel");
const AC_ITEM_M = require("./ac_item_m.model");
const AC_ITEM_REF = require("../ac_item_ref/ac_item_ref.model");
const mmItemService = require("../mm_item/mm_item.service");
const pool = require("../../config/db");
const { CHUNK_SIZE } = require("../../constants");
const { Op, QueryTypes } = require("sequelize");

const STATUS_NEW = 1;

async function getAllAcIM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acItemMRepository.listAllIM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAcIMByID(factory_code, item_acno) {
  return await acItemMRepository.getByID(factory_code, item_acno);
}
async function getAllACIMByItemAcno(item_acno) {
  return await acItemMRepository.getAllACIMByIA(item_acno);
}
async function fetchGroupFieldDrop(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_itemno,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await acItemMRepository.fetchGroupFieldDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_itemno,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}

async function fetchFieldDropDown(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  field = null,
  page,
  limit,
  search,
  isStatus = true,
) {
  return await acItemMRepository.fetchFieldDropDown(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  field = null,
  page,
  limit,
  search,
  isStatus = true,
  );
}

async function fetchFieldWithFunction(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_itemno,
  type,
) {
  return await acItemMRepository.fetchFieldWithFunction(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    ac_itemno,
    type,
  );
}

async function addAcIM(
  factory_code,
  user_code,
  department_code,
  query_level,
  acIM,
  pageSize,
  t,
) {
  try {
    const existIM = await getAcIMByID(acIM.factory_code, acIM.item_acno);
    if (existIM) {
      const message =
        "AC Item M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acItemMRepository.add(
      factory_code,
      user_code,
      department_code,
      query_level,
      acIM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from ac item m service: ", error);
  }
}
async function editAcIM(
  factory_code,
  user_code,
  department_code,
  query_level,
  item_acno,
  acIM,
  pageSize,
  t,
) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acItemMRepository.edit(
      factory_code,
      user_code,
      department_code,
      query_level,
      existIM,
      acIM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcImp(factory_code, item_acno, t) {
  try {
    const existIM = await getAcIMByID(factory_code, item_acno);
    if (!existIM) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await acItemMRepository.deleteIM(existIM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcIM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acIMFound = await acItemMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acIMFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const data = await acItemRefRepository.getAllWithItemAcno(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const plainData = data.map((item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const flattened = { ...plain };
      if (plain.ITEM_ACNO) {
        flattened.item_acname_t = plain.ITEM_ACNO.item_acname_t || "";
        flattened.item_acname_e = plain.ITEM_ACNO.item_acname_e || "";
        flattened.item_acname_l = plain.ITEM_ACNO.item_acname_l || "";
        flattened.category_status = plain.ITEM_ACNO.status || "";
        delete flattened.ITEM_ACNO;
      }
      return flattened;
    });
    return await generateExcel(plainData, "AC_ITEM_M");
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
async function exportExcelAcIM(data, sheetName = "AC_ITEM_M") {
  return await generateExcel(data, sheetName);
}
// async function exportExcelMaterialAcImp(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomAcImp(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
async function importExcel(factory_code, user_code, fileBuffer) {
  const fields = [
    "item_acno",
    "item_acname_e",
    "item_acname_l",
    "item_acname_t",
    "ac_item",
    "unit",
    "tax_per",
    "loss_per",
    "ac_type",
    "item_no",
    "formula",
  ];

  const allRows = readExcel(fileBuffer, fields);
  const rowsData = allRows.slice(1);

  if (!rowsData?.length) {
    return { total: 0, masters: 0, details: 0 };
  }

  // ======= BULK VALIDATE: 1 query =======
    // ======= BULK VALIDATE: 1 query =======
  const allAcnos = [
    ...new Set(rowsData.map((r) => String(r.item_acno)).filter(Boolean)),
  ];

  const existingItems = await AC_ITEM_M.findAll({
    where: { factory_code, item_acno: { [Op.in]: allAcnos } },
    attributes: ["item_acno"],
    raw: true,
  });
  const existingSet = new Set(existingItems.map((i) => i.item_acno));

  // ======= CHỈ ĐÁNH DẤU ĐỂ BÁO CÁO, KHÔNG LOẠI TRỪ NỮA =======
  const overwrittenRows = [];
  rowsData.forEach((row, index) => {
    if (existingSet.has(String(row.item_acno))) {
      overwrittenRows.push({
        row: index + 1,
        item_acno: row.item_acno,
        item_no: row.item_no,
        reason: "Item already exists — will be overwritten",
      });
    }
  });

  const validRows = rowsData;

  if (!validRows.length) {
   return {
    success: true,
    total: rowsData.length,
    masters: importedMasters,
    details: importedDetails,
    overwrittenRows,
    totalOverwrittenRows: overwrittenRows.length,
  };
  }

  // ======= BULK LOOKUP item_unit TỪ MM_ITEM (theo item_no + org_id) =======
  const detailItemNos = [
    ...new Set(validRows.map((r) => String(r.item_no ?? "")).filter(Boolean)),
  ];

  const itemUnitMap = new Map();
  if (detailItemNos.length) {
    const mmItems = await pool.query(
      `SELECT item_no, unit FROM "public".mm_item WHERE org_id = :factory_code AND item_no IN (:itemNos)`,
      {
        replacements: { factory_code, itemNos: detailItemNos },
        type: QueryTypes.SELECT,
      },
    );
    mmItems.forEach((r) => {
      itemUnitMap.set(String(r.item_no), r.unit);
    });
  }

  // ======= GROUP MASTER / DETAIL =======
  const masterMap = new Map();

  for (const row of validRows) {
    const key = `${factory_code}-${row.item_acno}`;
    if (!masterMap.has(key)) {
      masterMap.set(key, {
        master: {
          factory_code,
          item_acno: String(row.item_acno),
          item_acname_e: row.item_acname_e ?? null,
          item_acname_l: row.item_acname_l ?? null,
          item_acname_t: row.item_acname_t ?? null,
          ac_item: row.ac_item ?? null,
          unit: row.unit ?? null,
          tax_per: row.tax_per ?? null,
          loss_per: row.loss_per ?? null,
          ac_type: row.ac_type ?? null,
          status: STATUS_NEW,
          grt_user: user_code ?? null,
          grt_dept: null,
          grt_date: new Date(),
        },
        details: [],
      });
    }

    if (row.item_no) {
      const mappedUnit = itemUnitMap.get(String(row.item_no));
      console.log("e");
      
      masterMap.get(key).details.push({
        factory_code,
        item_acno: String(row.item_acno),
        item_no: String(row.item_no),
        item_unit: mappedUnit ?? mappedUnit ?? null,
        formula: row.formula ? parseInt(row.formula) : null,
        status: STATUS_NEW,
        grt_user: user_code ?? null,
        grt_dept: null,
        grt_date: new Date(),
      });
    }
  }

  const allMasters = [...masterMap.values()].map((m) => m.master);
  const allDetails = [...masterMap.values()].flatMap((m) => m.details);
  const masterAcnos = allMasters.map((m) => m.item_acno);

  

  let importedMasters = 0;
  let importedDetails = 0;

  // ======= BULK UPSERT TRONG TRANSACTION =======
  await pool.transaction(async (t) => {
    // Upsert master theo chunk
    for (let i = 0; i < allMasters.length; i += CHUNK_SIZE) {
      const chunk = allMasters.slice(i, i + CHUNK_SIZE);
      await AC_ITEM_M.bulkCreate(chunk, {
        updateOnDuplicate: [
          "item_acname_e",
          "item_acname_l",
          "item_acname_t",
          "ac_item",
          "unit",
          "tax_per",
          "loss_per",
          "ac_type",
        ],
        transaction: t,
      });
      importedMasters += chunk.length;
    }

    // Xóa detail cũ: 1 query
    await AC_ITEM_REF.destroy({
      where: { factory_code, item_acno: { [Op.in]: masterAcnos } },
      transaction: t,
    });

    // Insert detail theo chunk
    for (let i = 0; i < allDetails.length; i += CHUNK_SIZE) {
      const chunk = allDetails.slice(i, i + CHUNK_SIZE);
      await AC_ITEM_REF.bulkCreate(chunk, { transaction: t });
      importedDetails += chunk.length;
    }
  });

  return {
    success: true,
    total: rowsData.length,
    masters: importedMasters,
    details: importedDetails,
    overwrittenRows,
    totalOverwrittenRows: overwrittenRows.length,
  };
}
module.exports = {
  getAllAcIM,
  getAcIMByID,
  getAllACIMByItemAcno,
  fetchGroupFieldDrop,
  fetchFieldWithFunction,
  fetchFieldDropDown,
  addAcIM,
  editAcIM,
  exportPDFAcIM,
  exportExcelAcIM,
  searchAcIM,
  deleteAcImp,
  importExcel,
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
