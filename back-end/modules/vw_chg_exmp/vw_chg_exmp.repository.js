
const pool = require("../../config/db.js");

async function getListOfVwChgExmp(
  factory_code,
  cont_no,
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
      cont_no: cont_no,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

    const sql = `
      SELECT 
        B.MIN_CONT,
        A.OUT_DATE,
        A.AC_CHGNO,
        A.SEQ,
        A.AC_NO,
        A.AC_ITEMNO,
        "Customs".GF_AC_ITEMNAME(A.FACTORY_CODE, A.AC_ITEMNO, :p_charset) AS AC_ITEMNAME,
        A.UNIT,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, '1108', A.UNIT, :p_charset) AS UNIT_NAME,
        A.QTY,
        A.MONEY
      FROM "Customs".VW_CHG_EXMP A
      LEFT JOIN "Customs".VW_CHG_EXP B 
        ON A.FACTORY_CODE = B.FACTORY_CODE
        AND A.AC_NO = B.AC_NO
        AND A.CONT_NO = B.CONT_NO
      WHERE 
        A.FACTORY_CODE = :factory_code
        AND A.CONT_NO = :cont_no
      ORDER BY A.AC_NO, A.OUT_DATE
      LIMIT :limit 
      OFFSET :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    
    let total = null;
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error fetching VW_CHG_EXMP:", error);
    throw error;
  }
}
async function getContractDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
) {
  try {
    console.log("Getting contract details", factory_code, filters);

    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      cont_no: filters.cont_no || null,
      status: filters.status || null,
      s_issuedate: filters.s_issued_date || null,
      e_issuedate: filters.e_issued_date || null,
      s_expiredate: filters.s_expire_date || null,
      e_expiredate: filters.e_expire_date || null,
      cont_category: filters.cont_category || null,
      seller: filters.seller || null,
      buyer: filters.buyer || null,
      p_charset: filters.p_charset || "UTF8",
    };

    // Permission logic
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "m.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "m.grt_dept = :permission_dept AND m.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "m.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
  SELECT 
    REPLACE(m.seller, ',', ' ') as seller,
    m.cont_no,
    m.issued_date,
    m.expire_date,
    d.goods_code,
    REPLACE("Customs".GF_AC_ITEMNAME(m.factory_code, d.goods_code, :p_charset), ',', '-') as goods_name,
    d.cont_qty
    -- u.ac_chgno,
    -- u.qty
  FROM "Customs".vw_cont_imp m
  INNER JOIN "Customs".ac_cont_d d 
    ON m.factory_code = d.factory_code 
    AND m.cont_no = d.cont_no
  -- LEFT JOIN "Customs".vw_cont_use u 
  --   ON d.factory_code = u.factory_code 
  --   AND d.cont_no = u.cont_no 
  --   AND d.goods_code = u.ac_itemno
  WHERE
    ${permissionCondition} AND
    m.factory_code = :factory_code AND
    (:cont_no IS NULL OR m.cont_no ILIKE :cont_no || '%') AND
    (m.status = :status OR :status IS NULL) AND
    (DATE_TRUNC('day', m.issued_date) >= DATE_TRUNC('day', :s_issuedate::timestamp) OR :s_issuedate IS NULL) AND
    (DATE_TRUNC('day', m.issued_date) <= DATE_TRUNC('day', :e_issuedate::timestamp) OR :e_issuedate IS NULL) AND
    (DATE_TRUNC('day', m.expire_date) >= DATE_TRUNC('day', :s_expiredate::timestamp) OR :s_expiredate IS NULL) AND
    (DATE_TRUNC('day', m.expire_date) <= DATE_TRUNC('day', :e_expiredate::timestamp) OR :e_expiredate IS NULL) AND
    (m.cont_category = :cont_category OR :cont_category IS NULL)
  ORDER BY m.cont_no, d.goods_code
`;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error fetching contract details:", error);
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
    let replacements = {
      factory_code: factory_code || null,
      cont_no: filters.cont_no || null,
      status: filters.status ?? null,
      s_issuedate: filters.s_issued_date || null,
      e_issuedate: filters.e_issued_date || null,
      s_expiredate: filters.s_expire_date|| null,
      e_expiredate: filters.e_expire_date|| null,
      cont_category: filters.cont_category || null,
      seller: filters.seller || null,
      buyer: filters.buyer || null,
      p_charset: filters.p_charset|| "UTF8",
    };

    // Xác định permission condition
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
        cont_no, 
        cont_category, 
        issued_date, 
        expire_date, 
        seller, 
        buyer, 
        sum_money, 
        currency,
        "Customs".GF_CODE_NAME(factory_code, 'CURR', currency, :p_charset) AS currency_name,
        status
      FROM "Customs".vw_cont_imp 
      WHERE
        ${permissionCondition} AND
        factory_code = :factory_code AND
        (:cont_no IS NULL OR cont_no ILIKE '%' || :cont_no || '%') AND
        (:status IS NULL OR status = :status) AND
        (:seller IS NULL OR seller ILIKE '%' || :seller || '%') AND
        (:buyer IS NULL OR buyer ILIKE '%' || :buyer || '%') AND
        (:cont_category IS NULL OR cont_category = :cont_category) AND
        (:s_issuedate IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::timestamp)) AND
        (:e_issuedate IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::timestamp)) AND
        (:s_expiredate IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::timestamp)) AND
        (:e_expiredate IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::timestamp))
      ORDER BY cont_no ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return { rows };
  } catch (error) {
    console.error("Error searching Contract Import:", error);
    throw error;
  }
}
module.exports = {
  getListOfVwChgExmp,
  search,
  getContractDetails,
};
