const pool = require("../../config/db.js");

async function getListOfASB(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  isAll = false,
) {
  try {
    let conditions = [];
    let replacements = {
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        conditions.push(`factory_code = :factory_code`);
        replacements.factory_code = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        conditions.push(`grt_dept = :grt_dept`);
        conditions.push(`factory_code = :factory_code`);
        replacements.grt_dept = department_code;
        replacements.factory_code = factory_code;
      } else if (query_level === "3" && user_code) {
        conditions.push(`grt_user = :grt_user`);
        replacements.grt_user = user_code;
      }
    }
    const whereSQL =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await pool.query(
      `SELECT * FROM "Customs".vw_ac_shoebom 
       ${whereSQL} 
       ORDER BY factory_code, customs_shoe_id ASC 
      ${isAll ? "" : "LIMIT :limit OFFSET :offset"}`,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
      },
    );
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    let total = null;

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error fetching ASB list:", error);
    throw error;
  }
}
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    let conditions = [];
    let replacements = {
      limit: parseInt(limit) ?? 10,
      offset: parseInt(offset) ?? 0,
    };
    let paramIndex = 0;
    if (query && query.search && typeof query.search === "object") {
      const allowedFields = [
        "prod_acno",
        "item_acno",
        "customs_shoe_id",
        "size_type",
      ];
      Object.keys(query.search).forEach((key) => {
        if (allowedFields.includes(key) && query.search[key]) {
          const value = query.search[key];
          if (typeof value === "string") {
            conditions.push(`${key} LIKE :param${paramIndex}`);
            replacements[`param${paramIndex}`] = `%${value}%`;
          } else if (typeof value === "number") {
            conditions.push(`${key} = :param${paramIndex}`);
            replacements[`param${paramIndex}`] = value;
          }
          paramIndex++;
        }
      });
    }
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        conditions.push(`factory_code = :factory_code`);
        replacements.factory_code = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        conditions.push(`grt_dept = :grt_dept`);
        conditions.push(`factory_code = :factory_code`);
        replacements.grt_dept = department_code;
        replacements.factory_code = factory_code;
      } else if (query_level === "3") {
        conditions.push(`grt_user = :grt_user`);
        replacements.grt_user = user_code;
      }
    }
    const whereSQL =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await pool.query(
      `SELECT * FROM "Customs".vw_ac_shoebom 
       ${whereSQL} 
       ORDER BY factory_code, customs_shoe_id ASC
       LIMIT :limit OFFSET :offset`,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
      },
    );
    const limitInt = parseInt(limit) || 10;
    const hasMore = rows.length > limitInt;
    const actualRows = hasMore ? rows.slice(0, limitInt) : rows;

    let total = null;
    if (parseInt(offset) === 0) {
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM "Customs".vw_ac_shoebom ${whereSQL}`,
        {
          replacements,
          type: pool.QueryTypes.SELECT,
        },
      );
      total = parseInt(countResult[0]?.total) || 0;
    }

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  getListOfASB,
  search,
};
