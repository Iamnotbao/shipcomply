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
async function importExcel(factory_code, user_code, session_id, fileBuffer) {
  const fields = [
    "item_acno",
    "item_acname_e",
    "ac_item",
    "unit",
    "tax_per",
    "loss_per",
    "ac_type",
    "item_no",
    "item_unit",
    "formula",
  ];

  const rowsData = readExcel(fileBuffer, fields).filter(
    (row) => !fields.some((f) => String(row[f] ?? "") === f),
  );

  if (!rowsData || rowsData.length === 0) {
    return { total: 0, masters: 0, details: 0 };
  }

  // ======= GROUP MASTER =======
  // Gom các row cùng item_acno thành 1 master
  const masterMap = new Map();
  let invalidRows = [];
  for (const eachRow of rowsData) {
    const isValidRow = await mmItemService.checkValidData(row);
    if (!isValidRow) {
      invalidRows.push({
        item_no: row.item_no,
        item_acno: row.item_acno,
        reason:"The item is exist in the system",
      });
      continue;
    }
    const key = `${factory_code}-${row.item_acno}`;
    if (!masterMap.has(key)) {
      masterMap.set(key, {
        master: {
          factory_code: factory_code ?? null,
          item_acno: String(row.item_acno),
          item_acname_e: row.item_acname_e ?? null,
          item_acname_l: row.item_acname_l ?? null,
          item_acname_t: row.item_acname_t ?? null,
          ac_item: row.ac_item ?? null,
          unit: row.unit ?? null,
          tax_per: row.tax_per ?? null,
          loss_per: row.loss_per ?? null,
          ac_type: row.ac_type ?? null,
          status: 1,
          grt_user: user_code ?? null,
          grt_dept: null,
          grt_date: new Date(),
        },
        details: [],
      });
    }

    // ======= ADD DETAIL =======
    // Chỉ thêm detail nếu có item_no
    if (row.item_no) {
      masterMap.get(key).details.push({
        factory_code: factory_code ?? null,
        item_acno: String(row.item_acno),
        item_no: String(row.item_no),
        item_unit: row.item_unit ?? null,
        formula: row.formula ? parseInt(row.formula) : null,
        status: 1,
        grt_user: user_code ?? null,
        grt_dept: null,
        grt_date: new Date(),
      });
    }
  }

  let importedMasters = 0;
  let importedDetails = 0;

  // ======= UPSERT MASTER + DETAIL =======
  for (const { master, details } of masterMap.values()) {
    // Upsert AC_ITEM_M
    await AC_ITEM_M.upsert(master);
    importedMasters++;

    // Xóa detail cũ của master này trước khi insert mới
    await AC_ITEM_REF.destroy({
      where: {
        factory_code: master.factory_code,
        item_acno: master.item_acno,
      },
    });

    // Insert detail mới
    for (const detail of details) {
      await AC_ITEM_REF.create(detail);
      importedDetails++;
    }
  }

  console.log(
    ` Import done: ${importedMasters} masters, ${importedDetails} details`,
  );

  return {
    success: true,
    total: rowsData.length,
    masters: importedMasters,
    details: importedDetails,
    invalidRows,
    totalInvalidRows: invalidRows.length,
  };
}
module.exports = {
  getAllAcIM,
  getAcIMByID,
  getAllACIMByItemAcno,
  fetchGroupFieldDrop,
  fetchFieldWithFunction,
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
