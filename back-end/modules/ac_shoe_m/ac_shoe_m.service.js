const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { readExcel } = require("../../utils/importExcel");
const AC_SHOE_REF = require("../ac_shoe_ref/ac_shoe_ref.model");
const AC_SHOE_M = require("./ac_shoe_m.model");
const acShoeMRepository = require("./ac_shoe_m.repository");
const acShoeRefService = require("../ac_shoe_ref/ac_shoe_ref.service");
const pool = require("../../config/db");             
const { CHUNK_SIZE } = require("../../constants");     
const { Op } = require("sequelize");

const STATUS_NEW = 1;                                

async function getAllAcShoeM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acShoeMRepository.listAllSM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAllAcShoeMWithProdRef(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acShoeMRepository.listAllSMWithProdRef(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getAcItemnoDropdown(
  factory_code,
  language,
  page,
  limit,
  search,
) {
  return await acShoeMRepository.listAcItemnoDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
}
async function getShoeDropdown(factory_code, language, page, limit, search) {
  return await acShoeMRepository.listShoeDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
}
async function getAcShoeMByID(factory_code, customs_shoe_id) {
  return await acShoeMRepository.getByID(factory_code, customs_shoe_id);
}

async function getAcShoeMBySize(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acShoeMRepository.getBySize(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function linktoBom(
  factory_code,
  user_code,
  department_code,
  query_level,
  ip,
  customs_shoe_id,
  ac_code,
  prod_no,
  date_time,
) {
  return await acShoeMRepository.linkBom(
    factory_code,
    user_code,
    department_code,
    query_level,
    ip,
    customs_shoe_id,
    ac_code,
    prod_no,
    date_time,
  );
}
async function addAcShoeM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acShoeM,
  pageSize,
  t,
) {
  try {
    const existASM = await getAcShoeMByID(
      acShoeM.factory_code,
      acShoeM.customs_shoe_id,
    );
    if (existASM) {
      const message =
        "AC Shoe M is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await acShoeMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acShoeM,
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
async function editAcShoeM(
  factory_code,
  department_code,
  user_code,
  query_level,
  customs_shoe_id,
  acShoeM,
  pageSize,
  t,
) {
  try {
    const existASM = await getAcShoeMByID(factory_code, customs_shoe_id);
    if (!existASM) {
      console.log("AC Shoe M is not exist !");
      return null;
    }
    const result = await acShoeMRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existASM,
      acShoeM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from AC Shoe M service", error);
  }
}
async function deleteAcShoeM(factory_code, customs_shoe_id, t) {
  try {
    const existIM = await getAcShoeMByID(factory_code, customs_shoe_id);
    if (!existIM) {
      console.log("AC Shoe M is not exist !");
      return null;
    }
    const result = await acShoeMRepository.deleteASM(existIM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcShoeM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acIMFound = await acShoeMRepository.search(
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
async function exportExcelAcShoeM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getAllAcShoeMWithProdRef(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  console.log("reeceive data", data);

  const plainData = data.map((item) => {
    const plain = item.get ? item.get({ plain: true }) : item;
    const flattened = { ...plain };

    if (plain.PROD) {
      flattened.start_size = plain.PROD.start_size || "";
      flattened.s_seq = plain.PROD.s_seq || "";
      flattened.end_size = plain.PROD.end_size || "";
      flattened.e_seq = plain.PROD.e_seq || "";
      flattened.bang_ke_size = plain.PROD.bang_ke_size || "";
      flattened.pt_per = plain.PROD.pt_per || "";
      flattened.note = plain.PROD.note || "";
      delete flattened.PROD;
    }
    if (plain.ACSHOEREF) {
      flattened.prod_no = plain.ACSHOEREF.prod_no || "";
      flattened.prod_unit = plain.ACSHOEREF.prod_unit || "";
      flattened.is_valid = plain.ACSHOEREF.is_valid || "";
      flattened.valid_date = plain.ACSHOEREF.valid_date || "";
      flattened.unval_date = plain.ACSHOEREF.unval_date || "";
      delete flattened.ACSHOEREF;
    }
    return flattened;
  });
  return await generateExcel(plainData, "AC_SHOE_M");
}
async function importExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  session_id,
  fileBuffer,
) {
  const fields = [
    "customs_shoe_id",
    "customs_shoe_name_l",
    "customs_shoe_name_t",
    "customs_shoe_name_e",
    "customs_tariff",
    "size_type",
    "unit",
    "prod_no",
    "prod_unit",
    "is_valid",
    "valid_date",
    "unval_date",
  ];

  const allRows = readExcel(fileBuffer, fields);   
  const rowsData = allRows.slice(1);               

  if (!rowsData?.length) {
    return { total: 0, masters: 0, details: 0 };
  }

  // ======= BULK VALIDATE: 1 query =======
  const allShoeIds = [
    ...new Set(
      rowsData.map((r) => String(r.customs_shoe_id)).filter(Boolean),
    ),
  ];

  const existingItems = await AC_SHOE_M.findAll({
    where: { factory_code, customs_shoe_id: { [Op.in]: allShoeIds } },
    attributes: ["customs_shoe_id"],
    raw: true,
  });
  const existingSet = new Set(
    existingItems.map((i) => String(i.customs_shoe_id)),
  );

  // ======= PHÂN LOẠI VALID / INVALID =======
  const invalidRows = [];
  const validRows = [];

  rowsData.forEach((row, index) => {
    if (existingSet.has(String(row.customs_shoe_id))) {
      invalidRows.push({
        row: index + 1,
        customs_shoe_id: row.customs_shoe_id,
        prod_no: row.prod_no,
        reason: "The item already exists in the system",
      });
    } else {
      validRows.push(row);
    }
  });

  if (!validRows.length) {
    return {
      success: true,
      total: rowsData.length,
      masters: 0,
      details: 0,
      invalidRows,
      totalInvalidRows: invalidRows.length,
    };
  }

  // ======= GROUP MASTER / DETAIL =======
  const masterMap = new Map();

  for (const row of validRows) {
    const key = `${factory_code}-${row.customs_shoe_id}`;
    if (!masterMap.has(key)) {
      masterMap.set(key, {
        master: {
          factory_code,
          customs_shoe_id: String(row.customs_shoe_id),
          customs_shoe_name_l: row.customs_shoe_name_l ?? null,
          customs_shoe_name_t: row.customs_shoe_name_t ?? null,
          customs_shoe_name_e: row.customs_shoe_name_e ?? null,
          customs_tariff: row.customs_tariff ?? null,
          size_type: row.size_type ?? null,
          unit: row.unit ?? null,
          status: STATUS_NEW,
          grt_user: user_code ?? null,
          grt_dept: department_code,
          grt_date: new Date(),
        },
        details: [],
      });
    }

    if (row.prod_no) {
      masterMap.get(key).details.push({
        factory_code,
        customs_shoe_id: String(row.customs_shoe_id),
        prod_no: String(row.prod_no),
        prod_unit: row.prod_unit ?? null,
        is_valid: "Y",
        valid_date: row.valid_date ? new Date(row.valid_date) : null,
        unval_date: row.unval_date ? new Date(row.unval_date) : null,
        status: STATUS_NEW,
        grt_user: user_code ?? null,
        grt_dept: department_code,
        grt_date: new Date(),
      });
    }
  }

  const allMasters = [...masterMap.values()].map((m) => m.master);
  const allDetails = [...masterMap.values()].flatMap((m) => m.details);
  const masterShoeIds = allMasters.map((m) => m.customs_shoe_id);

  let importedMasters = 0;
  let importedDetails = 0;

  // ======= BULK UPSERT TRONG TRANSACTION =======
  await pool.transaction(async (t) => {
    // Upsert master theo chunk
    for (let i = 0; i < allMasters.length; i += CHUNK_SIZE) {
      const chunk = allMasters.slice(i, i + CHUNK_SIZE);
      await AC_SHOE_M.bulkCreate(chunk, {
        updateOnDuplicate: [
          "customs_shoe_name_l",
          "customs_shoe_name_t",
          "customs_shoe_name_e",
          "customs_tariff",
          "size_type",
          "unit",
        ],
        transaction: t,
      });
      importedMasters += chunk.length;
    }

    // Xóa detail cũ: 1 query
    await AC_SHOE_REF.destroy({
      where: {
        factory_code,
        customs_shoe_id: { [Op.in]: masterShoeIds },
      },
      transaction: t,
    });

    // Insert detail theo chunk
    for (let i = 0; i < allDetails.length; i += CHUNK_SIZE) {
      const chunk = allDetails.slice(i, i + CHUNK_SIZE);
      await AC_SHOE_REF.bulkCreate(chunk, { transaction: t });
      importedDetails += chunk.length;
    }
  });

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
  getAllAcShoeM,
  getAllAcShoeMWithProdRef,
  linktoBom,
  getAcShoeMByID,
  getAcShoeMBySize,
  addAcShoeM,
  editAcShoeM,
  exportExcelAcShoeM,
  searchAcShoeM,
  deleteAcShoeM,
  getAcItemnoDropdown,
  getShoeDropdown,
  importExcel,
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
