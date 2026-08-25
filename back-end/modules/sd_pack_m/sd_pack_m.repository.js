const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function fetchSeIdDataDropdown(
  factory_code,
  field = null,
  language,
  page,
  limit,
  search = "",
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    // p_charset: language,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        size_type ILIKE :search
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
  sql = `
   SELECT DISTINCT SE_ID,SE_VER,PACK_GU,SE_SEQ   
   FROM "pac".SD_PACK_M 
   WHERE  ORG_ID = :factory_code
   ORDER BY SE_ID,PACK_GU,SE_SEQ
   limit :limit 
   offset :offset
      `;
  countSql = `
  SELECT COUNT(*) as total
  FROM (
    SELECT DISTINCT SE_ID, SE_VER, PACK_GU, SE_SEQ
    FROM "pac".SD_PACK_M
    WHERE ORG_ID = :factory_code
    AND ${permissionCondition}
    ${statusCondition}
    ${searchCondition}
  ) sub
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
  fetchSeIdDataDropdown,
};
