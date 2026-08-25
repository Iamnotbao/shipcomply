
const pool = require("../../config/db.js");

async function fetchFieldDropdown(
  factory_code,
  rule_no,
  language,
  page,
  limit,
  search,
) {
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    rule_no: rule_no || null,
    p_charset: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        code_no ILIKE :search OR
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  let sql;
  let countSql;

  sql = `
     SELECT 
     CODE_NO,
      CASE :p_charset WHEN 'T' THEN NAME_T WHEN 'S' THEN NAME_S ELSE NAME_E END AS CODE_NAME 
      FROM "Customs".cd_code 
      WHERE FACTORY_CODE=:factory_code
       AND RULE_NO=:rule_no
      AND ${permissionCondition}
      ${searchCondition}
      limit :limit
      offset :offset
      `;
  countSql = `
        SELECT COUNT(CODE_NO) as total
       FROM "Customs".cd_code 
      WHERE FACTORY_CODE=:factory_code
       AND RULE_NO=:rule_no
      AND ${permissionCondition}
      ${searchCondition}
      `;

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
        vend_no ILIKE :search OR
        fullnm_e ILIKE :search OR
        address_e ILIKE :search OR
        pay_cur ILIKE :search OR
        pay_no ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
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
       ORDER BY CUST_ID
      `;
    countSql = `
        SELECT COUNT(DISTINCT CUST_ID) as total
       from  "Customs".SE_CUST 
       where factory_code=:factory_code 
          AND ${permissionCondition}
          ${searchCondition}
      `;
  } else if (isStatus && field !== "vend_no") {
    sql = `
        SELECT DISTINCT ${field} as code_no
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND status = 7
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
          AND status = 7
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
      `;
  } else {
    sql = `
      SELECT code_no 
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
      LIMIT :limit
      OFFSET :offset
    `;

    countSql = `
      SELECT COUNT(*) as total
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
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
module.exports = {
  fetchFieldDropdown,
  fetchFieldByVendNo,
};
