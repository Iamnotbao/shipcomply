const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { readExcel } = require("../../utils/importExcel");
const AC_SHOE_REF = require("../ac_shoe_ref/ac_shoe_ref.model");
const AC_SHOE_M = require("./ac_shoe_m.model");
const acShoeMRepository = require("./ac_shoe_m.repository");

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
async function importExcel(factory_code, user_code, session_id, fileBuffer) {
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

  const rowsData = readExcel(fileBuffer, fields).filter(
    (row) => !fields.some((f) => String(row[f] ?? "") === f),
  );

  if (!rowsData || rowsData.length === 0) {
    return { total: 0, masters: 0, details: 0 };
  }

  const masterMap = new Map();

  for (const row of rowsData) {
    const key = `${factory_code}-${row.customs_shoe_id}`;

    if (!masterMap.has(key)) {
      masterMap.set(key, {
        master: {
          factory_code:factory_code ?? null,
          customs_shoe_id: String(row.customs_shoe_id) ?? null,
          customs_shoe_name_l: row.customs_shoe_name_l ?? null,
          customs_shoe_name_t: row.customs_shoe_name_t ?? null,
          customs_shoe_name_e: row.customs_shoe_name_e ?? null,
          customs_tariff: row.customs_tariff ?? null,
          size_type: row.size_type ?? null,
          unit: row.unit ?? null,
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
    if (row.prod_no) {

      
      masterMap.get(key).details.push({
        factory_code: factory_code ?? null,
        customs_shoe_id: String(row.customs_shoe_id),
        prod_no: String(row.prod_no),
        prod_unit: row.prod_unit ?? null,
        is_valid: String(row.is_valid),
        valid_date: row.valid_date ? new Date(row.valid_date) : null,
        unval_date: row.unval_date ? new Date(row.unval_date) : null,
        grt_user: user_code ?? null,
        status: 1,
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
    await AC_SHOE_M.upsert(master);
    importedMasters++;

    // Xóa detail cũ của master này trước khi insert mới
    await AC_SHOE_REF.destroy({
      where: {
        factory_code: master.factory_code,
        customs_shoe_id: master.customs_shoe_id,
      },
    });
     console.log("check the details",details);
    // Insert detail mới
    for (const detail of details) {
      await AC_SHOE_REF.create(detail);
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
  importExcel
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
