
const pool = require("../../config/db.js");

async function listOfVwAcIssueT(
   factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    language,
    limit,
    offset,
) {
  try {
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    const replacements = {
      factory_code: factory_code,
      conf_seq: conf_seq,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };
    let permissionCondition = "1=1";
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "T.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "T.grt_dept = :permission_dept AND T.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "T.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      T.factory_code,
      T.conf_seq,
        T.matd_no,
        "Customs".GF_AC_ITEMNAME(T.FACTORY_CODE, T.matd_no, :p_charset) AS ac_itemname,
        "Customs".GF_CODE_NAME(T.FACTORY_CODE, '1105', "Customs".GF_AC_ITEMUNIT(T.FACTORY_CODE, T.matd_no), :p_charset) AS unit_name,
        (
          SELECT SUM(over_qty)
          FROM "Customs".vw_ac_chg
          WHERE factory_code = T.factory_code
            AND ac_itemno = T.matd_no
            AND ac_chgs IS NOT NULL
            AND COALESCE(over_qty, 0) > 0
        ) AS left_qty,
        (
          SELECT SUM(D.issue_qty)
          FROM "Customs".ac_issue_m_t M
          JOIN "Customs".ac_issue_matd_t D
            ON M.factory_code = D.factory_code
            AND M.conf_seq = D.conf_seq
          WHERE M.factory_code = T.factory_code
            AND M.conf_seq < T.conf_seq
            AND M.status = 7
            AND D.matd_no = T.matd_no
            AND COALESCE(D.issue_qty, 0) != 0
            AND D.req_issue = 'Y'
        ) AS left_issue,
        T.req_qty,
        T.issue_qty
      FROM "Customs".vw_ac_issue_t T
      WHERE
      ${permissionCondition}
        AND T.conf_seq = :conf_seq
      ORDER BY T.matd_no ASC
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
      rows: actualRows,
      count: null,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error fetching VW_AC_ISSUE_T:", error);
    throw error;
  }
}
async function search(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
) {
  try {
    let permissionCondition = "1=1";
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code || null,
      conf_seq: filters.conf_seq || null,
      matd_no: filters.matd_no || null,
      p_charset: charset[filters.language] || "E",
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "grt_dept = :permission_dept AND factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
        T.matd_no,
        "Customs".GF_AC_ITEMNAME(T.FACTORY_CODE, T.matd_no, :p_charset) AS ac_itemname,
        "Customs".GF_CODE_NAME(T.FACTORY_CODE, '1105', "Customs".GF_AC_ITEMUNIT(T.FACTORY_CODE, T.matd_no), :p_charset) AS unit_name,
        (
          SELECT SUM(over_qty)
          FROM "Customs".vw_ac_chg
          WHERE factory_code = T.factory_code
            AND ac_itemno = T.matd_no
            AND ac_chgs IS NOT NULL
            AND COALESCE(over_qty, 0) > 0
        ) AS left_qty,
        (
          SELECT SUM(D.issue_qty)
          FROM "Customs".ac_issue_m_t M
          JOIN "Customs".ac_issue_matd_t D
            ON M.factory_code = D.factory_code
            AND M.conf_seq = D.conf_seq
          WHERE M.factory_code = T.factory_code
            AND M.conf_seq < T.conf_seq
            AND M.status = 7
            AND D.matd_no = T.matd_no
            AND COALESCE(D.issue_qty, 0) != 0
            AND D.req_issue = 'Y'
        ) AS left_issue,
        T.req_qty,
        T.issue_qty
      FROM "Customs".vw_ac_issue_t T
      WHERE
        ${permissionCondition} AND
        T.factory_code = :factory_code AND
        (:conf_seq IS NULL OR T.conf_seq = :conf_seq) AND
        (:matd_no IS NULL OR T.matd_no LIKE '%' || :matd_no || '%')
      ORDER BY T.matd_no ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return { rows };
  } catch (error) {
    console.error("Error searching VW_AC_ISSUE_T:", error);
    throw error;
  }
}
module.exports = {
  listOfVwAcIssueT,
  search,
};
