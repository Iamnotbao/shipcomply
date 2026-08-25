const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function fetchFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  field
) {
  let charset = {
    en: "E",
    zh: "T",
    vi: "L",
  };
  let replacements = {
    factory_code: factory_code,
    language: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    field: field || null,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        ac_itemno ILIKE :search OR
        ac_itemnm ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  let sql;
  let countSql;
  sql = `
        SELECT DISTINCT ON("${field?field:"ac_itemno"}")
        AC_ITEMNO,AC_CHGNO,AC_DATE,AC_NO,  
        "Customs".GF_AC_ITEMNAME(FACTORY_CODE,AC_ITEMNO,:language) AS ac_itemnm 
        FROM "Customs".VW_AC_CHG
        WHERE
        FACTORY_CODE = :factory_code
        ${searchCondition}
        order by "${field?field:"ac_itemno"}"
        limit :limit
        offset :offset
      `;
countSql = `
  SELECT COUNT(DISTINCT "${field ? field : "ac_itemno"}") as total
  FROM "Customs".VW_AC_CHG
  WHERE FACTORY_CODE = :factory_code 
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

module.exports = {
  fetchFieldDataDropdown,
};
