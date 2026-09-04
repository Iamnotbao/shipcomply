const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_PROC_M = require("./ac_proc_m.model.js");
const { error } = require("./ac_proc_m.create.dto.js");

async function listAllAcProcM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_PROC_M.findAll({
      order: [["ac_no", "ASC"]],
      limit: limit + 1,
      offset: offset,
      logging: console.log,
    });
  }
  const charset = {
    en: "E",
    zh: "T",
    vi: "L",
  };
  let permissionCondition = "1=1";

  let replacements = {
    factory_code: factory_code || null,
    p_charset: charset[language] || "E",
    limit: parseInt(limit) + 1,
    offset: parseInt(offset),
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
  const transaction = await pool.transaction();
  const sql = `SELECT 
  FACTORY_CODE,
  AC_NO,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        '1105',
        IN_CURR,
        :p_charset
    ) AS CURR_NAME,
    SUM_MONEY,
    TAX,
    AC_DATE,
    AC_CHGS,
    AC_CHGENO,
    AC_CHGN,
    AC_CHGO,
    COL2,
    status,
    d_type,
    case
        D_TYPE
        when '3' then '3 - Import VN'
        when '6' then '6 - 其它Others'
    end as d_type_name,
    COL1,
    REC_PERSON,
    OUT_ORG,
    AC_OUTER,
    REC_ADDR,
    JS_NO,
    JS_DATE,
    SOSO,
    EX_USER,
    OUT_CONT,
    OUT_DATE,
    OUT_VDATE,
    stoc_type,
    case
        STOC_TYPE
        when '1' then '1 - 非保稅 '
        when '2' then '2 - 保稅'
        when '3' then '3 - NONE'
        when '4' then '4 - VAT'
        when '6' then '6 - 其它Others'
    end as stoc_type_name,
    IN_CONT,
    MIN_CONT,
    IN_DATE,
    (
        SELECT ISSUED_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = FACTORY_CODE
            AND CONT_NO = IN_CONT
    ) AS STA_DATE,
    (
        SELECT EXPIRE_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = FACTORY_CODE
            AND CONT_NO = IN_CONT
    ) AS END_DATE,
    REC_PERSON,
    (
        SELECT S_ADDR
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = FACTORY_CODE
            AND CONT_NO = IN_CONT
    ) AS OUTER,
    IN_SETTLE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'AYRULE',
        IN_SETTLE,
        :p_charset
    ) AS IN_SET,
    OUT_TYPE,
   "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'ACTYPE',
        OUT_TYPE,
        :p_charset
    ) AS OUT_NAME,
    OUT_LICENSE,
    IN_TYPE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'ACTYPE',
        IN_TYPE,
        :p_charset
    ) AS INTYPE_NAME,
    "Customs".GF_PARAM_VALUE(FACTORY_CODE, 'AC', 4::TEXT) AS IN_LICENSE,
    COM_INVOICE,
    COM_DATE,
    VAT_INVOICE,
    VAT_DATE,
    OUT_SETTLE,
   "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'AYRULE',
        OUT_SETTLE,
        :p_charset
    ) AS OUT_SET,
     SORT
     , "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'SORT',
        SORT,
        :p_charset
    ) AS SORT_NAME,
    OUT_CURR,
    OUT_CRATE,
    IN_CURR,
    IN_CRATE,
    mark,
    PEICE,
    GROSS , GRT_DEPT , "Customs".GF_DEPTNM(FACTORY_CODE, GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
    GRT_USER,
    "Customs".GF_EMPNM(GRT_USER, :p_charset) AS GRT_USERNAME,
    GRT_DATE,
    LAST_USER,
    "Customs".GF_EMPNM(LAST_USER, :p_charset) AS LAST_USERNAME,
    LAST_DATE,
    locked_information
FROM "Customs".AC_PROC_M
WHERE ${permissionCondition}
AND MARK = 'A'
Order by AC_DATE DESC, AC_NO ASC
limit :limit
offset :offset
`;

  const rows = await pool
    .query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
      transaction: transaction,
    })
    .catch((error) => console.log(error));

  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;
  let total = null;

  return {
    rows: actualRows,
    count: total,
    hasMore: hasMore,
  };
}
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  if (user_code === "admin") {
    return await AC_REQ_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["ac_no", "ASC"],
      ],
    });
  }

  const replacements = {
    user_code: user_code,
    ac_no: ac_no,
    factory_code: factory_code,
  };
  let permissionCondition = "1=1";
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
  const transaction = await pool.transaction();
  try {
    const sql1 = `UPDATE "Customs".ac_proc_d 
  SET status = 7, last_user = :user_code, last_date = NOW()
  where ac_no = :ac_no and status = 1 and ${permissionCondition}`;

    await pool.query(sql1, {
      replacements: replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    const sql2 = `UPDATE "Customs".ac_desc_proc
  SET status = 7, last_user = :user_code, last_date = NOW()
  where ac_no = :ac_no and status = 1 and ${permissionCondition}`;
    await pool.query(sql2, {
      replacements: replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      message: "Confirmed successfully",
    };
  } catch (error) {
    await transaction.rollback();
    console.log("Error when confirm the child table", error);
    return { success: false, message: "Error when confirm" };
  }
}
async function listAllAcProcMMarkB(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_PROC_M.findAll({
      where: { mark: "B" },
      order: [
        ["ac_date", "DESC"],
        ["ac_no", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
      logging: console.log,
    });
  }

  const charset = {
    en: "E",
    zh: "T",
    vi: "L",
  };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code || null,
    p_charset: charset[language] || "E",
    limit: parseInt(limit) + 1,
    offset: parseInt(offset),
  };

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

  const transaction = await pool.transaction();

  const sql = `
    SELECT 
      m.FACTORY_CODE,
      m.AC_NO,
      m.ac_chgeno,
      m.AC_DATE,
      m.VEND_NO,
      "Customs".GF_VEND_SHORTNM(m.FACTORY_CODE, m.VEND_NO, :p_charset) AS VENDNM,
      CASE m.d_type
        WHEN '3' THEN '3-Import VN'
        WHEN '6' THEN '6-其它Others'
      END AS d_type_name,
      m.d_type,
      m.stoc_type,
      CASE m.stoc_type
        WHEN '1' THEN '1-非保稅'
        WHEN '2' THEN '2-保稅'
        WHEN '3' THEN '3-NONE'
        WHEN '4' THEN '4-VAT'
        WHEN '6' THEN '6-其它Others'
      END AS stoc_type_name,
      m.COM_INVOICE,
      (
        SELECT ISSUED_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = m.FACTORY_CODE
          AND CONT_NO = m.IN_CONT
      ) AS STA_DATE,
      (
        SELECT EXPIRE_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = m.FACTORY_CODE
          AND CONT_NO = m.IN_CONT
      ) AS END_DATE,
      m.COL2,
      m.COL1,
      m.COL4,
      CASE m.COL6
        WHEN '1' THEN '1-鞋廠'
        WHEN '2' THEN '2-底廠'
      END AS COL6,
      m.REC_PERSON,
      m.OUT_ORG,
      m.AC_OUTER AS OUTER,
      m.REC_ADDR,
      m.JS_NO,
      m.JS_DATE,
      m.SOSO,
      m.IN_CONT,
      m.IN_DATE,
      m.SORT,
      "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'SORT', m.SORT, :p_charset) AS SORT_NAME,
      m.IN_CURR,
      "Customs".GF_CODE_NAME(m.FACTORY_CODE, '1105', m.IN_CURR, :p_charset) AS CURR_NAME,
      m.IN_CRATE,
      m.SUM_MONEY,
      m.TAX,
      m.status,
      m.locked_information,
      m.GRT_DEPT,
      "Customs".GF_DEPTNM(m.FACTORY_CODE, m.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
      m.GRT_USER,
      "Customs".GF_EMPNM(m.GRT_USER, :p_charset) AS GRT_USERNAME,
      m.GRT_DATE,
      m.LAST_USER,
      "Customs".GF_EMPNM(m.LAST_USER, :p_charset) AS LAST_USERNAME,
      m.LAST_DATE,
      m.mark
    FROM "Customs".AC_PROC_M m
    WHERE ${permissionCondition}
      AND m.MARK = 'B'
    ORDER BY m.AC_DATE DESC, m.AC_NO ASC
    LIMIT :limit
    OFFSET :offset
  `;

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
      transaction: transaction,
    });

    await transaction.commit();

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in listAllAcProcMMarkB:", error);
    throw error;
  }
}
// ✅ Chỉ cần 1 hàm - Build permission từ raw parameters
function checkPermission(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const whereClause = {};

  if (user_code === "admin") {
    return whereClause;
  }

  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }

  return whereClause;
}
async function listAllAcProcMWithDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters = {},
) {
  try {
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code,
      ac_no: filters.ac_no || "",
      in_type: filters.in_type || "",
      in_cont: filters.in_cont || "",
      s_date: filters.s_date || null,
      e_date: filters.e_date || null,
      rec_person: filters.rec_person || "",
      status:
        filters.status !== undefined && filters.status !== null
          ? filters.status
          : null,
      com_invoice: filters.com_invoice || "",
      p_charset: charset[language] || "E",
    };

    // Permission condition
    let permissionCondition = "TRUE";
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition = "m.grt_dept = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "m.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    // Main query to get AC_PROC_M list with totals
    const mainSql = `
      SELECT 
        m.factory_code,
        m.ac_chgeno,
        m.ac_no,
        COALESCE(m.sum_qty, 0) AS sum_qty,
        COALESCE(m.sum_money, 0) AS sum_money,
        m.ac_date,
        m.status,
        m.in_type,
        m.in_cont,
        m.rec_person,
        m.com_invoice
      FROM "Customs".AC_PROC_M m
      WHERE m.factory_code = :factory_code
        AND (m.ac_chgeno LIKE :ac_no || '%' OR :ac_no = '')
        AND (m.in_type LIKE :in_type || '%' OR :in_type = '')
        AND (m.in_cont LIKE :in_cont || '%' OR :in_cont = '')
        AND (:s_date IS NULL OR DATE_TRUNC('day', m.ac_date) >= DATE_TRUNC('day', :s_date::timestamp))
        AND (:e_date IS NULL OR DATE_TRUNC('day', m.ac_date) <= DATE_TRUNC('day', :e_date::timestamp))
        AND (m.rec_person = :rec_person OR :rec_person = '')
        AND (m.status = :status OR :status IS NULL)
        AND (m.com_invoice = :com_invoice OR :com_invoice = '')
        AND m.mark = 'A'
        AND ${permissionCondition}
      ORDER BY m.ac_no
    `;

    const acProcMList = await pool.query(mainSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    // For each AC_PROC_M, get details from AC_PROC_D
    const result = [];

    for (const procM of acProcMList) {
      // Get AC_PROC_D details
      const detailSql = `
        SELECT 
          d.ac_itemno,
          "Customs".GF_AC_ITEMNAME(d.factory_code, d.ac_itemno, :p_charset) AS item_name,
          "Customs".GF_AC_ITEM_M_AC_ITEM(d.factory_code, d.ac_itemno) AS ac_item,
          COALESCE(d.ac_qty, 0) AS ac_qty,
          COALESCE(d.price, 0) AS price,
          COALESCE(d.money, 0) AS money,
          COALESCE(d.atax_rate, 0) AS atax_rate,
          d.seq
        FROM "Customs".AC_PROC_D d
        WHERE d.factory_code = :factory_code
          AND d.ac_no = :ac_no
        ORDER BY d.ac_itemno, d.price
      `;

      const details = await pool.query(detailSql, {
        replacements: {
          factory_code: procM.factory_code,
          ac_no: procM.ac_no,
          p_charset: replacements.p_charset,
        },
        type: pool.QueryTypes.SELECT,
      });
      for (const detail of details) {
        const unitSql = `
          SELECT "Customs".GF_CODE_NAME(
            :factory_code,
            '1108',
            "Customs".GF_AC_ITEMUNIT(:factory_code, :ac_itemno),
            :p_charset
          ) AS unit_name
        `;

        const unitResult = await pool.query(unitSql, {
          replacements: {
            factory_code: procM.factory_code,
            ac_itemno: detail.ac_itemno,
            p_charset: replacements.p_charset,
          },
          type: pool.QueryTypes.SELECT,
        });

        detail.unit_name = unitResult[0]?.unit_name || "";
      }

      result.push({
        ...procM,
        details: details,
      });
    }
    const lastAcNoSql = `
      SELECT MAX(ac_no) AS last_ac_no
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code
        AND (ac_chgeno LIKE :ac_no || '%' OR :ac_no = '')
        AND (in_type LIKE :in_type || '%' OR :in_type = '')
        AND (in_cont LIKE :in_cont || '%' OR :in_cont = '')
        AND (:s_date IS NULL OR DATE_TRUNC('day', ac_date) >= DATE_TRUNC('day', :s_date::timestamp))
        AND (:e_date IS NULL OR DATE_TRUNC('day', ac_date) <= DATE_TRUNC('day', :e_date::timestamp))
        AND (rec_person = :rec_person OR :rec_person = '')
        AND (status = :status OR :status IS NULL)
        AND mark = 'A'
    `;

    const lastAcNoResult = await pool.query(lastAcNoSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    let grandTotals = {
      sum_qty: 0,
      sum_money: 0,
      sum_rb_money: 0,
    };

    if (lastAcNoResult[0]?.last_ac_no) {
      const lastAcNo = lastAcNoResult[0].last_ac_no;

      // Get totals from AC_PROC_M
      const totalsSql = `
        SELECT 
          ac_no,
          COALESCE(sum_qty, 0) AS sum_qty,
          COALESCE(sum_money, 0) AS sum_money
        FROM "Customs".AC_PROC_M
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;

      const totalsResult = await pool.query(totalsSql, {
        replacements: {
          factory_code: factory_code,
          ac_no: lastAcNo,
        },
        type: pool.QueryTypes.SELECT,
      });

      // Get sum of RB_MONEY from AC_PROC_D
      const rbMoneySql = `
        SELECT COALESCE(SUM(rb_money), 0) AS sum_rb_money
        FROM "Customs".AC_PROC_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;

      const rbMoneyResult = await pool.query(rbMoneySql, {
        replacements: {
          factory_code: factory_code,
          ac_no: lastAcNo,
        },
        type: pool.QueryTypes.SELECT,
      });

      grandTotals = {
        last_ac_no: lastAcNo,
        sum_qty: totalsResult[0]?.sum_qty || 0,
        sum_money: totalsResult[0]?.sum_money || 0,
        sum_rb_money: rbMoneyResult[0]?.sum_rb_money || 0,
      };
    }

    return {
      data: result,
      totals: grandTotals,
      count: result.length,
    };
  } catch (error) {
    console.error("Error in listAllAcProcMWithDetails:", error);
    throw error;
  }
}
async function listAllAcProcMWithDetailsMarkB(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters = {},
) {
  try {
    // Convert language to charset code
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code,
      ac_no: filters.ac_no || "",
      in_type: filters.in_type || "",
      in_cont: filters.in_cont || "",
      s_date: filters.s_date || null,
      e_date: filters.e_date || null,
      rec_person: filters.rec_person || "",
      status:
        filters.status !== undefined && filters.status !== null
          ? filters.status
          : null,
      com_invoice: filters.com_invoice || "",
      p_charset: charset[language] || "E",
    };

    // Permission condition (giữ nguyên từ markA)
    let permissionCondition = "TRUE";
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition = "m.grt_dept = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "m.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    // Main query to get AC_PROC_M list (MARK = 'B' theo SQL gốc)
    const mainSql = `
      SELECT 
        m.factory_code,
        m.ac_chgeno,
        m.ac_no,
        COALESCE(m.sum_qty, 0) AS sum_qty,
        COALESCE(m.sum_money, 0) AS sum_money,
        m.com_invoice,
        m.ac_date,
        m.status,
        m.in_type,
        m.in_cont,
        m.rec_person
      FROM "Customs".AC_PROC_M m
      WHERE m.factory_code = :factory_code
        AND (m.ac_chgeno LIKE :ac_no || '%' OR :ac_no = '')
        AND (m.in_type LIKE :in_type || '%' OR :in_type = '')
        AND (m.in_cont LIKE :in_cont || '%' OR :in_cont = '')
        AND (:s_date IS NULL OR DATE_TRUNC('day', m.ac_date) >= DATE_TRUNC('day', :s_date::timestamp))
        AND (:e_date IS NULL OR DATE_TRUNC('day', m.ac_date) <= DATE_TRUNC('day', :e_date::timestamp))
        AND (m.rec_person = :rec_person OR :rec_person = '')
        AND (m.status = :status OR :status IS NULL)
        AND (COALESCE(m.com_invoice, '%') LIKE :com_invoice || '%' OR :com_invoice = '')
        AND m.mark = 'B'
        AND ${permissionCondition}
      ORDER BY m.ac_no
    `;

    const acProcMList = await pool.query(mainSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    // For each AC_PROC_M, get details from AC_PROC_D
    const result = [];

    for (const procM of acProcMList) {
      // Get sum RB_MONEY for this AC_NO (theo SQL gốc)
      const rbMoneySumSql = `
        SELECT COALESCE(SUM(rb_money), 0) AS sum_rb_money
        FROM "Customs".AC_PROC_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;

      const rbMoneySumResult = await pool.query(rbMoneySumSql, {
        replacements: {
          factory_code: procM.factory_code,
          ac_no: procM.ac_no,
        },
        type: pool.QueryTypes.SELECT,
      });

      const sum_rb_money = rbMoneySumResult[0]?.sum_rb_money || 0;

      // Get AC_PROC_D details (theo SQL gốc)
      const detailSql = `
        SELECT 
          d.ac_itemno,
          "Customs".GF_AC_ITEMNAME(d.factory_code, d.ac_itemno, :p_charset) AS item_name,
          "Customs".GF_AC_ITEM_M_AC_ITEM(d.factory_code, d.ac_itemno) AS ac_item,
          COALESCE(d.ac_qty, 0) AS ac_qty,
          COALESCE(d.price, 0) AS price,
          COALESCE(d.money, 0) AS money,
          COALESCE(d.rb_money, 0) AS rb_money,
          COALESCE(d.atax_rate, 0) AS atax_rate,
          d.seq
        FROM "Customs".AC_PROC_D d
        WHERE d.factory_code = :factory_code
          AND d.ac_no = :ac_no
        ORDER BY d.ac_itemno, d.price
      `;

      const details = await pool.query(detailSql, {
        replacements: {
          factory_code: procM.factory_code,
          ac_no: procM.ac_no,
          p_charset: replacements.p_charset,
        },
        type: pool.QueryTypes.SELECT,
      });

      // Get unit name for each detail (theo SQL gốc)
      for (const detail of details) {
        const unitSql = `
          SELECT "Customs".GF_CODE_NAME(
            :factory_code,
            '1108',
            "Customs".GF_AC_ITEMUNIT(:factory_code, :ac_itemno),
            :p_charset
          ) AS unit_name
        `;

        const unitResult = await pool.query(unitSql, {
          replacements: {
            factory_code: procM.factory_code,
            ac_itemno: detail.ac_itemno,
            p_charset: replacements.p_charset,
          },
          type: pool.QueryTypes.SELECT,
        });

        detail.unit_name = unitResult[0]?.unit_name || "";
      }

      result.push({
        ...procM,
        sum_rb_money: sum_rb_money,
        details: details,
      });
    }

    // Get last AC_NO and totals (theo SQL gốc)
    const lastAcNoSql = `
      SELECT MAX(ac_no) AS last_ac_no
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code
        AND (ac_chgeno LIKE :ac_no || '%' OR :ac_no = '')
        AND (in_type LIKE :in_type || '%' OR :in_type = '')
        AND (in_cont LIKE :in_cont || '%' OR :in_cont = '')
        AND (:s_date IS NULL OR DATE_TRUNC('day', ac_date) >= DATE_TRUNC('day', :s_date::timestamp))
        AND (:e_date IS NULL OR DATE_TRUNC('day', ac_date) <= DATE_TRUNC('day', :e_date::timestamp))
        AND (rec_person = :rec_person OR :rec_person = '')
        AND (status = :status OR :status IS NULL)
        AND (COALESCE(com_invoice, '%') LIKE :com_invoice || '%' OR :com_invoice = '')
        AND mark = 'B'
    `;

    const lastAcNoResult = await pool.query(lastAcNoSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    let grandTotals = {
      sum_qty: 0,
      sum_money: 0,
      sum_rb_money: 0,
    };

    if (lastAcNoResult[0]?.last_ac_no) {
      const lastAcNo = lastAcNoResult[0].last_ac_no;

      // Get totals from AC_PROC_M (theo SQL gốc)
      const totalsSql = `
        SELECT 
          ac_no,
          COALESCE(sum_qty, 0) AS sum_qty,
          COALESCE(sum_money, 0) AS sum_money
        FROM "Customs".AC_PROC_M
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;

      const totalsResult = await pool.query(totalsSql, {
        replacements: {
          factory_code: factory_code,
          ac_no: lastAcNo,
        },
        type: pool.QueryTypes.SELECT,
      });

      // Get sum of RB_MONEY from AC_PROC_D (theo SQL gốc)
      const rbMoneySql = `
        SELECT COALESCE(SUM(rb_money), 0) AS sum_rb_money
        FROM "Customs".AC_PROC_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;

      const rbMoneyResult = await pool.query(rbMoneySql, {
        replacements: {
          factory_code: factory_code,
          ac_no: lastAcNo,
        },
        type: pool.QueryTypes.SELECT,
      });

      grandTotals = {
        last_ac_no: lastAcNo,
        sum_qty: totalsResult[0]?.sum_qty || 0,
        sum_money: totalsResult[0]?.sum_money || 0,
        sum_rb_money: rbMoneyResult[0]?.sum_rb_money || 0,
      };
    }

    return {
      data: result,
      totals: grandTotals,
      count: result.length,
    };
  } catch (error) {
    console.error("Error in listAllAcProcMWithDetailsMarkB:", error);
    throw error;
  }
}
async function getByID(factory_code, ac_no) {
  const acImp = await AC_PROC_M.findOne({
    where: {
      factory_code: factory_code,
      ac_no: ac_no,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function createAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
  mark = "A",
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    mark: mark,
  };

  // if (user_code !== "admin") {
  //   if (query_level === "1" && factory_code) {
  //     permissionCondition = "factory_code = :factory_code";
  //   } else if (query_level === "2" && department_code && factory_code) {
  //     permissionCondition =
  //       "grt_dept = :permission_dept AND factory_code = :factory_code";
  //     replacements.permission_dept = department_code;
  //   } else if (query_level === "3" && user_code) {
  //     permissionCondition = "grt_user = :permission_user";
  //     replacements.permission_user = user_code;
  //   }
  // }

  try {
    const sql = `
      SELECT 
        :mark || TO_CHAR(NOW(), 'YYYYMM') || 
        TO_CHAR(
          COALESCE(
            TO_NUMBER(
              CASE 
                WHEN SUBSTRING(AC_NO, 8, 5) = '' THEN '00000'
                ELSE SUBSTRING(AC_NO, 8, 5)
              END, 
              '99999'
            ), 
            0
          ) + 1, 
          'FM00000'
        ) AS new_ac_no
      FROM "Customs".AC_PROC_M
      WHERE ${permissionCondition}
        AND SUBSTRING(AC_NO, 1, 7) = :mark || TO_CHAR(NOW(), 'YYYYMM')
      ORDER BY AC_NO DESC
      LIMIT 1
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const newAcno =
      rows[0]?.new_ac_no ||
      mark + new Date().toISOString().slice(0, 7).replace("-", "") + "00001";

    return newAcno;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}

// Và trong getPosition - Build SQL WHERE trực tiếp
async function getPosition(
  factory_code,
  ac_no,
  pageSize,
  mark = "A",
  t,
  permission = {},
) {
  try {
    const permConditions = [];
    const replacements = { factory_code, ac_no, mark };

    if (permission.factory_code) {
      permConditions.push("m.factory_code = :perm_factory_code");
      replacements.perm_factory_code = permission.factory_code;
    }

    if (permission.grt_dept) {
      permConditions.push("m.grt_dept = :perm_dept");
      replacements.perm_dept = permission.grt_dept;
    }

    if (permission.grt_user) {
      permConditions.push("m.grt_user = :perm_user");
      replacements.perm_user = permission.grt_user;
    }

    const whereClause =
      permConditions.length > 0 ? "AND " + permConditions.join(" AND ") : "";

    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT 
          m.ac_no,
          ROW_NUMBER() OVER (
            ORDER BY m.ac_date DESC, m.ac_no ASC 
          ) - 1 as position
        FROM "Customs".AC_PROC_M m
        WHERE m.factory_code = :factory_code
          AND m.mark = :mark
          ${whereClause}
      )
      SELECT position
      FROM ranked
      WHERE ac_no = :ac_no
      `,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
        transaction: t,
      },
    );

    const position = parseInt(result[0]?.position ?? 0);
    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return { position, size, page, offset };
  } catch (error) {
    console.log("Cannot calculate position", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acChgM,
  pageSize,
  mark,
  t,
) {
  try {
    const addItem = await AC_PROC_M.create(acChgM, {
      transaction: t,
    });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItem.factory_code,
      addItem.ac_no,
      pageSize,
      mark,
      t,
      permission,
    );
    return {
      data: addItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
    throw error;
  }
}
async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existAcChgM,
  editAcChgM,
  pageSize,
  mark,
  t,
) {
  try {
    const editItem = await existAcChgM.update(editAcChgM, { transaction: t });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editItem.factory_code,
      editItem.ac_no,
      pageSize,
      mark,
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac item m from db", error);
    throw error;
  }
}
async function deleteImp(existAcImp, t) {
  try {
    const deleteImp = await existAcImp.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete import material tracking from db", error);
  }
}
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };
    let permissionCondition = "TRUE";
    let replacements = {
      factory_code: factory_code,
      ac_no: query.ac_no || "",
      in_type: query.in_type || "",
      in_cont: query.in_cont || "",
      rec_person: query.rec_person || "",
      com_invoice: query.com_invoice || "",
      status:
        query.status !== undefined && query.status !== null
          ? query.status
          : null,
      s_acdate_1: query.s_date_1 || null,
      e_acdate_1: query.e_date_1 || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition = "grt_dept = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
  SELECT 
    FACTORY_CODE,
    AC_NO,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        '1105',
        IN_CURR,
        :p_charset
    ) AS CURR_NAME,
    SUM_MONEY,
    TAX,
    AC_DATE,
    AC_CHGS,
    AC_CHGENO,
    AC_CHGN,
    AC_CHGO,
    COL2,
    status,
    d_type,
    case
        d_type
        when '3' then '3 - Import VN'
        when '6' then '6 - 其它Others'
    end as d_type_name,
    COL1,
    REC_PERSON,
    OUT_ORG,
    AC_OUTER,
    REC_ADDR,
    JS_NO,
    JS_DATE,
    SOSO,
    EX_USER,
    OUT_CONT,
    OUT_DATE,
    OUT_VDATE,
    stoc_type,
    case
        stoc_type
        when '1' then '1 - 非保稅 '
        when '2' then '2 - 保稅'
        when '3' then '3 - NONE'
        when '4' then '4 - VAT'
        when '6' then '6 - 其它Others'
    end as stoc_type_name,
    IN_CONT,
    MIN_CONT,
    IN_DATE,
    (
        SELECT ISSUED_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = AC_PROC_M.FACTORY_CODE
            AND CONT_NO = AC_PROC_M.IN_CONT
    ) AS STA_DATE,
    (
        SELECT EXPIRE_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = AC_PROC_M.FACTORY_CODE
            AND CONT_NO = AC_PROC_M.IN_CONT
    ) AS END_DATE,
    rec_person,
    (
        SELECT S_ADDR
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = AC_PROC_M.FACTORY_CODE
            AND CONT_NO = AC_PROC_M.IN_CONT
    ) AS OUTER,
   IN_SETTLE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'AYRULE',
        IN_SETTLE,
        :p_charset
    ) AS IN_SET,
    OUT_TYPE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'ACTYPE',
        OUT_TYPE,
        :p_charset
    ) AS OUT_NAME,
    OUT_LICENSE,
    IN_TYPE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'ACTYPE',
        IN_TYPE,
        :p_charset
    ) AS INTYPE_NAME,
    "Customs".GF_PARAM_VALUE(FACTORY_CODE, 'AC', 4::TEXT) AS IN_LICENSE,
    COM_INVOICE,
    COM_DATE,
    VAT_INVOICE,
    VAT_DATE,
    OUT_SETTLE,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'AYRULE',
        OUT_SETTLE,
        :p_charset
    ) AS OUT_SET,
    SORT,
    "Customs".GF_CODE_NAME(
        FACTORY_CODE,
        'SORT',
        SORT,
        :p_charset
    ) AS SORT_NAME,
    OUT_CURR,
    OUT_CRATE,
    IN_CURR,
    IN_CRATE,
    PEICE,
    mark,
    GROSS,
    GRT_DEPT,
    "Customs".GF_DEPTNM(FACTORY_CODE, GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
    GRT_USER,
    "Customs".GF_EMPNM(GRT_USER, :p_charset) AS GRT_USERNAME,
    GRT_DATE,
    LAST_USER,
    "Customs".GF_EMPNM(LAST_USER, :p_charset) AS LAST_USERNAME,
    LAST_DATE,
    locked_information
  FROM "Customs".AC_PROC_M
  WHERE FACTORY_CODE = :factory_code
    AND (COALESCE(ac_no, '')  ILIKE '%'|| :ac_no || '%')
    AND (COALESCE(IN_TYPE, '') ILIKE '%'|| :in_type || '%')
    AND (COALESCE(IN_CONT, '') ILIKE '%'|| :in_cont || '%')
    AND (:s_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) >= DATE_TRUNC('day', :s_acdate_1::timestamp))
    AND (:e_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) <= DATE_TRUNC('day', :e_acdate_1::timestamp))
    AND (COALESCE(REC_PERSON, '') ILIKE '%'|| :rec_person || '%')
    AND (STATUS = :status OR :status IS NULL)
    AND (COM_INVOICE ILIKE '%'|| :com_invoice || '%')
    AND MARK = 'A'
    AND ${permissionCondition}
  ORDER BY AC_DATE DESC, AC_NO
  LIMIT :limit
  OFFSET :offset
`;

    const countSql = `
  SELECT COUNT(*) AS total
  FROM "Customs".AC_PROC_M
  WHERE FACTORY_CODE = :factory_code
    AND (COALESCE(ac_no, '')  ILIKE '%'|| :ac_no || '%')
    AND (COALESCE(IN_TYPE, '') ILIKE '%'|| :in_type || '%')
    AND (COALESCE(IN_CONT, '') ILIKE '%'|| :in_cont || '%')
    AND (:s_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) >= DATE_TRUNC('day', :s_acdate_1::timestamp))
    AND (:e_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) <= DATE_TRUNC('day', :e_acdate_1::timestamp))
    AND (COALESCE(REC_PERSON, '') ILIKE '%'|| :rec_person || '%')
    AND (STATUS = :status OR :status IS NULL)
    AND (COM_INVOICE ILIKE '%'|| :com_invoice || '%')
    AND MARK = 'A'
    AND ${permissionCondition}
`;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    let total = null;
    if (parseInt(offset) === 0) {
      total = countResult[0].total;
    }

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database cannot search the data", error);
    throw error;
  }
}
async function searchForMarkB(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };
    let permissionCondition = "TRUE";
    let replacements = {
      factory_code: factory_code,
      ac_no: query.ac_no || "",
      in_type: query.in_type || "",
      in_cont: query.in_cont || "",
      rec_person: query.rec_person || "",
      com_invoice: query.com_invoice || "",
      status:
        query.status !== undefined && query.status !== null
          ? query.status
          : null,
      s_acdate_1: query.s_date_1 || null,
      e_acdate_1: query.e_date_1 || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition = "grt_dept = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
   SELECT 
      m.FACTORY_CODE,
      m.AC_NO,
      m.ac_chgeno,
      m.AC_DATE,
      m.VEND_NO,
      "Customs".GF_VEND_SHORTNM(m.FACTORY_CODE, m.VEND_NO, :p_charset) AS VENDNM,
      m.d_type,
      CASE m.d_type
        WHEN '3' THEN '3-Import VN'
        WHEN '6' THEN '6-其它Others'
      END AS d_type_name,
      m.stoc_type,
      CASE m.stoc_type
        WHEN '1' THEN '1-非保稅'
        WHEN '2' THEN '2-保稅'
        WHEN '3' THEN '3-NONE'
        WHEN '4' THEN '4-VAT'
        WHEN '6' THEN '6-其它Others'
      END AS stoc_type_name,
      m.COM_INVOICE,
      (
        SELECT ISSUED_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = m.FACTORY_CODE
          AND CONT_NO = m.IN_CONT
      ) AS STA_DATE,
      (
        SELECT EXPIRE_DATE
        FROM "Customs".VW_CONT_IMP
        WHERE FACTORY_CODE = m.FACTORY_CODE
          AND CONT_NO = m.IN_CONT
      ) AS END_DATE,
      m.COL2,
      m.COL1,
      m.COL4,
      CASE m.COL6
        WHEN '1' THEN '1-鞋廠'
        WHEN '2' THEN '2-底廠'
      END AS COL6,
      m.REC_PERSON,
      m.OUT_ORG,
      m.AC_OUTER AS OUTER,
      m.REC_ADDR,
      m.JS_NO,
      m.JS_DATE,
      m.SOSO,
      m.IN_CONT,
      m.IN_DATE,
      m.SORT,
      "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'SORT', m.SORT, :p_charset) AS SORT_NAME,
      m.IN_CURR,
      "Customs".GF_CODE_NAME(m.FACTORY_CODE, '1105', m.IN_CURR, :p_charset) AS CURR_NAME,
      m.IN_CRATE,
      m.SUM_MONEY,
      m.TAX,
      m.status,
      m.locked_information,
      m.GRT_DEPT,
      "Customs".GF_DEPTNM(m.FACTORY_CODE, m.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
      m.GRT_USER,
      "Customs".GF_EMPNM(m.GRT_USER, :p_charset) AS GRT_USERNAME,
      m.GRT_DATE,
      m.LAST_USER,
      "Customs".GF_EMPNM(m.LAST_USER, :p_charset) AS LAST_USERNAME,
      m.LAST_DATE,
      m.mark
    FROM "Customs".AC_PROC_M m
  WHERE 
    (IN_CONT LIKE :in_cont || '%' OR :in_cont = '')
    AND (COALESCE(ac_no, '') ILIKE '%'|| :ac_no || '%')
    AND (COALESCE(IN_TYPE, '') ILIKE '%'|| :in_type || '%')
    AND (COALESCE(IN_CONT, '') ILIKE '%'|| :in_cont || '%')
    AND (:s_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) >= DATE_TRUNC('day', :s_acdate_1::timestamp))
    AND (:e_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) <= DATE_TRUNC('day', :e_acdate_1::timestamp))
     AND (COALESCE(REC_PERSON, '') ILIKE '%'|| :rec_person || '%')
    AND (STATUS = :status OR :status IS NULL)
    AND (COM_INVOICE ILIKE '%'|| :com_invoice || '%')
    AND MARK = 'B'
    AND ${permissionCondition}
  ORDER BY AC_DATE DESC, AC_NO
  LIMIT 5
  OFFSET :offset
`;

    const countSql = `
  SELECT COUNT(*) AS total
  FROM "Customs".AC_PROC_M
  WHERE
    (IN_CONT LIKE :in_cont || '%' OR :in_cont = '')
    AND (COALESCE(ac_no, '') ILIKE '%'|| :ac_no || '%')
    AND (COALESCE(IN_TYPE, '') ILIKE '%'|| :in_type || '%')
    AND (COALESCE(IN_CONT, '') ILIKE '%'|| :in_cont || '%')
    AND (:s_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) >= DATE_TRUNC('day', :s_acdate_1::timestamp))
    AND (:e_acdate_1 IS NULL OR DATE_TRUNC('day', AC_DATE) <= DATE_TRUNC('day', :e_acdate_1::timestamp))
     AND (COALESCE(REC_PERSON, '') ILIKE '%'|| :rec_person || '%')
    AND (STATUS = :status OR :status IS NULL)
    AND (COM_INVOICE ILIKE '%'|| :com_invoice || '%')
    AND MARK = 'B'
    AND ${permissionCondition}
`;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    let total = null;
    if (parseInt(offset) === 0) {
      total = countResult[0].total;
    }

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database cannot search the data", error);
    throw error;
  }
}
// ============================================
// F3: ACTIVATE (生效)
// ============================================
async function activate(factory_code, user_code, ac_no, language) {
  const transaction = await pool.transaction();
  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort,
        in_crate
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      throw new Error("AC_PROC_M not found");
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont, in_crate } = ac_proc_m;

    // 2. Kiểm tra có dữ liệu AC_PROC_D không
    const checkProcDSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const procDCountResult = await pool.query(checkProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procDCountResult[0].count === 0) {
      const message = await gf_mesgnm(500044, language); // "No detail data found"
      throw new Error(message);
    }

    // 3. Kiểm tra có dữ liệu AC_DESC_PROC không
    const checkDescSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_DESC_PROC
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const descCountResult = await pool.query(checkDescSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (descCountResult[0].count === 0) {
      const message = await gf_mesgnm(500044, language); // "No description data found"
      throw new Error(message);
    }

    // 4. Kiểm tra trùng Invoice nếu có COM_INVOICE và SORT
    if (com_invoice && sort) {
      const checkDupSql = `
        SELECT is_ac
        FROM "Customs".ac_imp_material_tracking
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
          AND sort = :sort
      `;
      const dupResult = await pool.query(checkDupSql, {
        replacements: { factory_code, com_invoice, sort },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      if (dupResult.length > 0 && dupResult[0].is_ac === "Y") {
        throw new Error("Invoice NO# repeat!!");
      }
    }

    // 5. Lấy danh sách AC_PROC_D để cập nhật AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty,
        over_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 6. Cập nhật AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) + COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) - COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 7. Cập nhật OVER_QTY = AC_QTY trong AC_PROC_D
    const updateOverQtySql = `
      UPDATE "Customs".AC_PROC_D
      SET over_qty = COALESCE(ac_qty, 0)
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateOverQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 8. Đánh dấu IS_AC = 'Y' trong ac_imp_material_tracking
    if (com_invoice && sort) {
      const updateTrackingSql = `
        UPDATE "Customs".ac_imp_material_tracking
        SET is_ac = 'Y'
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
          AND sort = :sort
      `;
      await pool.query(updateTrackingSql, {
        replacements: { factory_code, com_invoice, sort },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 9. Xử lý AC_REQ_ORDER và PO_RCPT_AC
    if (com_invoice) {
      const getReqOrderSql = `
        SELECT 
          m.factory_code,
          m.chk_no,
          m.chk_seq,
          m.order_no,
          m.order_seq,
          m.req_seq,
          m.req_no
        FROM "Customs".AC_REQ_ORDER m
        JOIN "Customs".AC_REQ_M d 
          ON d.factory_code = m.factory_code
          AND d.req_no = m.req_no
        WHERE d.factory_code = :factory_code
          AND d.invoice_no = :com_invoice
      `;
      const reqOrderResult = await pool.query(getReqOrderSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      let last_req_no = null;

      for (const req of reqOrderResult) {
        // Insert/Update PO_RCPT_AC nếu có CHK_NO
        if (req.chk_no) {
          const upsertPoRcptSql = `
  INSERT INTO "Customs".PO_RCPT_AC
    (factory_code, chk_no, chk_seq, ac_no, order_no, order_seq)
  VALUES
    (:factory_code, :chk_no, :chk_seq, :ac_no, :order_no, :order_seq)
  ON CONFLICT (factory_code, chk_no, chk_seq)
  DO UPDATE SET ac_no = EXCLUDED.ac_no
`;

          await pool.query(upsertPoRcptSql, {
            replacements: {
              factory_code: req.factory_code,
              chk_no: req.chk_no,
              chk_seq: req.chk_seq,
              ac_no: ac_no,
              order_no: req.order_no,
              order_seq: req.order_seq,
            },
            type: pool.QueryTypes.INSERT,
            transaction,
          });
        }

        // Update AC_REQ_ORDER - CHGE_QTY = REQ_ACQTY
        const updateReqOrderSql = `
          UPDATE "Customs".AC_REQ_ORDER
          SET chge_qty = req_acqty
          WHERE factory_code = :factory_code
            AND req_no = :req_no
            AND req_seq = :seq
        `;
        await pool.query(updateReqOrderSql, {
          replacements: {
            factory_code: req.factory_code,
            req_no: req.req_no,
            seq: req.req_seq,
          },
          type: pool.QueryTypes.UPDATE,
          transaction,
        });

        last_req_no = req.req_no;
      }

      // 10. Cập nhật AC_REQ_M với AC_NO
      if (last_req_no) {
        const updateReqMSql = `
          UPDATE "Customs".AC_REQ_M
          SET ac_no = :ac_no
          WHERE factory_code = :factory_code
            AND req_no = :req_no
        `;
        await pool.query(updateReqMSql, {
          replacements: {
            factory_code: factory_code,
            req_no: last_req_no,
            ac_no: ac_no,
          },
          type: pool.QueryTypes.UPDATE,
          transaction,
        });
      }
    }

    // 11. Cập nhật STATUS = 7 và LAST_USER, LAST_DATE trong AC_PROC_M
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 7,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    //13. Cập nhật total_money
    const updateTotalMoneySql = `
    UPDATE "Customs".ac_proc_m
SET 
  sum_money = sub.total_money,
  add_tax     = sub.add_tax,
  tax         = sub.tax,
  sum_qty     = sub.qty
FROM (
  SELECT 
    SUM(COALESCE(money,   0)) AS total_money,
    SUM(COALESCE(add_tax, 0)) AS add_tax,
    SUM(COALESCE(tax,     0)) AS tax,
    SUM(COALESCE(ac_qty,  0)) AS qty
  FROM "Customs".ac_proc_d
  WHERE factory_code = :factory_code
    AND ac_no        = :ac_no
    AND status       > 0
) sub
WHERE "Customs".ac_proc_m.factory_code = :factory_code
  AND "Customs".ac_proc_m.ac_no        = :ac_no
    `;
    await pool.query(updateTotalMoneySql, {
      replacements: {
        factory_code,
        ac_no,
      },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    // 12. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Kích hoạt thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in activateAcProc:", error);
    throw error;
  }
}

// ============================================
// F4: CANCEL ACTIVATION (取消生效)
// ============================================
async function cancelActivate(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();

  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      const message = await gf_mesgnm(500057, language);
      throw new Error(message);
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont } = ac_proc_m;

    // 2. Kiểm tra AC_QTY != OVER_QTY (đã có sử dụng thì không cho hủy)
    const checkUsedSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND COALESCE(ac_qty, 0) != COALESCE(over_qty, 0)
    `;
    const usedResult = await pool.query(checkUsedSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (usedResult[0].count > 0) {
      const message = await gf_mesgnm(500067, language); // "Cannot cancel - already used"
      throw new Error(message);
    }

    // 3. Kiểm tra đã có AC_ITEMSTOC_CHGE chưa
    const checkStocChgSql = `
      SELECT COUNT(1) as count
      FROM "Customs".AC_REQ_ORDER m
      JOIN "Customs".AC_REQ_M d 
        ON d.factory_code = m.factory_code
        AND d.req_no = m.req_no
     JOIN "Customs".AC_ITEMSTOC_CHGE c 
        ON m.factory_code = c.factory_code
        AND m.chk_no = c.src_no
       AND m.chk_seq = c.src_seq
      WHERE d.factory_code = :factory_code
        AND d.invoice_no = :com_invoice
    `;
    const stocChgResult = await pool.query(checkStocChgSql, {
      replacements: { factory_code, com_invoice },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (stocChgResult[0].count > 0) {
      const message = await gf_mesgnm(540120, language); // "Cannot cancel - stock change exists"
      throw new Error(message);
    }

    // 4. Lấy danh sách AC_PROC_D để hoàn nguyên AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 5. Hoàn nguyên AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) - COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) + COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 6. Cập nhật STATUS = 1
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 1,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 7. Cập nhật IS_AC = 'N'
    if (com_invoice && sort) {
      const updateTrackingSql = `
        UPDATE "Customs".ac_imp_material_tracking
        SET is_ac = 'N'
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
          AND sort = :sort
      `;
      await pool.query(updateTrackingSql, {
        replacements: { factory_code, com_invoice, sort },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 8. Xử lý AC_REQ_ORDER và PO_RCPT_AC
    if (com_invoice) {
      const getReqOrderSql = `
        SELECT 
          m.factory_code,
          m.chk_no,
          m.chk_seq,
          m.order_no,
          m.order_seq,
          m.req_no,
          m.req_seq
        FROM "Customs".AC_REQ_ORDER m
        JOIN "Customs".AC_REQ_M d 
          ON d.factory_code = m.factory_code
          AND d.req_no = m.req_no
        WHERE d.factory_code = :factory_code
          AND d.invoice_no = :com_invoice
      `;
      const reqOrderResult = await pool.query(getReqOrderSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      let last_req_no = null;

      // for (const req of reqOrderResult) {
      //   // Update PO_RCPT_AC - set AC_NO = NULL nếu có CHK_NO
      //   if (req.chk_no) {
      //     const updatePoRcptSql = `
      //       UPDATE "Customs".PO_RCPT_AC
      //       SET ac_no = NULL
      //       WHERE factory_code = :factory_code
      //         AND chk_no = :chk_no
      //         AND chk_seq = :chk_seq
      //     `;
      //     await pool.query(updatePoRcptSql, {
      //       replacements: {
      //         factory_code: req.factory_code,
      //         chk_no: req.chk_no,
      //         chk_seq: req.chk_seq,
      //       },
      //       type: pool.QueryTypes.UPDATE,
      //       transaction,
      //     });
      //   }

      //   // Update AC_REQ_ORDER - CHGE_QTY = NULL ('' trong Oracle)
      //   const updateReqOrderSql = `
      //     UPDATE "Customs".AC_REQ_ORDER
      //     SET chge_qty = NULL
      //     WHERE factory_code = :factory_code
      //       AND req_no = :req_no
      //       AND req_seq = :seq
      //   `;
      //   await pool.query(updateReqOrderSql, {
      //     replacements: {
      //       factory_code: req.factory_code,
      //       req_no: req.req_no,
      //       seq: req.req_seq,
      //     },
      //     type: pool.QueryTypes.UPDATE,
      //     transaction,
      //   });

      //   last_req_no = req.req_no;
      // }

      // 9. Xóa AC_NO trong AC_REQ_M (set = NULL hoặc '')
      if (last_req_no) {
        const updateReqMSql = `
          UPDATE "Customs".AC_REQ_M
          SET ac_no = NULL
          WHERE factory_code = :factory_code
            AND req_no = :req_no
        `;
        await pool.query(updateReqMSql, {
          replacements: {
            factory_code: factory_code,
            req_no: last_req_no,
          },
          type: pool.QueryTypes.UPDATE,
          transaction,
        });
      }
    }

    // 10. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Hủy kích hoạt thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in cancelActivateAcProc:", error);
    throw error;
  }
}

// ============================================
// CLOSE CASE (結案)
// ============================================
async function close(factory_code, ac_no, user_code) {
  try {
    const sql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 9,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;

    await pool.query(sql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
    });

    return {
      success: true,
      message: "Kết án chứng từ thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    console.error("Error in closeAcProc:", error);
    throw error;
  }
}

// ============================================
// F5
// ============================================
async function voidAll(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort,
        col2
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      const message = await gf_mesgnm(500057, charset[language]);
      throw new Error(message);
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont, col2 } = ac_proc_m;

    // 2. Kiểm tra AC_QTY != OVER_QTY (đã có sử dụng thì không cho hủy)
    const checkUsedSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND COALESCE(ac_qty, 0) != COALESCE(over_qty, 0)
    `;
    const usedResult = await pool.query(checkUsedSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (usedResult[0].count > 0) {
      const message = await gf_mesgnm(500053, charset[language]);
      const error = new Error(message);
      error.code = 500053;
      throw error;
    }

    // 3. Validate COL2 (số công văn hủy) phải có
    if (!col2) {
      const message = await gf_mesgnm(500107, charset[language]); // "COL2 is required"
      const error = new Error(message);
      error.code = 500107;
      throw error;
    }

    // 4. Lấy danh sách AC_PROC_D để hoàn nguyên AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 5. Hoàn nguyên AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) - COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) + COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 6. Cập nhật IS_AC = 'N'
    if (com_invoice && sort) {
      const updateTrackingSql = `
        UPDATE "Customs".ac_imp_material_tracking
        SET is_ac = 'N'
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
          AND sort = :sort
      `;
      await pool.query(updateTrackingSql, {
        replacements: { factory_code, com_invoice, sort },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 7. Cập nhật STATUS = 0 (Hủy bỏ)
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 0,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 8. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Hủy bỏ chứng từ thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in voidAcProc:", error);
    throw error;
  }
}
async function gf_mesgnm(code, language) {
  try {
    const sql = `
     select * from "Customs".gf_mesgnm(:code,:language) as mesgnm
    `;
    const row = await pool.query(sql, {
      replacements: { code, language },
      type: pool.QueryTypes.SELECT,
    });
    return row[0]?.mesgnm;
  } catch (error) {
    console.error("Error in closeAcChg:", error);
    throw error;
  }
}

// ============================================
// MARK B - AC_PROC (加工進口) FUNCTIONS
// ============================================

/*
 * GIẢI THÍCH CÁC THAM SỐ CHUNG:
 * - factory_code: Mã nhà máy
 * - ac_no: Số chứng từ AC (AC Processing Number)
 * - user_code: Mã nhân viên thực hiện
 * - language: Ngôn ngữ hiển thị thông báo (VN/EN/CN)
 */

// ============================================
// F3: ACTIVATE (生效) - Kích hoạt chứng từ
// ============================================
/*
 * MỤC ĐÍCH: Kích hoạt chứng từ gia công nhập khẩu, cập nhật tồn kho và trạng thái
 *
 * THAM SỐ:
 * - factory_code: Mã nhà máy
 * - user_code: Mã nhân viên
 * - ac_no: Số chứng từ AC
 * - language: Ngôn ngữ (VN/EN/CN)
 *
 * SQL GỐC (Oracle):
 * ```sql
 * -- Kiểm tra có detail data
 * SELECT COUNT(1) INTO V_COUNT
 * FROM AC_PROC_D
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO;
 *
 * -- Cập nhật AC_CONT_D (tồn kho hợp đồng)
 * UPDATE AC_CONT_D
 * SET USED_QTY = NVL(USED_QTY,0)+NVL(V.AC_QTY,0),
 *     STOCK_QTY = NVL(STOCK_QTY,0)-NVL(V.AC_QTY,0)
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND CONT_NO = V.IN_CONT
 * AND GOODS_CODE = V.AC_ITEMNO;
 *
 * -- Cập nhật OVER_QTY (số dư)
 * UPDATE AC_PROC_D SET OVER_QTY = NVL(AC_QTY,0)
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO;
 *
 * -- Cập nhật AC_REQ_ORDER
 * UPDATE AC_REQ_ORDER SET CHGE_QTY = REQ_ACQTY
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND REQ_NO = (SELECT REQ_NO FROM AC_REQ_M
 *               WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 *               AND INVOICE_NO = :AC_PROC_M.COM_INVOICE);
 *
 * -- Cập nhật AC_REQ_M
 * UPDATE AC_REQ_M SET AC_NO = :AC_PROC_M.AC_NO
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND INVOICE_NO = :AC_PROC_M.COM_INVOICE;
 *
 * -- Cập nhật trạng thái
 * :AC_PROC_M.STATUS := 7;
 * ```
 */
async function activateMarkB(factory_code, user_code, ac_no, language) {
  const transaction = await pool.transaction();
  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort,
        in_crate
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      throw new Error("AC_PROC_M not found");
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont, in_crate } = ac_proc_m;

    // 2. Kiểm tra có dữ liệu AC_PROC_D không
    const checkProcDSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const procDCountResult = await pool.query(checkProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procDCountResult[0].count === 0) {
      const message = await gf_mesgnm(500044, language);
      throw new Error(message);
    }

    // 3. Lấy danh sách AC_PROC_D để cập nhật AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty,
        over_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 4. Cập nhật AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) + COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) - COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 5. Cập nhật OVER_QTY = AC_QTY trong AC_PROC_D
    const updateOverQtySql = `
      UPDATE "Customs".AC_PROC_D
      SET over_qty = COALESCE(ac_qty, 0)
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateOverQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 6. Xử lý AC_REQ_ORDER và AC_REQ_M
    if (com_invoice) {
      // Cập nhật AC_REQ_ORDER
      const updateReqOrderSql = `
        UPDATE "Customs".AC_REQ_ORDER 
        SET chge_qty = req_acqty
        WHERE factory_code = :factory_code
          AND req_no = (
            SELECT req_no 
            FROM "Customs".AC_REQ_M 
            WHERE factory_code = :factory_code
              AND invoice_no = :com_invoice
          )
      `;
      await pool.query(updateReqOrderSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });

      // Cập nhật AC_REQ_M
      const updateReqMSql = `
        UPDATE "Customs".AC_REQ_M
        SET ac_no = :ac_no
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
      `;
      await pool.query(updateReqMSql, {
        replacements: { factory_code, com_invoice, ac_no },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 7. Cập nhật STATUS = 7 và LAST_USER, LAST_DATE trong AC_PROC_M
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 7,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    //13. Cập nhật total_money
    const updateTotalMoneySql = `
    UPDATE "Customs".ac_proc_m
SET 
  sum_money = sub.total_money,
  add_tax     = sub.add_tax,
  tax         = sub.tax,
  sum_qty      = sub.qty
FROM (
  SELECT 
    SUM(COALESCE(money,   0)) AS total_money,
    SUM(COALESCE(add_tax, 0)) AS add_tax,
    SUM(COALESCE(tax,     0)) AS tax,
    SUM(COALESCE(ac_qty,  0)) AS qty
  FROM "Customs".ac_proc_d
  WHERE factory_code = :factory_code
    AND ac_no        = :ac_no
    AND status > 0
) sub
WHERE "Customs".ac_proc_m.factory_code = :factory_code
  AND "Customs".ac_proc_m.ac_no        = :ac_no
    `;
    await pool.query(updateTotalMoneySql, {
      replacements: {
        factory_code,
        ac_no,
      },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    // 8. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Kích hoạt thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in activate:", error);
    throw error;
  }
}

// ============================================
// F4: CANCEL ACTIVATION (取消生效) - Hủy kích hoạt
// ============================================
/*
 * MỤC ĐÍCH: Hủy kích hoạt chứng từ, hoàn nguyên tồn kho về trạng thái trước khi kích hoạt
 *
 * THAM SỐ:
 * - factory_code: Mã nhà máy
 * - ac_no: Số chứng từ AC
 * - user_code: Mã nhân viên
 * - language: Ngôn ngữ (VN/EN/CN)
 *
 * SQL GỐC (Oracle):
 * ```sql
 * -- Kiểm tra đã sử dụng chưa
 * SELECT COUNT(*) INTO V_COUNT
 * FROM AC_PROC_D
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO
 * AND NVL(AC_QTY,0) != NVL(OVER_QTY,0);
 *
 * -- Hoàn nguyên AC_CONT_D
 * UPDATE AC_CONT_D
 * SET USED_QTY = NVL(USED_QTY,0)-NVL(V.AC_QTY,0),
 *     STOCK_QTY = NVL(STOCK_QTY,0)+NVL(V.AC_QTY,0)
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND CONT_NO = V.IN_CONT
 * AND GOODS_CODE = V.AC_ITEMNO;
 *
 * -- Hoàn nguyên OVER_QTY
 * UPDATE AC_PROC_D
 * SET OVER_QTY = DECODE(SIGN(NVL(OVER_QTY,0)-NVL(AC_QTY,0)),-1,0,NVL(OVER_QTY,0)-NVL(AC_QTY,0))
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO;
 *
 * -- Hoàn nguyên AC_REQ_ORDER
 * UPDATE AC_REQ_ORDER
 * SET CHGE_QTY = DECODE(SIGN(NVL(CHGE_QTY,0)-NVL(REQ_ACQTY,0)),-1,0,NVL(CHGE_QTY,0)-NVL(REQ_ACQTY,0))
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND REQ_NO = (SELECT REQ_NO FROM AC_REQ_M
 *               WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 *               AND INVOICE_NO = :AC_PROC_M.COM_INVOICE);
 *
 * -- Xóa AC_NO
 * UPDATE AC_REQ_M SET AC_NO = NULL
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND INVOICE_NO = :AC_PROC_M.COM_INVOICE;
 *
 * -- Cập nhật trạng thái
 * :AC_PROC_M.STATUS := 1;
 * ```
 */
async function cancelActivateMarkB(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();

  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      const message = await gf_mesgnm(500057, language);
      throw new Error(message);
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont } = ac_proc_m;

    // 2. Kiểm tra AC_QTY != OVER_QTY (đã có sử dụng thì không cho hủy)
    const checkUsedSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND COALESCE(ac_qty, 0) != COALESCE(over_qty, 0)
    `;
    const usedResult = await pool.query(checkUsedSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (usedResult[0].count > 0) {
      const message = await gf_mesgnm(500067, language);
      throw new Error(message);
    }

    // 3. Lấy danh sách AC_PROC_D để hoàn nguyên AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 4. Hoàn nguyên AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) - COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) + COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 5. Hoàn nguyên OVER_QTY
    // DECODE(SIGN(NVL(OVER_QTY,0)-NVL(AC_QTY,0)),-1,0,NVL(OVER_QTY,0)-NVL(AC_QTY,0))
    // => CASE WHEN over_qty - ac_qty < 0 THEN 0 ELSE over_qty - ac_qty END
    const updateOverQtySql = `
      UPDATE "Customs".AC_PROC_D
      SET over_qty = CASE 
        WHEN COALESCE(over_qty, 0) - COALESCE(ac_qty, 0) < 0 
        THEN 0 
        ELSE COALESCE(over_qty, 0) - COALESCE(ac_qty, 0) 
      END
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateOverQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 6. Hoàn nguyên AC_REQ_ORDER
    if (com_invoice) {
      const updateReqOrderSql = `
        UPDATE "Customs".AC_REQ_ORDER 
        SET chge_qty = CASE 
          WHEN COALESCE(chge_qty, 0) - COALESCE(req_acqty, 0) < 0 
          THEN 0 
          ELSE COALESCE(chge_qty, 0) - COALESCE(req_acqty, 0) 
        END
        WHERE factory_code = :factory_code
          AND req_no = (
            SELECT req_no 
            FROM "Customs".AC_REQ_M 
            WHERE factory_code = :factory_code
              AND invoice_no = :com_invoice
          )
      `;
      await pool.query(updateReqOrderSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });

      // 7. Xóa AC_NO trong AC_REQ_M
      const updateReqMSql = `
        UPDATE "Customs".AC_REQ_M
        SET ac_no = NULL
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
      `;
      await pool.query(updateReqMSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 8. Cập nhật STATUS = 1
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 1,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 9. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Hủy kích hoạt thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in cancelActivate:", error);
    throw error;
  }
}

// ============================================
// CLOSE CASE (結案) - Kết án
// ============================================
/*
 * MỤC ĐÍCH: Đóng/kết án chứng từ, đặt trạng thái cuối cùng
 *
 * THAM SỐ:
 * - factory_code: Mã nhà máy
 * - ac_no: Số chứng từ AC
 * - user_code: Mã nhân viên
 *
 * SQL GỐC (Oracle):
 * ```sql
 * :AC_PROC_M.STATUS := 99;
 * :AC_PROC_M.LAST_USER := :PARAMETER.P_EMPID;
 * :AC_PROC_M.LAST_DATE := SYSDATE;
 * ```
 */
async function closeMarkB(factory_code, ac_no, user_code) {
  try {
    const sql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 9,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;

    await pool.query(sql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
    });

    return {
      success: true,
      message: "Kết án chứng từ thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    console.error("Error in close:", error);
    throw error;
  }
}

// ============================================
// F5: VOID ALL (作廢) - Hủy bỏ hoàn toàn
// ============================================
/*
 * MỤC ĐÍCH: Hủy bỏ hoàn toàn chứng từ (yêu cầu có số công văn hủy - COL2)
 *
 * THAM SỐ:
 * - factory_code: Mã nhà máy
 * - ac_no: Số chứng từ AC
 * - user_code: Mã nhân viên
 * - language: Ngôn ngữ (VN/EN/CN)
 *
 * SQL GỐC (Oracle):
 * ```sql
 * -- Kiểm tra đã sử dụng chưa
 * SELECT COUNT(*) INTO V_COUNT
 * FROM AC_PROC_D
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO
 * AND NVL(AC_QTY,0) != NVL(OVER_QTY,0);
 *
 * -- Kiểm tra COL2 (số công văn hủy)
 * IF :AC_PROC_M.COL2 IS NULL THEN
 *   GP_SHOW_ALERT('MESSAGE',500107,:PARAMETER.P_CHARSET);
 *
 * -- Hoàn nguyên AC_CONT_D
 * UPDATE AC_CONT_D
 * SET USED_QTY = NVL(USED_QTY,0)-NVL(V.AC_QTY,0),
 *     STOCK_QTY = NVL(STOCK_QTY,0)+NVL(V.AC_QTY,0)
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND CONT_NO = V.IN_CONT
 * AND GOODS_CODE = V.AC_ITEMNO;
 *
 * -- Hoàn nguyên OVER_QTY
 * UPDATE AC_PROC_D
 * SET OVER_QTY = DECODE(SIGN(NVL(OVER_QTY,0)-NVL(AC_QTY,0)),-1,0,NVL(OVER_QTY,0)-NVL(AC_QTY,0))
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND AC_NO = :AC_PROC_M.AC_NO;
 *
 * -- Hoàn nguyên AC_REQ_ORDER
 * UPDATE AC_REQ_ORDER
 * SET CHGE_QTY = DECODE(SIGN(NVL(CHGE_QTY,0)-NVL(REQ_ACQTY,0)),-1,0,NVL(CHGE_QTY,0)-NVL(REQ_ACQTY,0))
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND REQ_NO = (SELECT REQ_NO FROM AC_REQ_M
 *               WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 *               AND INVOICE_NO = :AC_PROC_M.COM_INVOICE);
 *
 * -- Xóa AC_NO
 * UPDATE AC_REQ_M SET AC_NO = NULL
 * WHERE FACTORY_CODE = :AC_PROC_M.FACTORY_CODE
 * AND INVOICE_NO = :AC_PROC_M.COM_INVOICE;
 *
 * -- Cập nhật trạng thái = 0 (Hủy bỏ)
 * :AC_PROC_M.STATUS := 0;
 * ```
 */
async function voidAllMarkB(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        in_cont,
        com_invoice,
        sort,
        col2
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      const message = await gf_mesgnm(500057, charset[language]);
      const error = new Error(message);
      error.code = 500057;
      throw error;
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, sort, in_cont, col2 } = ac_proc_m;

    // 2. Kiểm tra AC_QTY != OVER_QTY (đã có sử dụng thì không cho hủy)
    const checkUsedSql = `
      SELECT COUNT(*) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND COALESCE(ac_qty, 0) != COALESCE(over_qty, 0)
    `;
    const usedResult = await pool.query(checkUsedSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (usedResult[0].count > 0) {
      const message = await gf_mesgnm(500053, charset[language]);
      const error = new Error(message);
      error.code = 500053;
      throw error;
    }

    // 3. Validate COL2 (số công văn hủy) phải có
    if (!col2) {
      const message = await gf_mesgnm(500107, charset[language]);
      const error = new Error(message);
      error.code = 500107;
      throw error;
    }

    // 4. Lấy danh sách AC_PROC_D để hoàn nguyên AC_CONT_D
    const getProcDSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        price,
        unit,
        qty,
        money,
        ac_qty
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const procDResult = await pool.query(getProcDSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 5. Hoàn nguyên AC_CONT_D - USED_QTY và STOCK_QTY
    for (const row of procDResult) {
      const updateContDSql = `
        UPDATE "Customs".AC_CONT_D
        SET used_qty = COALESCE(used_qty, 0) - COALESCE(:ac_qty, 0),
            stock_qty = COALESCE(stock_qty, 0) + COALESCE(:ac_qty, 0)
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContDSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: in_cont,
          ac_itemno: row.ac_itemno,
          ac_qty: parseFloat(row.ac_qty),
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 6. Hoàn nguyên OVER_QTY
    const updateOverQtySql = `
      UPDATE "Customs".AC_PROC_D
      SET over_qty = CASE 
        WHEN COALESCE(over_qty, 0) - COALESCE(ac_qty, 0) < 0 
        THEN 0 
        ELSE COALESCE(over_qty, 0) - COALESCE(ac_qty, 0) 
      END
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateOverQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 7. Hoàn nguyên AC_REQ_ORDER
    if (com_invoice) {
      const updateReqOrderSql = `
        UPDATE "Customs".AC_REQ_ORDER 
        SET chge_qty = CASE 
          WHEN COALESCE(chge_qty, 0) - COALESCE(req_acqty, 0) < 0 
          THEN 0 
          ELSE COALESCE(chge_qty, 0) - COALESCE(req_acqty, 0) 
        END
        WHERE factory_code = :factory_code
          AND req_no = (
            SELECT req_no 
            FROM "Customs".AC_REQ_M 
            WHERE factory_code = :factory_code
              AND invoice_no = :com_invoice
          )
      `;
      await pool.query(updateReqOrderSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });

      // 8. Xóa AC_NO trong AC_REQ_M
      const updateReqMSql = `
        UPDATE "Customs".AC_REQ_M
        SET ac_no = NULL
        WHERE factory_code = :factory_code
          AND invoice_no = :com_invoice
      `;
      await pool.query(updateReqMSql, {
        replacements: { factory_code, com_invoice },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 9. Cập nhật STATUS = 0 (Hủy bỏ)
    const updateStatusSql = `
      UPDATE "Customs".AC_PROC_M
      SET status = 0,
          last_user = :user_code,
          last_date = NOW()
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateStatusSql, {
      replacements: { factory_code, ac_no, user_code },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 10. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Hủy bỏ chứng từ thành công",
      ac_no: ac_no,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in voidAll:", error);
    throw error;
  }
}
async function checkDuplicateAcChgeno(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgeno,
  out_date,
  ac_no = null,
) {
  if (!ac_chgeno || !out_date)
    return {
      success: false,
      message: "Missing Custom Declaration Date or Custom Declaration No!",
    };

  const year = new Date(out_date).getFullYear();

  let permissionCondition = "1=1";
  let replacements = {
    factory_code,
    ac_chgeno,
    year: `${year}`,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  const excludeSelf = ac_no ? "AND ac_no != :ac_no" : "";
  if (ac_no) replacements.ac_no = ac_no;

  try {
    const sql = `
  SELECT COUNT(*) AS cnt
  FROM "Customs".AC_PROC_M
  WHERE ${permissionCondition}
    AND ac_chgeno = :ac_chgeno
    AND EXTRACT(YEAR FROM out_date) = :year
    ${excludeSelf}
`;
    // Chỉ tìm bản ghi ở các năm TRƯỚC năm của out_date
    //  Cùng năm: cho phép trùng
    //  Năm trước đã dùng rồi: báo trùng
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const count = parseInt(rows[0]?.cnt || 0);
    return {
      success: count === 0,
      count,
      ...(count > 0 && {
        message: `Code has been used in same year.`,
      }),
    };
  } catch (error) {
    console.error("Error in checkDuplicateAcChgno:", error);
    throw error;
  }
}
module.exports = {
  listAllAcProcM,
  listAllAcProcMMarkB,
  listAllAcProcMWithDetails,
  listAllAcProcMWithDetailsMarkB,
  getByID,
  createAcno,
  add,
  edit,
  deleteImp,
  search,
  searchForMarkB,
  activate,
  cancelActivate,
  close,
  voidAll,
  activateMarkB,
  cancelActivateMarkB,
  closeMarkB,
  voidAllMarkB,
  confirm,
  checkDuplicateAcChgeno,
};
