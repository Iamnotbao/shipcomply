const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function fetchAllVwAcSum(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };
    // Permission logic
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "S.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "S.grt_dept = :permission_dept AND S.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "S.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      S.factory_code,
        S.ac_itemno,
        "Customs".GF_AC_ITEMNAME(S.factory_code, S.ac_itemno, :p_charset) AS ac_itemname,
        S.qty AS in_qty,
        (
          SELECT SUM(D.issue_qty)
          FROM "Customs".ac_issue_m_t C
          JOIN "Customs".ac_issue_matd_t D
            ON C.factory_code = D.factory_code
            AND C.conf_seq = D.conf_seq
          WHERE C.status = 9
            AND C.factory_code = S.factory_code
            AND D.matd_no = S.ac_itemno
        ) AS out_qty,
        COALESCE(S.qty, 0) - COALESCE(
          (
            SELECT SUM(D.issue_qty)
            FROM "Customs".ac_issue_m_t C
            JOIN "Customs".ac_issue_matd_t D
              ON C.factory_code = D.factory_code
              AND C.conf_seq = D.conf_seq
            WHERE C.status = 9
              AND C.factory_code = S.factory_code
              AND D.matd_no = S.ac_itemno
          ), 0
        ) AS left_qty,
        CASE S.stoc_type
          WHEN '1' THEN '1-非保稅'
          WHEN '2' THEN '2-保稅'
          WHEN '3' THEN '3-None'
          WHEN '4' THEN '4-VAT'
        END AS stoc_type
      FROM "Customs".vw_ac_sum S
      WHERE ${permissionCondition}
      ORDER BY S.ac_itemno ASC
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return {
      data: actualRows,
      hasMore,
    };
  } catch (error) {
    console.error("Error in fetchAllVwAcSum:", error);
    throw error;
  }
}
async function fetchAllVwAcSumDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
    };
    // Permission logic
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "S.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "S.grt_dept = :permission_dept AND S.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "S.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      S.factory_code,
        S.ac_itemno,
        "Customs".GF_AC_ITEMNAME(S.factory_code, S.ac_itemno, :p_charset) AS ac_itemname,
        S.qty AS in_qty,
        (
          SELECT SUM(D.issue_qty)
          FROM "Customs".ac_issue_m_t C
          JOIN "Customs".ac_issue_matd_t D
            ON C.factory_code = D.factory_code
            AND C.conf_seq = D.conf_seq
          WHERE C.status = 9
            AND C.factory_code = S.factory_code
            AND D.matd_no = S.ac_itemno
        ) AS out_qty,
        COALESCE(S.qty, 0) - COALESCE(
          (
            SELECT SUM(D.issue_qty)
            FROM "Customs".ac_issue_m_t C
            JOIN "Customs".ac_issue_matd_t D
              ON C.factory_code = D.factory_code
              AND C.conf_seq = D.conf_seq
            WHERE C.status = 9
              AND C.factory_code = S.factory_code
              AND D.matd_no = S.ac_itemno
          ), 0
        ) AS left_qty,
        CASE S.stoc_type
          WHEN '1' THEN '1-非保稅'
          WHEN '2' THEN '2-保稅'
          WHEN '3' THEN '3-None'
          WHEN '4' THEN '4-VAT'
        END AS stoc_type
      FROM "Customs".vw_ac_sum S
      WHERE ${permissionCondition}
      ORDER BY S.ac_itemno ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in fetchAllVwAcSum:", error);
    throw error;
  }
}
async function search(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
  language,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      ac_itemno: filters.ac_itemno || null,
      stoc_type: filters.stoc_type || null,
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };
    // Permission logic
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "S.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "S.grt_dept = :permission_dept AND S.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "S.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        S.ac_itemno,
        "Customs".GF_AC_ITEMNAME(S.factory_code, S.ac_itemno, :p_charset) AS ac_itemname,
        S.qty AS in_qty,
        (
          SELECT SUM(D.issue_qty)
          FROM "Customs".ac_issue_m_t C
          JOIN "Customs".ac_issue_matd_t D
            ON C.factory_code = D.factory_code
            AND C.conf_seq = D.conf_seq
          WHERE C.status = 9
            AND C.factory_code = S.factory_code
            AND D.matd_no = S.ac_itemno
        ) AS out_qty,
        COALESCE(S.qty, 0) - COALESCE(
          (
            SELECT SUM(D.issue_qty)
            FROM "Customs".ac_issue_m_t C
            JOIN "Customs".ac_issue_matd_t D
              ON C.factory_code = D.factory_code
              AND C.conf_seq = D.conf_seq
            WHERE C.status = 9
              AND C.factory_code = S.factory_code
              AND D.matd_no = S.ac_itemno
          ), 0
        ) AS left_qty,
        CASE S.stoc_type
          WHEN '1' THEN '1-非保稅'
          WHEN '2' THEN '2-保稅'
          WHEN '3' THEN '3-None'
          WHEN '4' THEN '4-VAT'
        END AS stoc_type
      FROM "Customs".vw_ac_sum S
      WHERE ${permissionCondition}
        AND (:ac_itemno IS NULL OR S.ac_itemno = :ac_itemno)
        AND (:stoc_type IS NULL OR S.stoc_type = :stoc_type)
      ORDER BY S.ac_itemno ASC
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    let total = null;
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    if (parseInt(offset) === 0) {
      const countQuery = `
            SELECT COUNT(*) as count
            FROM "Customs".vw_ac_sum S
           WHERE ${permissionCondition}
           AND (:ac_itemno IS NULL OR S.ac_itemno = :ac_itemno)
           AND (:stoc_type IS NULL OR S.stoc_type = :stoc_type)
          `;
      const countResult = await pool.query(countQuery, {
        replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = countResult[0]?.count;
    }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in searchVwAcSum:", error);
    throw error;
  }
}
module.exports = {
  fetchAllVwAcSum,
  fetchAllVwAcSumDetails,
  search,
};
