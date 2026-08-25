const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function fetchCustDataDropdown(
  factory_code,
  field = null,
  language,
  page,
  limit,
  search,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: language,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        cust_id ILIKE :search OR
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  let sql;
  let countSql;
  if (field !== "cust_id_1") {
    sql = `
      SELECT 
      CUST_ID,
      COLUMN1 AS CUST_NO,
      CASE :p_charset 
    WHEN 'L' THEN NAME_J_S
    WHEN 'T' THEN NAME_J_T
    WHEN 'E' THEN NAME_J_E
  END AS STATUS
      FROM "Customs".SE_CUST 
      WHERE ${permissionCondition} 
      ${statusCondition}
      ORDER BY CUST_ID
      limit :limit offset :offset
      `;
    countSql = `
        SELECT COUNT(CUST_ID) as total
        FROM "Customs".SE_CUST
       WHERE 
        ${permissionCondition} 
         ${statusCondition}
        ${searchCondition}
      `;
  } else {
    sql = `
      SELECT 
      M.CUST_ID,
      M.COLUMN1 AS CUST_NO,
      CASE :p_charset 
    WHEN 'L' THEN NAME_J_S
    WHEN 'T' THEN NAME_J_T
    WHEN 'E' THEN NAME_J_E
  END AS STATUS
      FROM "Customs".SE_CUST M,
    "Customs".AC_CO_M D 
    WHERE M.FACTORY_CODE=:factory_code AND  M.STATUS=7 AND  M.FACTORY_CODE = D.FACTORY_CODE AND  M.CUST_ID = D.CUST_ID
       ${searchCondition} 
      ORDER BY M.CUST_ID
      limit :limit offset :offset
      `;
    countSql = `
        SELECT COUNT(M.CUST_ID) as total
      FROM "Customs".SE_CUST M,
    "Customs".AC_CO_M D WHERE M.FACTORY_CODE=:factory_code AND  M.STATUS=7 AND  M.FACTORY_CODE = D.FACTORY_CODE AND  M.CUST_ID = D.CUST_ID
       ${searchCondition} 
      `;
  }
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const totalResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const total = parseInt(totalResult[0]?.total || 0);
    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in fetchFieldDropdown:", error);
    throw error;
  }
}
async function fetchFieldByVendNo(
  factory_code,
  field = null,
  category_code,
  vend_no,
  language,
  page,
  limit,
  search,
  isStatus = true,
) {
  const charset = {
    en: "E",
    zh: "T",
    vi: "L",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    category_code: category_code,
    vend_no: vend_no || null,
    language: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        cust_id ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  let sql;
  let countSql;
  if (field === "vend_no") {
    sql = `
       select CUST_ID, 
       CASE :language
       WHEN 'T' THEN NAME_Q_T 
       WHEN 'E' THEN NAME_Q_E 
       ELSE NAME_Q_S
       END AS CUST_NAME,
       addr_e as ADDRESS_E,
       pay_curr as PAY_CUR,
       pay_no as PAY_NO
       from  "Customs".SE_CUST 
       where factory_code=:factory_code 
       and cust_id=:vend_no
       ${statusCondition}
       ORDER BY CUST_ID
      `;
    countSql = `
        SELECT COUNT(DISTINCT CUST_ID) as total
       from  "Customs".SE_CUST 
       where factory_code=:factory_code 
        and cust_id=:vend_no
          AND ${permissionCondition}
          ${statusCondition}
          ${searchCondition}
      `;
  } else if (isStatus && field !== "vend_no") {
    sql = `
        SELECT DISTINCT ${field} as code_no
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
           ${statusCondition}
          AND ${permissionCondition}
          ${searchCondition}
        ORDER BY ${field} ASC
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(DISTINCT ${field}) as total
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
         ${statusCondition}
          AND ${permissionCondition}
          ${searchCondition}
      `;
  } else if (!isStatus && field !== "vend_no") {
    sql = `
        SELECT DISTINCT ${field} as code_no
        FROM "Customs".po_vender_m
        WHERE 
       ${permissionCondition}
        AND factory_code = :factory_code
        AND vend_no = :vend_no
        ${searchCondition}
          ${statusCondition}
        ORDER BY ${field} ASC
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(DISTINCT ${field}) as total
        FROM "Customs".po_vender_m
         WHERE 
       ${permissionCondition}
        AND factory_code =:factory_code
        AND vend_no = :vend_no
        ${searchCondition}
          ${statusCondition}
      `;
  } else {
    sql = `
      SELECT code_no 
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
        ${statusCondition}
      LIMIT :limit
      OFFSET :offset
    `;

    countSql = `
      SELECT COUNT(*) as total
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
              ${statusCondition}
    `;
  }

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const totalResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const total = parseInt(totalResult[0]?.total || 0);
    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in fetchFieldByPoVenderM:", error);
    throw error;
  }
}
async function fetchFieldDropdown(
  factory_code,
  field = null,
  language,
  page,
  limit,
  search,
  extraField,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    language: language,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND ${field} ILIKE :search
    `;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  if (extraField && extraField !== "undefined" && extraField !== "null") {
    permissionCondition = `${permissionCondition} AND se_id = :extraField`;
    replacements.extraField = extraField;
  }

  let sql;
  let countSql;

  if (field) {
    sql = `
    SELECT ${field},
    COLUMN1 AS CUST_NO,
   CASE :language 
   when 'T' then name_j_t 
   when 'E' then name_j_e 
   else name_j_s 
   end as CUST_NAME
    FROM   "Customs".SE_CUST 
    WHERE ${permissionCondition} 
   ${statusCondition}
        ${searchCondition}
      ORDER BY ${field}
      LIMIT :limit
      OFFSET :offset
    `;

    countSql = `
     SELECT ${field},
    COLUMN1 AS CUST_NO,
   CASE :language 
   when 'T' then name_j_t 
   when 'E' then name_j_e 
   else name_j_s 
   end as CUST_NAME
    FROM   "Customs".SE_CUST 
    WHERE ${permissionCondition} 
   ${statusCondition}
    ${searchCondition}
    `;
  }

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const totalResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(totalResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in fetchFieldDropdown:", error);
    throw error;
  }
}
module.exports = {
  fetchCustDataDropdown,
  fetchFieldByVendNo,
  fetchFieldDropdown,
};
