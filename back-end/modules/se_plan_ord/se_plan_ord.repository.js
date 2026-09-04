const { Op, DATE } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_PLAN_ORD = require("./se_plan_ord.model.js");
const sePlanSizeService = require("../se_plan_size/se_plan_size.service");
const { RdTempCache } = require("../rd_temp/rd_temp.js");
const sePlanOrdCache = new RdTempCache("SE_PLAN_ORD", (item1, item2) => {
  return (
    String(item1.item_no) === String(item2.item_no) &&
    String(item1.code_no) === String(item2.code_no) &&
    String(item1.name_t) === String(item2.name_t) &&
    String(item1.name_e) === String(item2.name_e) &&
    String(item1.name_s) === String(item2.name_s) &&
    parseFloat(item1.seq) === parseFloat(item2.seq)
  );
});
const textImportCache = new RdTempCache("TEXT_IMPORT", (item1, item2) => {
  return (
    String(item1.varchar01) === String(item2.varchar01) &&
    String(item1.varchar02) === String(item2.varchar02) &&
    String(item1.varchar03) === String(item2.varchar03) &&
    String(item1.varchar04) === String(item2.varchar04) &&
    String(item1.varchar05) === String(item2.varchar05)
  );
});
async function listAllSePlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = {
    vi: "S",
    en: "E",
    zh: "T",
  };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
  };

  // Permission conditions
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "A.FACTORY_CODE = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "A.GRT_DEPT = :permission_dept AND A.FACTORY_CODE = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "A.GRT_USER = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT 
        A.FACTORY_CODE,
        A.SALES_ID,
        A.SE_ID,
        A.SE_ID AS PACKING_SEID,
        B.ORI_SE_ID AS SO,
        A.SE_SEQ,
        A.SE_VER,
        A.PACK_GU,
        A.SHIP_SEQ,
        A.P_SHIPDATE,
        A.P_SHIPQTY,
        A.CBM,
        A.BOOK_NO,
        A.COLUMN4 AS ETD,
        A.COLUMN2 AS INVOICE_NO,
        B.SE_CUSTID,
        "Customs".GF_CUSTNM_J(B.ORG_ID, B.SE_CUSTID, :p_charset) AS SE_CUSTNAME,
        B.ACC_CUSTID,
        "Customs".GF_CUSTNM_J(B.ORG_ID, B.ACC_CUSTID, :p_charset) AS ACC_CUSTNAME,
        "Customs".GF_SE_CODE(B.ORG_ID, B.ORI_SE_ID, B.SE_VER, B.SE_SEQ) AS SPEC_CODE,
        A.COLUMN1,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'STOC', A.COLUMN1, :p_charset) AS COLUMN1_NAME,
        A.SEND_TYPE,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDMODE', A.SEND_TYPE, :p_charset) AS SEND_TYPENAME,
        A.SHIP_COMP,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDCOMP', A.SHIP_COMP, :p_charset) AS SHIP_COMPNAME,
        A.COL6,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SHIPDEST', A.COL6, :p_charset) AS COL6_NAME,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDMODE', B.SEND_MODE, :p_charset) AS SENDTY,
        B.SEND_MODE,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'AGENT', A.COL5, :p_charset) AS COL5_NAME,
        A.COL5,
        A.COL7,
        A.P_EXDATE,
        B.NLT,
        B.NST,
        CASE A.EX_STATUS 
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS EX_STATUS_NAME,
        A.EX_STATUS,
        A.STATUS ,
        A.LOCKED_INFORMATION,
        A.GRT_DEPT,
        "Customs".GF_DEPTNM(A.FACTORY_CODE, A.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
        A.GRT_USER,
        "Customs".GF_EMPNM(A.GRT_USER, :p_charset) AS GRT_USERNAME,
        A.GRT_DATE,
        A.LAST_USER,
        "Customs".GF_EMPNM(A.LAST_USER, :p_charset) AS LAST_USERNAME,
        A.LAST_DATE,
        A.locked_information,
        A.COLUMN3,
        A.SEND_ADDR,
        A.REMARK,
        (COALESCE(C.SUM_CTNS, 0)) AS SUM_CTNS
      FROM "Customs".SE_PLAN_ORD A
     LEFT JOIN (
    SELECT
        FACTORY_CODE,
        SE_ID,
        SE_VER,
        SE_SEQ,
        SHIP_SEQ,
        PACK_GU,
        SUM(COALESCE(CTNS, 0)) AS SUM_CTNS
    FROM "Customs".SE_PLAN_SIZE
    GROUP BY
        FACTORY_CODE,
        SE_ID,
        SE_VER,
        SE_SEQ,
        SHIP_SEQ,
        PACK_GU
) C
    ON A.FACTORY_CODE = C.FACTORY_CODE
    AND A.SE_ID = C.SE_ID
    AND A.SE_VER = C.SE_VER
    AND A.SE_SEQ = C.SE_SEQ
    AND A.SHIP_SEQ = C.SHIP_SEQ
    AND A.PACK_GU = C.PACK_GU
      INNER JOIN "pac".SD_ORD_M_C B 
        ON A.FACTORY_CODE = B.ORG_ID 
       AND A.SE_ID = B.SE_ID
       AND  A.PACK_GU = B.PACK_GU
      WHERE ${permissionCondition}
      ORDER BY A.SE_ID, A.SE_VER, A.SE_SEQ, A.SHIP_SEQ
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
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
    console.error("Error in listAllSePlanOrd:", error);
    throw error;
  }
}
async function listAllSePlanOrdDetails(
  filters,
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
) {
  let charSet = {
    vi: "S",
    en: "E",
    zh: "T",
  };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    p_sdate: filters?.s_date_1 || null,
    p_edate: filters?.e_date_1 || null,
    s_sdate: filters?.s_date_2 || null,
    s_edate: filters?.e_date_2 || null,
    s_date: filters?.s_date_3 || null,
    e_date: filters?.e_date_3 || null,
    fs_date: filters?.s_date_4 || null,
    fe_date: filters?.e_date_4 || null,
    se_id: filters?.se_id || "",
    status: filters?.status ?? null,
    cust_id: filters?.cust_id ? `%${filters.cust_id}%` : null,
    hg_stoc: filters?.hg_stoc || "",
    agent: filters?.agent || "",
    ex_status: filters?.ex_status || "",
  };

  // Permission conditions
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "C.FACTORY_CODE = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "C.GRT_DEPT = :permission_dept AND C.FACTORY_CODE = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "C.GRT_USER = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
  SELECT 
    A.FACTORY_CODE,
    A.SALES_ID,
    A.SE_ID,
    A.SE_ID AS PACKING_SEID,
    C.PK_SEQ,
    C.SIZERUN,
    C.CTNS_PAIRS,
    C.CTNS,
    COALESCE(C.CTNS_PAIRS, 0) * COALESCE(C.CTNS, 0) AS PAIRS,
    C.STATUS,
    C.GRT_DEPT,
    "Customs".GF_DEPTNM(C.FACTORY_CODE, C.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
    C.GRT_USER,
    "Customs".GF_EMPNM(C.GRT_USER, :p_charset) AS GRT_USERNAME,
    C.GRT_DATE,
    C.LAST_USER,
    "Customs".GF_EMPNM(C.LAST_USER, :p_charset) AS LAST_USERNAME,
    C.LAST_DATE
  FROM "Customs".SE_PLAN_SIZE C
  INNER JOIN "Customs".SE_PLAN_ORD A      
    ON A.FACTORY_CODE = C.FACTORY_CODE 
   AND A.SE_ID = C.SE_ID
   AND A.SE_VER = C.SE_VER
   AND A.SE_SEQ = C.SE_SEQ
   AND A.SHIP_SEQ = C.SHIP_SEQ
   AND A.PACK_GU = C.PACK_GU
  INNER JOIN "pac".SD_ORD_M_C B       
    ON B.ORG_ID = A.FACTORY_CODE 
   AND B.SE_ID = A.SE_ID
   AND B.PACK_GU = A.PACK_GU
  WHERE ${permissionCondition}
    AND A.FACTORY_CODE = :factory_code
    AND ((DATE_TRUNC('day', A.P_SHIPDATE) >= DATE_TRUNC('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
    AND  (DATE_TRUNC('day', A.P_SHIPDATE) <= DATE_TRUNC('day', :p_edate::timestamp) OR :p_edate IS NULL))
    AND ((DATE_TRUNC('day', A.P_EXDATE) >= DATE_TRUNC('day', :s_sdate::timestamp) OR :s_sdate IS NULL)
    AND  (DATE_TRUNC('day', A.P_EXDATE) <= DATE_TRUNC('day', :s_edate::timestamp) OR :s_edate IS NULL))
    AND (DATE_TRUNC('day', B.NLT) >= DATE_TRUNC('day', :s_date::timestamp) OR :s_date IS NULL)
    AND (DATE_TRUNC('day', B.NLT) <= DATE_TRUNC('day', :e_date::timestamp) OR :e_date IS NULL)
    AND (DATE_TRUNC('day', B.NST) >= DATE_TRUNC('day', :fs_date::timestamp) OR :fs_date IS NULL)
    AND (DATE_TRUNC('day', B.NST) <= DATE_TRUNC('day', :fe_date::timestamp) OR :fe_date IS NULL)
    AND (COALESCE(A.SE_ID, '')      ILIKE '%' || :se_id     || '%')
    AND (A.STATUS = :status OR :status IS NULL)
    AND ("Customs".GF_CUSTID_CUSTNO(A.FACTORY_CODE, B.SE_CUSTID) ILIKE :cust_id OR :cust_id IS NULL)
    AND (COALESCE(A.COLUMN1, '')    ILIKE '%' || :hg_stoc   || '%')
    AND (COALESCE(A.COL5, '')       ILIKE '%' || :agent     || '%')
    AND (COALESCE(A.EX_STATUS, '')  ILIKE '%' || :ex_status || '%')
  ORDER BY C.SE_ID, C.SE_VER, C.SE_SEQ, C.SHIP_SEQ
`;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in listAllSePlanOrd:", error);
    throw error;
  }
}
async function listSePlanOrdLink(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "T.FACTORY_CODE = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "T.GRT_DEPT = :permission_dept AND T.FACTORY_CODE = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "T.GRT_USER = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
      T.FACTORY_CODE,
        T.SE_ID,
        T.SE_VER,
        T.SE_SEQ,
        T.PACK_GU,
        T.SHIP_SEQ,
        X.AC_NO,
        Y.AC_CHGS,
        "Customs".GF_CUSTID_CUSTNO(
          T.FACTORY_CODE,
          "Customs".GF_SE_SECUST(T.FACTORY_CODE, Z.ORI_SE_ID, T.SE_VER)
        ) AS CUST_NO,
        "Customs".GF_CUSTNM_J(
          T.FACTORY_CODE,
          "Customs".GF_SE_SECUST(T.FACTORY_CODE, Z.ORI_SE_ID, T.SE_VER),
          :p_charset
        ) AS CUST_NAME,
        Z.PO,
        Z.PROD_NO,
        M.SPG_NO,
        M.NAME_E AS PROD_NAME,
        T.P_SHIPQTY,
        T.P_SHIPDATE,
        NULL AS SEL
      FROM "Customs".SE_PLAN_ORD T
      INNER JOIN "Customs".AC_PLAN_ORD X
        ON X.FACTORY_CODE = T.FACTORY_CODE
       AND X.SE_ID       = T.SE_ID
       AND X.SE_SEQ      = T.SE_SEQ
       AND X.SHIP_SEQ    = T.SHIP_SEQ
      INNER JOIN "Customs".VW_CHG_EXP Y
        ON Y.FACTORY_CODE = T.FACTORY_CODE
      AND Y.AC_NO        = X.AC_NO
      INNER JOIN "pac".SD_ORD_M_C Z
        ON Z.ORG_ID = T.FACTORY_CODE
       AND Z.SE_ID  = T.SE_ID
       AND Z.SE_SEQ = T.SE_SEQ::NUMERIC
      INNER JOIN "public".MM_ITEM M
        ON M.ITEM_NO = Z.PROD_NO
      WHERE ${permissionCondition}
        AND T.FACTORY_CODE = :factory_code
        AND T.STATUS > 1
        AND NOT EXISTS (
          SELECT FACTORY_CODE
          FROM "Customs".AC_CO_M
          WHERE FACTORY_CODE = T.FACTORY_CODE
            AND SE_ID        = T.SE_ID
            AND SE_VER       = T.SE_VER
            AND PACK_GU      = T.PACK_GU
            AND SE_SEQ       = T.SE_SEQ::NUMERIC
            AND SHIP_SEQ =     T.ship_seq 
        )
      ORDER BY T.SE_ID, T.SE_SEQ, T.SHIP_SEQ
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
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
    console.error("Error in listSePlanOrd:", error);
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

  if (extraField && extraField !== "undefined" && extraField !== "null") {
    permissionCondition = `${permissionCondition} AND se_id = :extraField`;
    replacements.extraField = extraField;
  }

  let sql;
  let countSql;

  if (field) {
    sql = `
     SELECT 
      DISTINCT(${field}) AS CODE_NO,
      "Customs".GF_CODE_NAME(:factory_code,'AGENT',COL5,:language) AS NAME
      FROM "Customs".SE_PLAN_ORD 
      WHERE  
      ${permissionCondition} 
        ${searchCondition}
      ORDER BY ${field}
      LIMIT :limit
      OFFSET :offset
    `;

    countSql = `
      SELECT 
      DISTINCT(${field}) AS CODE_NO,
      "Customs".GF_CODE_NAME(:factory_code,'AGENT',COL5,:language) AS NAME 
      FROM "Customs".SE_PLAN_ORD 
      WHERE
        ${permissionCondition} 
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
async function listAllPlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "a.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "a.grt_dept = :permission_dept AND a.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "a.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
        a.se_id,
        a.se_seq,
        a.pack_gu,
        a.ship_seq,
        a.p_shipdate,
        a.p_shipqty,
        b.po,
        b.prod_no,
        "Customs".gf_custid_custno(a.factory_code, b.se_custid) AS cust_no,
        "Customs".gf_custnm_j(a.factory_code, b.se_custid, :p_charset) AS custnm,
        CASE :p_charset
          WHEN 'T' THEN c.name_t
          WHEN 'S' THEN c.name_s
          ELSE c.name_e
        END AS prod_name,
        CASE :p_charset
          WHEN 'T' THEN c.color_t
          WHEN 'S' THEN c.color_s
          ELSE c.color_e
        END AS color,
        CASE a.ex_status
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS ex_status
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE ${permissionCondition}
        AND a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
      ORDER BY a.se_id, a.se_seq, a.pack_gu, a.ship_seq
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
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
    console.error("Error in listAllSePlanOrd:", error);
    throw error;
  }
}
function checkPermission(
  factory_code,
  department_code,
  user_code,
  query_level,
  tableAlias = "A",
) {
  const conditions = [];
  const replacements = {};

  if (user_code === "admin") {
    return {
      whereClause: "",
      replacements: {},
    };
  }

  if (query_level === "1" && factory_code) {
    conditions.push(`${tableAlias}.FACTORY_CODE = :permission_factory_code`);
    replacements.permission_factory_code = factory_code;
  } else if (query_level === "2" && department_code && factory_code) {
    conditions.push(`${tableAlias}.GRT_DEPT = :permission_dept`);
    conditions.push(`${tableAlias}.FACTORY_CODE = :permission_factory_code`);
    replacements.permission_dept = department_code;
    replacements.permission_factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    conditions.push(`${tableAlias}.GRT_USER = :permission_user`);
    replacements.permission_user = user_code;
  }

  return {
    whereClause: conditions.length > 0 ? "AND " + conditions.join(" AND ") : "",
    replacements: replacements,
  };
}

async function getByID(factory_code, se_id, se_ver, se_seq, pack_gu, ship_seq) {
  const acImp = await SE_PLAN_ORD.findOne({
    where: {
      factory_code: factory_code,
      se_id: se_id,
      se_ver: se_ver,
      se_seq: se_seq,
      pack_gu: pack_gu,
      ship_seq: ship_seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function createCBM(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
) {
  try {
    const checkSql = `
      SELECT COUNT(*) as count
      FROM "Customs".SE_PLAN_SIZE 
      WHERE FACTORY_CODE = :factory_code 
        AND SE_ID = :se_id 
        AND PACK_GU = :pack_gu 
        AND SE_VER = :se_ver 
        AND SE_SEQ = :se_seq 
        AND SHIP_SEQ = :ship_seq
    `;
    const checkResult = await pool.query(checkSql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu,
        se_ver,
        se_seq,
        ship_seq,
      },
      type: pool.QueryTypes.SELECT,
    });
    const hasData = checkResult[0]?.count > 0;
    let cbm = 0;
    if (hasData) {
      //  Tính từ SE_PLAN_SIZE (sau khi đã có data)
      const sumSql = `
        SELECT COALESCE(SUM(ctns), 0) * 1.03 as total_cbm
        FROM "Customs".SE_PLAN_SIZE 
        WHERE FACTORY_CODE = :factory_code 
          AND SE_ID = :se_id 
          AND PACK_GU = :pack_gu 
          AND SE_VER = :se_ver 
          AND SE_SEQ = :se_seq 
          AND SHIP_SEQ = :ship_seq
      `;
      const sumResult = await pool.query(sumSql, {
        replacements: {
          factory_code,
          se_id,
          pack_gu,
          se_ver,
          se_seq,
          ship_seq,
        },
        type: pool.QueryTypes.SELECT,
      });
      cbm = sumResult[0]?.total_cbm || 0;
    } else {
      // Tính từ SD_PACK_M (khi INSERT mới)

      // Lấy data từ SD_PACK_M
      const packSql = `
        SELECT 
          PK_SEQ,
          COALESCE(CTNS, 0) as CTNS,
          COALESCE(CBM, 0) as CBM
        FROM "pac".SD_PACK_M
        WHERE ORG_ID = :factory_code
          AND SE_ID = :se_id
          AND PACK_GU = :pack_gu
          AND SE_SEQ = :se_seq
      `;

      const packResults = await pool.query(packSql, {
        replacements: {
          factory_code,
          se_id,
          pack_gu,
          se_seq,
        },
        type: pool.QueryTypes.SELECT,
      });

      let t_cbm = 0;

      // Loop qua từng record
      for (const row of packResults) {
        // Gọi function GF_SIZE_PLAN_SHIPQTY để lấy số lượng đã ship
        const shippedQtySql = `
          SELECT "Customs".GF_SIZE_PLAN_SHIPQTY(
            :factory_code, 
            :se_id, 
            :pack_gu, 
            :se_seq,
            :pk_seq 
          ) as shipped_qty
        `;

        const shippedResult = await pool.query(shippedQtySql, {
          replacements: {
            factory_code,
            se_id,
            pack_gu: parseFloat(pack_gu),
            se_seq: se_seq,
            pk_seq: parseFloat(row.pk_seq),
          },
          type: pool.QueryTypes.SELECT,
        });

        const shippedQty = shippedResult[0]?.shipped_qty || 0;
        const t_qty = row.ctns - shippedQty;
        // Tính CBM cho record này
        const divisor = row.ctns === 0 ? 1 : row.ctns;
        const cbm_per_unit = row.cbm / divisor;
        t_cbm += cbm_per_unit * t_qty;
      }
      // Nhân với hệ số 1.03
      cbm = t_cbm * 1.03;
    }
    const finalCbm = parseFloat(cbm);

    return {
      cbm: finalCbm.toFixed(4) || 0,
    };
  } catch (error) {
    console.error("Error in calculateCBM:", error);
    throw error;
  }
}
async function createShipSeq(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  department_code,
  user_code,
  query_level,
) {
  try {
    const sql = `
      SELECT COALESCE(MAX(ship_seq), 0) + 1 as ship_seq
      FROM "Customs".SE_PLAN_ORD
      WHERE factory_code = :factory_code 
        AND SE_ID = :se_id 
        AND PACK_GU = :pack_gu	
        AND SE_SEQ = :se_seq
        AND SE_VER = :se_ver
    `;

    const rows = await pool.query(sql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu,
        se_seq,
        se_ver,
      },
      type: pool.QueryTypes.SELECT,
    });
    const ship_seq = rows[0]?.ship_seq
      ? parseFloat(parseFloat(rows[0].ship_seq).toFixed(2))
      : 1;
    return {
      ship_seq: ship_seq,
    };
  } catch (error) {
    console.error("Error in createShipSeq:", error);
    throw error;
  }
}
async function createMoney(
  factory_code,
  se_id,
  department_code,
  user_code,
  query_level,
) {
  try {
    const sql = `
      select sum(spo.p_shipqty * somc.sales_price)as money 
      from "Customs".se_plan_ord spo
      left join "pac".sd_ord_m_c somc
      on spo.se_id = somc.se_id
      and spo.factory_code = somc.org_id
      where
      spo.se_id = :se_id
    `;

    const rows = await pool.query(sql, {
        replacements: {
        se_id
      },
      type: pool.QueryTypes.SELECT,
    });
    const money = rows[0]?.money
      ? parseFloat(parseFloat(rows[0].money).toFixed(2))
      : 1;
    return {
      money: money,
    };
  } catch (error) {
    console.error("Error in createMoney:", error);
    throw error;
  }
}
async function getPosition(
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pageSize,
  t,
  permission,
) {
  let replacements = {
    ...permission.replacements,
    se_id: se_id,
    se_ver: se_ver,
    se_seq: se_seq,
    pack_gu: pack_gu,
    ship_seq: ship_seq,
  };

  try {
    const sql = `
      SELECT COUNT(*) as position
      FROM "Customs".SE_PLAN_ORD A
      INNER JOIN "pac".SD_ORD_M_C B 
        ON A.FACTORY_CODE = B.ORG_ID 
        AND A.SE_ID = B.SE_ID          -- ✅ THÊM DÒNG NÀY
        AND A.PACK_GU = B.PACK_GU
      WHERE 1=1
        ${permission.whereClause}
        AND (
          A.SE_ID < :se_id
          OR (A.SE_ID = :se_id AND A.SE_VER < :se_ver)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver AND A.SE_SEQ < :se_seq)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver 
              AND A.SE_SEQ = :se_seq AND A.SHIP_SEQ < :ship_seq)
        )
    `;
    const result = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
      transaction: t,
    });

    const position = parseInt(result[0]?.position) || 0;
    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return {
      position,
      size,
      page,
      offset,
    };
  } catch (error) {
    console.error("Error in getPosition:", error);
    throw error;
  }
}
async function getTempTable(session_id, limit, offset) {
  const sessionData = sePlanOrdCache.getAll(session_id);
  const total = sessionData.length;
  if (!limit) {
    return {
      rows: sessionData,
      total: total,
      hasMore: false,
    };
  }
  const parsedLimit = parseInt(limit);
  const parsedOffset = parseInt(offset) || 0;
  const sliced = sessionData.slice(parsedOffset, parsedOffset + parsedLimit);
  const hasMore = parsedOffset + parsedLimit < total;
  return {
    rows: sliced,
    total: total,
    hasMore: hasMore,
  };
}
async function getTempTextTable(session_id, limit, offset) {
  const sessionData = textImportCache.getAll(session_id);
  const total = sessionData.length;
  if (!limit) {
    return {
      rows: sessionData,
      total: total,
      hasMore: false,
    };
  }
  const parsedLimit = parseInt(limit);
  const parsedOffset = parseInt(offset) || 0;
  const sliced = sessionData.slice(parsedOffset, parsedOffset + parsedLimit);
  const hasMore = parsedOffset + parsedLimit < total;
  return {
    rows: sliced,
    total: total,
    hasMore: hasMore,
  };
}
async function clearTempTable(session_id) {
  sePlanOrdCache.clearSession(session_id);
  return {
    action: "Clear",
    message: "Clear temp table successfully!",
  };
}
async function checkTextItem(sessionKey, gridData) {
  try {
    const item = {
      varchar01: String(gridData?.factory_code ?? null),
      varchar02: String(gridData?.user_code ?? null),
      varchar03: String(gridData?.varchar03 ?? null),
      varchar04: String(gridData?.varchar04 ?? null),
      varchar05: String(gridData?.varchar05 ?? null),
    };
    textImportCache.save(sessionKey, item);
    return {
      action: "CHECK",
      is_check: "Y",
      message: "Add Item inside the temp table",
    };
  } catch (error) {
    throw error;
  }
}
async function clearTempTextTable(session_id) {
  textImportCache.clearSession(session_id);
  return {
    action: "Clear",
    message: "Clear temp table successfully!",
  };
}
async function confirmCheck(
  factory_code,
  department_code,
  user_code,
  session_id,
  gridData,
) {
  try {
    const sessionKey = session_id;
    const allItems = sePlanOrdCache.getAll(sessionKey);
    if (!allItems || allItems.length === 0) {
      return {
        success: false,
        message: "temp table is empty!",
      };
    }
    console.log("check the list ", allItems);

    const valueRows = allItems
      .map((item) => {
        const org_id = item.org_id ? `'${item.org_id}'` : "NULL";
        const item_no = item.item_no ? `'${item.item_no}'` : "NULL";
        const code_no = item.code_no != null ? Number(item.code_no) : "NULL";
        const name_t = item.name_t != null ? Number(item.name_t) : "NULL";
        const name_e = item.name_e != null ? Number(item.name_e) : "NULL";
        const name_s = item.name_s ? `'${item.name_s}'` : "NULL";
        const seq = item.seq != null ? Number(item.seq) : "NULL";

        return `(${org_id}, ${item_no}, ${code_no}, ${name_t}, ${name_e}, ${name_s}, ${seq})`;
      })
      .join(",\n");
    const replacements = { factory_code };
    allItems.forEach((item, idx) => {
      replacements[`org_id_${idx}`] = item.org_id;
      replacements[`item_no_${idx}`] = item.item_no;
      replacements[`code_no_${idx}`] = item.code_no;
      replacements[`name_t_${idx}`] = item.name_t;
      replacements[`name_e_${idx}`] = item.name_e;
      replacements[`name_s_${idx}`] = item.name_s;
      replacements[`seq_${idx}`] = item.seq;
    });
    const planOrdData = await pool.query(
      `SELECT 
      T.NAME_S AS AC_NO,
       O.FACTORY_CODE, 
       O.SE_ID,
        O.SE_VER,
         O.PACK_GU,
          O.SE_SEQ,
           O.SHIP_SEQ,
            O.P_SHIPQTY AS PAIRS,
             O.SEND_ADDR AS DESTINATION,
             P.ORI_SE_ID,
             P.SE_CUSTID,
             P.PO,
             P.MER_PO 
             FROM (
              VALUES ${valueRows}
            ) AS T(FACTORY_CODE, ITEM_NO, CODE_NO, NAME_T, NAME_E, NAME_S, SEQ),
             "Customs".SE_PLAN_ORD O, "pac".SD_ORD_M_C P
		          WHERE T. FACTORY_CODE =O.FACTORY_CODE
		          AND T.ITEM_NO=O.SE_ID
		          AND T.CODE_NO::NUMERIC=O.SE_VER
		          AND T.NAME_E::NUMERIC=O.SE_SEQ::NUMERIC
		          AND T.SEQ=O.SHIP_SEQ
		          AND T.NAME_T::NUMERIC=O.PACK_GU
		          AND O.FACTORY_CODE =:factory_code
		          AND O.SE_ID=P.SE_ID
		          AND O.PACK_GU=P.PACK_GU
`,
      {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      },
    );
    if (!planOrdData || planOrdData.length === 0) {
      return {
        success: false,
        message: "plan data roong",
      };
    }

    //loop each item in planorddata
    for (let item of planOrdData) {
      const coId = await pool.query(
        `select co_id
      from "Customs".ac_co_m
      where factory_code = :factory_code
      and se_id = :se_id
      and se_ver = :se_ver
      and pack_gu = :pack_gu
      and se_seq = :se_seq
      and ship_seq = :ship_seq`,
        {
          replacements: {
            factory_code: factory_code,
            se_id: item.se_id,
            se_ver: item.se_ver,
            pack_gu: item.pack_gu,
            se_seq: item.se_seq,
            ship_seq: item.ship_seq,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      let x = null;
      if (coId && coId.length > 0 && coId[0]?.co_id != null) {
        x = coId[0]?.co_id;
        continue;
      } else {
        const maxCoId = await pool.query(
          `SELECT COALESCE(MAX(CO_ID),0)+1 as max
				FROM   "Customs".AC_CO_M
				WHERE  FACTORY_CODE =:factory_code;
`,
          {
            replacements: {
              factory_code: item.factory_code,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        x = maxCoId[0]?.max;
      }
      let t_cbm = null;
      let v_boatnm = null;
      let v_etd = null;
      let v_agent = null;
      let v_dis = null;
      let t_remark = null;
      let t_custid = null;
      // 材積, 船名/航次, ETD, 船務代理, 目的港
      const sePlanOrdItem = await pool.query(
        `SELECT COALESCE(CBM,0) as t_cbm, COLUMN2, COLUMN4, COL5, COL6 
			  	FROM   "Customs".SE_PLAN_ORD 
			  	WHERE  FACTORY_CODE = :factory_code
			  	AND    SE_ID = :se_id
			  	AND    SE_VER = :se_ver
			  	AND    PACK_GU = :pack_gu			  				  	
			  	AND    SE_SEQ = :se_seq
			  	AND    SHIP_SEQ = :ship_seq
`,
        {
          replacements: {
            factory_code: item.factory_code,
            se_id: item.se_id,
            se_ver: item.se_ver,
            pack_gu: item.pack_gu,
            se_seq: item.se_seq,
            ship_seq: item.ship_seq,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      t_cbm = sePlanOrdItem[0]?.t_cbm;
      v_boatnm = sePlanOrdItem[0]?.column2;
      v_etd = sePlanOrdItem[0]?.column4;
      v_agent = sePlanOrdItem[0]?.col5;
      v_dis = sePlanOrdItem[0]?.col6;
      // remark
      const remark = await pool.query(
        `
        SELECT D.REMARK
					FROM   "Customs".SE_SHIPING_M M, "Customs".SE_SHIPING_D D
					WHERE  M.FACTORY_CODE = :factory_code
					AND    D.SI_TYPE = '1'
					AND    M.CUST_ID = D.CUST_ID
					AND    M.FACTORY_CODE = D.FACTORY_CODE
					AND    M.SI_SEQ = D.SI_SEQ;
        `,
        {
          replacements: {
            factory_code: item.factory_code,
            type: pool.QueryTypes.SELECT,
          },
        },
      );
      t_remark = remark[0]?.remark ?? null;
      // 出口報關單號
      let v_chgs = null;
      let v_elno = null;
      let v_sort = null;
      const vwChgExpItem = await pool.query(
        `
       SELECT AC_CHGS, IN_COUNTRY,SORT as v_sort 
						FROM   "Customs".VW_CHG_EXP
						WHERE  FACTORY_CODE =:factory_code
						AND    AC_NO=:ac_no;
        `,
        {
          replacements: {
            factory_code: item.factory_code,
            ac_no: item.ac_no,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      if (vwChgExpItem !== null) {
        v_chgs = vwChgExpItem[0]?.ac_chgs ?? null;
        v_elno = vwChgExpItem[0]?.in_country ?? null;
        v_sort = vwChgExpItem[0]?.v_sort ?? null;
      }
      //kyle	20120131	產 生 co資 料 時 新 增 毛 重
      let t_gross = null;
      let t_nw = null;
      const seInvDItem = await pool.query(
        `
      SELECT SUM(COALESCE(GROSS_WEIGHT,0)) as t_gross,SUM(COALESCE(NET_WEIGHT,0))  as t_nw
					FROM  "Customs".SE_INV_D
					WHERE  FACTORY_CODE = :factory_code
					AND    SE_ID = :se_id
					AND    SE_SEQ = :se_seq;

        `,
        {
          replacements: {
            factory_code: item.factory_code,
            se_id: item.se_id,
            se_seq: item.se_seq,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      if (seInvDItem !== null) {
        t_gross = seInvDItem[0]?.t_gross ?? null;
        t_nw = seInvDItem[0]?.t_nw ?? null;
      }
      // 出貨單號
      let v_shno = null;
      const vwSalesShItem = await pool.query(
        `
     SELECT MAX(M.COL2) as v_shno
			FROM   "Customs".VW_SALES_SH M, "pac".sd_sales_d D
			WHERE  M.org_id = D.org_id
			AND    M.SALES_ID = D.SALES_ID
			AND    D.org_id =:factory_code
			AND    D.SE_ID = :se_id
			AND    D.SE_SEQ = :se_seq
			AND    D.SHIP_SEQ = :ship_seq
			AND    M.STATUS > 0;

        `,
        {
          replacements: {
            factory_code: item.factory_code,
            se_id: item.se_id,
            se_seq: item.se_seq,
            pack_gu: item.pack_gu,
            ship_seq: item.ship_seq,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      v_shno = vwSalesShItem[0]?.v_shno ?? null;
      // 銷貨發票號
      let v_invoice = null;
      const invoiceData = await pool.query(
        `
          SELECT MAX(M.INVOICE_NO) as v_invoice
      FROM  "Customs".SE_INV_M M, "Customs".SE_INV_D D
      WHERE  M.FACTORY_CODE =D.FACTORY_CODE
      AND    M.INVOICE_ID=D.INVOICE_ID
      AND    M.FACTORY_CODE =:factory_code
      AND    D.SE_ID=:se_id
      AND    D.SE_SEQ=:se_seq
      AND    D.PACK_GU=:pack_gu
			AND    D.SHIP_SEQ=:ship_seq
      AND    M.STATUS > 0;
        `,
        {
          replacements: {
            factory_code: item.factory_code,
            se_id: item.se_id,
            se_seq: item.se_seq,
            pack_gu: item.pack_gu,
            ship_seq: item.ship_seq,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      v_invoice = invoiceData[0]?.v_invoice ?? null;
      let t_merpo = null;
      let t_po = null;
      //Insert into AC_CO_M
      await pool.query(
        `INSERT INTO "Customs".AC_CO_M(factory_code, CO_ID, SE_ID, SE_VER, PACK_GU, SE_SEQ, SHIP_SEQ, CUST_ID, MER_PO, PO, FA_CBM, BOAT_COMPANY, DESTINATION, BOARD_DATE, SORT, IS_PRT, NOTE, PRINT_ID, ELNO, STATUS, GRT_DEPT, GRT_USER, LAST_USER, LAST_DATE, BOAT_NAME, BY_OUT, NET_WEIGHT, GROSS, SHIP_ORDER, INVOICE_NO)
					VALUES(:factory_code, :x, :se_id, :se_ver, :pack_gu, :se_seq, :ship_seq, :t_custid, :t_merpo, :t_po, :t_cbm, :v_agent, :v_dis, :v_etd, :v_sort, 'N', :t_remark, :v_chgs,:v_elno, 1, :department_code, :user_code, :user_code, :sysdate, :v_boatnm, NULL, :t_nw, :t_gross,:v_shno, :v_invoice);
  `,
        {
          replacements: {
            factory_code: factory_code,
            x: x,
            se_id: item.se_id,
            se_ver: item.se_ver,
            pack_gu: item.pack_gu,
            se_seq: item.se_seq,
            ship_seq: item.ship_seq,
            t_custid: t_custid,
            t_merpo: t_merpo,
            t_po: t_po,
            t_cbm: t_cbm,
            v_agent: v_agent,
            v_dis: v_dis,
            v_etd: v_etd,
            v_sort: v_sort,
            t_nw: t_nw,
            v_invoice: v_invoice,
            t_gross: t_gross,
            v_shno: v_shno,
            t_remark: t_remark,
            v_chgs: v_chgs,
            v_elno: v_elno,
            department_code: department_code,
            user_code: user_code,
            sysdate: new Date(),
            v_boatnm: v_boatnm,
          },
          type: pool.QueryTypes.INSERT,
        },
      );
    }
    //return SAU KHI loop xong hết
    sePlanOrdCache.clearSession(sessionKey);
    return {
      success: true,
      message: "Success!",
      is_check: "Y",
      total_inserted: planOrdData.length,
    };
  } catch (error) {
    throw error;
  }
}
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
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
    user_code: user_code || null,
    se_id: se_id || null,
    se_ver: se_ver || null,
    se_seq: se_seq || null,
    pack_gu: pack_gu || null,
    ship_seq: ship_seq || null,
    factory_code: factory_code || null,
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
    const sql1 = `UPDATE "Customs".se_plan_size 
      SET status = 7, last_user = :user_code, last_date = NOW()
      WHERE
      factory_code  = :factory_code
      AND se_id = :se_id 
      AND se_ver = :se_ver
      AND se_seq = :se_seq
      AND pack_gu = :pack_gu
      AND ship_seq = :ship_seq
      AND status = 1 
      AND ${permissionCondition}`;

    await pool.query(sql1, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    const sql2 = `UPDATE "Customs".se_plan_ord
      SET status = 7,
      p_shipqty = totalShipQty,
          cbm = totalCbm from (
          SELECT SUM(COALESCE(CTNS_PAIRS, 0) * COALESCE(CTNS, 0)) as totalShipQty,
          (SUM(CTNS)*1.03) as totalCbm
          FROM "Customs".SE_PLAN_SIZE
          WHERE
          factory_code  = :factory_code
          AND se_id = :se_id 
          AND se_ver = :se_ver
          AND se_seq = :se_seq
          AND pack_gu = :pack_gu
          AND ship_seq = :ship_seq
          AND status > 0
          ) 
      WHERE
      factory_code  = :factory_code 
      AND se_id = :se_id 
      AND se_ver = :se_ver
      AND se_seq = :se_seq
      AND pack_gu = :pack_gu
      AND ship_seq = :ship_seq
      AND ${permissionCondition}`;

    await pool.query(sql2, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    await transaction.commit(); 

    return { success: true, message: "Confirmed successfully" };
  } catch (error) {
    await transaction.rollback(); 
    console.log("Error when update the child table", error);
    throw error;
  }
}
async function confirmItems(items, factory_code, department_code, user_code, query_level, t) {
     console.log("items",factory_code,department_code,user_code,query_level,items);
     
  if (!items || items.length === 0) {
    return { success: false, message: "No items to confirm" };
  }

  const replacements = { user_code };
  const tuples = items.map((item, i) => {
    replacements[`factory_code_${i}`] = item.factory_code;
    replacements[`se_id_${i}`] = item.se_id;
    replacements[`pack_gu_${i}`] = parseFloat(item.pack_gu);
    replacements[`se_ver_${i}`] = parseFloat(item.se_ver);
    replacements[`se_seq_${i}`] = item.se_seq;
    replacements[`ship_seq_${i}`] = parseFloat(item.ship_seq);
    return `(:factory_code_${i}, :se_id_${i}, :pack_gu_${i}, :se_ver_${i}, :se_seq_${i}, :ship_seq_${i})`;
  });
  const tupleList = tuples.join(", ");

  let permissionCondition = "1=1";
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "spo.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "spo.grt_dept = :permission_dept AND spo.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "spo.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    // 1. Confirm toàn bộ SE_PLAN_SIZE con — đơn giản, IN(...) là đủ vì không cần tính toán gì thêm
    const sql1 = `
      UPDATE "Customs".se_plan_size
      SET status = 7, last_user = :user_code, last_date = NOW()
      WHERE (factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq) IN (${tupleList})
        AND status = 1
    `;
    await pool.query(sql1, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction: t,
    });

    // 2. Confirm master + tính p_shipqty/cbm RIÊNG cho từng master
    //    targets = danh sách master cần confirm (kể cả master không có size con nào)
    //    agg = tổng size GROUP BY theo từng composite key
    //    LEFT JOIN để master không có size vẫn được confirm với 0, không bị bỏ sót
    const sql2 = `
      UPDATE "Customs".se_plan_ord AS spo
      SET status = 7,
          p_shipqty = COALESCE(agg.total_ship_qty, 0),
          cbm = COALESCE(agg.total_cbm, 0),
          last_user = :user_code,
          last_date = NOW()
      FROM (
        VALUES ${tupleList}
      ) AS targets(factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq)
      LEFT JOIN (
        SELECT
          factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq,
          SUM(COALESCE(ctns_pairs, 0) * COALESCE(ctns, 0)) AS total_ship_qty,
          SUM(ctns) * 1.03 AS total_cbm
        FROM "Customs".se_plan_size
        WHERE (factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq) IN (${tupleList})
          AND status > 0
        GROUP BY factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq
      ) AS agg
        ON agg.factory_code = targets.factory_code
       AND agg.se_id = targets.se_id
       AND agg.pack_gu = targets.pack_gu
       AND agg.se_ver = targets.se_ver
       AND agg.se_seq = targets.se_seq
       AND agg.ship_seq = targets.ship_seq
      WHERE spo.factory_code = targets.factory_code
        AND spo.se_id = targets.se_id
        AND spo.pack_gu = targets.pack_gu
        AND spo.se_ver = targets.se_ver
        AND spo.se_seq = targets.se_seq
        AND spo.ship_seq = targets.ship_seq
        AND spo.status IN (1, 2)
        AND ${permissionCondition}
    `;
    const updatedMasters = await pool.query(sql2, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction: t,
    });

    return {
      success: true,
      message: "Confirmed successfully",
      confirmed_count: updatedMasters[1] || 0,
    };
  } catch (error) {
    console.log("Cannot bulk confirm SE_PLAN_ORD from db", error);
    throw error;
  }
}
async function bulkUpdateMasterStatus(
  items,
  newStatus,
  allowedFromStatuses,
  factory_code,
  department_code,
  user_code,
  query_level,
  t,
) {
  if (!items || items.length === 0) {
    return { success: false, message: "No items to update" };
  }

  const replacements = { user_code, new_status: newStatus };

  const tuples = items.map((item, i) => {
    replacements[`factory_code_${i}`] = item.factory_code;
    replacements[`se_id_${i}`] = item.se_id;
    replacements[`pack_gu_${i}`] = item.pack_gu;
    replacements[`se_ver_${i}`] = item.se_ver;
    replacements[`se_seq_${i}`] = item.se_seq;
    replacements[`ship_seq_${i}`] = item.ship_seq;
    return `(:factory_code_${i}, :se_id_${i}, :pack_gu_${i}, :se_ver_${i}, :se_seq_${i}, :ship_seq_${i})`;
  });
  const tupleList = tuples.join(", ");

  const statusList = allowedFromStatuses
    .map((s, i) => {
      replacements[`from_status_${i}`] = s;
      return `:from_status_${i}`;
    })
    .join(", ");

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

  try {
    const sql = `
      UPDATE "Customs".se_plan_ord
      SET status = :new_status, last_user = :user_code, last_date = NOW()
      WHERE (factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq) IN (${tupleList})
        AND status IN (${statusList})
        AND ${permissionCondition}
    `;
    const updated = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction: t,
    });

    return { success: true, updated_count: updated[1] || 0 };
  } catch (error) {
    console.log("Cannot bulk update status SE_PLAN_ORD from db", error);
    throw error;
  }
}
// Wrapper riêng cho unconfirm — 7 -> 1, khớp allowedFromStatuses=[7] bên frontend
async function unconfirmItems(
  items,
  factory_code,
  department_code,
  user_code,
  query_level,
  t,
) {
  return bulkUpdateMasterStatus(
    items,
    1,
    [7],
    factory_code,
    department_code,
    user_code,
    query_level,
    t,
  );
}

async function checkItem(
  sessionKey,
  factory_code,
  gridData,
  is_check,
  filters = {},
  isAll = false,
  language,
) {
  try {
    if (isAll) {
      const { rows } = await searchLink(
        filters,
        factory_code,
        "",
        "",
        "",
        language,
        10,
        0,
        true,
      );
      if (is_check === "Y") {
        // Lưu toàn bộ vào cache
        rows.forEach((item) => {
          sePlanOrdCache.save(sessionKey, {
            org_id: item?.factory_code ?? factory_code,
            item_no: item?.se_id ?? null,
            code_no: String(item?.se_ver ?? 0),
            name_t: String(item?.pack_gu ?? 0),
            name_e: String(item?.se_seq ?? 0),
            name_s: item?.ac_no ?? null,
            seq: String(item?.ship_seq ?? 0),
          });
        });
      } else {
        // Xóa sạch cache của session
        sePlanOrdCache.cache.set(sessionKey, []);
      }

      const allItems = sePlanOrdCache.getAll(sessionKey);
      return {
        action: is_check === "Y" ? "SELECT_ALL" : "UNSELECT_ALL",
        total_selected: allItems.length,
        items: rows,
        message: is_check === "Y" ? "All items selected" : "All items cleared",
      };
    }
    if (is_check === "Y") {
      const item = {
        org_id: gridData?.factory_code ?? factory_code,
        item_no: gridData?.se_id ?? null,
        code_no: String(gridData?.se_ver ?? 0),
        name_t: String(gridData?.pack_gu ?? 0),
        name_e: String(gridData?.se_seq ?? 0),
        name_s: String(gridData?.ac_no ?? 0),
        seq: String(gridData?.ship_seq ?? 0),
      };
      sePlanOrdCache.save(sessionKey, item);
      return {
        action: "CHECK",
        is_check: "Y",
        message: "Add Item inside the temp table",
      };
    } else {
      const sessionData = sePlanOrdCache.getAll(sessionKey);

      const filtered = sessionData.filter((item) => {
        const compareFunc = sePlanOrdCache.getCompareFunction();
        const target = {
          item_no: gridData?.se_id ?? null,
          code_no: String(gridData?.se_ver ?? 0),
          name_t: String(gridData?.pack_gu ?? 0),
          name_e: String(gridData?.se_seq ?? 0),
          name_s: gridData?.ac_no ?? null,
          seq: parseFloat(gridData?.ship_seq ?? 0),
        };
        return !compareFunc(item, target);
      });

      sePlanOrdCache.cache.set(sessionKey, filtered);
      return {
        action: "UNCHECK",
        is_check: "N",
        total_selected: filtered.length,
        message: "Item removed successfully",
      };
    }
  } catch (error) {
    throw error;
  }
}
async function recreateTempT(factory_code, user_code, session_id) {
  try {
    const sessionKey = session_id;

    // 1. DELETE: xóa các item có name_t = factory_code AND name_s = user_code
    const allItems = sePlanOrdCache.getAll(sessionKey);
    const filtered = allItems.filter((item) => {
      return !(
        String(item.name_t) === String(factory_code) &&
        String(item.name_s) === String(user_code)
      );
    });
    sePlanOrdCache.cache.set(sessionKey, filtered);

    // 2. INSERT: query IV_TRANS_D lấy STOC_NO
    const sql = `
      SELECT STOC_NO
      FROM "po".iv_trans_d
      WHERE org_id = :factory_code
        AND STOC_NO IS NOT NULL
      GROUP BY STOC_NO
    `;

    const rows = await pool.query(sql, {
      replacements: { factory_code },
      type: pool.QueryTypes.SELECT,
    });

    // 3. Save từng item vào cache — chỉ set item_no, name_s, name_t; còn lại null
    for (const row of rows) {
      const item = {
        item_no: row.stoc_no,
        name_s: String(factory_code),
        name_t: String(user_code),
        org_id: null,
        code_no: null,
        name_e: null,
        seq: 0,
        col1: null,
        col2: null,
      };
      sePlanOrdCache.save(sessionKey, item);
    }

    return {
      success: true,
      message: `Recreated temp table: ${rows.length} items inserted`,
      total: rows.length,
    };
  } catch (error) {
    console.error("Error in recreateTempT:", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  sePlanOrd,
  pageSize,
  t,
) {
  try {
    // 1. Create SE_PLAN_ORD master record
    const addItemM = await SE_PLAN_ORD.create(sePlanOrd, {
      transaction: t,
    });

    console.log("SE_PLAN_ORD created:", {
      se_id: addItemM.se_id,
      ship_seq: addItemM.ship_seq,
    });

    // 2. Auto-generate SE_PLAN_SIZE detail records
    try {
      const generatedSizes = await sePlanSizeService.autoGenerate(
        addItemM.factory_code,
        addItemM.se_id,
        addItemM.pack_gu,
        addItemM.se_seq,
        addItemM.se_ver,
        addItemM.ship_seq,
        t,
      );

      console.log(
        `Auto-generated ${generatedSizes.length} SE_PLAN_SIZE records`,
      );

      // 3. Update master summary (P_SHIPQTY, CBM)
      if (generatedSizes.length > 0) {
        await sePlanSizeService.updateSPOSummary(
          addItemM.factory_code,
          addItemM.se_id,
          addItemM.pack_gu,
          addItemM.se_seq,
          addItemM.se_ver,
          addItemM.ship_seq,
          t,
        );
      }
    } catch (sizeError) {
      console.error("Error auto-generating SE_PLAN_SIZE:", sizeError);
      // Không throw error vì master đã tạo thành công
      // User có thể add size manual sau
    }

    // 4. Get position info
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const positionInfo = await getPosition(
      addItemM.se_id,
      addItemM.se_ver,
      addItemM.se_seq,
      addItemM.pack_gu,
      addItemM.ship_seq,
      pageSize,
      t,
      permission,
    );

    return {
      data: addItemM,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add se_plan_ord from db", error);
    throw error;
  }
}

async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existSPO,
  editSPO,
  pageSize,
  t,
) {
  try {
    const editItem = await existSPO.update(editSPO, { transaction: t });
    // try {
    //   await sePlanSizeService.updateSPOSummary(
    //     editItem.factory_code,
    //     editItem.se_id,
    //     editItem.pack_gu,
    //     editItem.se_seq,
    //     editItem.se_ver,
    //     editItem.ship_seq,
    //     t,
    //   );

    //   console.log("CBM updated after edit");
    // } catch (summaryError) {
    //   console.error("Error updating summary after edit:", summaryError);
    // }
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const positionInfo = await getPosition(
      editItem.se_id,
      editItem.se_ver,
      editItem.se_seq,
      editItem.pack_gu,
      editItem.ship_seq,
      pageSize,
      t,
      permission,
    );

    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit se_plan_ord from db", error);
    throw error;
  }
}
async function deleteItem(existSPO, t) {
  try {
    const deleteSizeSql = `
      DELETE FROM "Customs".SE_PLAN_SIZE
      WHERE FACTORY_CODE = :factory_code
        AND SE_ID = :se_id
        AND PACK_GU = :pack_gu
        AND SE_VER = :se_ver
        AND SE_SEQ = :se_seq
        AND SHIP_SEQ = :ship_seq
    `;
    const deletedSizes = await pool.query(deleteSizeSql, {
      replacements: {
        factory_code: existSPO.factory_code,
        se_id: existSPO.se_id,
        pack_gu: existSPO.pack_gu,
        se_ver: existSPO.se_ver,
        se_seq: existSPO.se_seq,
        ship_seq: existSPO.ship_seq,
      },
      type: pool.QueryTypes.DELETE,
      transaction: t,
    });

    console.log(`Deleted ${deletedSizes[1] || 0} SE_PLAN_SIZE records`);

    // 2. Xóa SE_PLAN_ORD master
    await existSPO.destroy({ transaction: t });

    console.log("Deleted SE_PLAN_ORD master");

    return {
      deleted_master: 1,
      deleted_sizes: deletedSizes[1] || 0,
    };
  } catch (error) {
    console.log("Cannot delete SE_PLAN_ORD from db", error);
    throw error;
  }
}
async function deleteItems(items, t) {
  try {
     if(!items || items.length === 0) {
      return {deleted_master:0, deleted_sizes:0};
     }

     const replacements = {};
     const tuples = items.map((item,i)=>{
      replacements[`factory_code_${i}`] = item.factory_code;
      replacements[`se_id_${i}`] = item.se_id;
      replacements[`pack_gu_${i}`] = item.pack_gu;
      replacements[`se_ver_${i}`] = item.se_ver;
      replacements[`se_seq_${i}`] = item.se_seq;
      replacements[`ship_seq_${i}`] = item.ship_seq;
      return `(:factory_code_${i}, :se_id_${i}, :pack_gu_${i}, :se_ver_${i}, :se_seq_${i}, :ship_seq_${i})`;
     })
     const tupleLists = tuples.join(", ");

     const deleteSizeSql = `
      DELETE FROM "Customs".SE_PLAN_SIZE
      WHERE (FACTORY_CODE, SE_ID, PACK_GU, SE_VER, SE_SEQ, SHIP_SEQ) IN (${tupleLists})
    `;
    const deletedSizes = await pool.query(deleteSizeSql, {
      replacements: replacements,
      type: pool.QueryTypes.DELETE,
      transaction: t,
    });
    const deleteMasterSql = `
      DELETE FROM "Customs".SE_PLAN_ORD
      WHERE (FACTORY_CODE, SE_ID, PACK_GU, SE_VER, SE_SEQ, SHIP_SEQ) IN (${tupleLists})
    `;
    const deletedMasters = await pool.query(deleteMasterSql, {  
      replacements: replacements,
      type: pool.QueryTypes.DELETE,
      transaction: t,
    });
    return {
      deleted_master: deletedMasters[1] || 0,
      deleted_sizes: deletedSizes[1] || 0,
    };
  } catch (error) {
    console.log("Cannot bulk delete SE_PLAN_ORD from db", error);
    throw error;
  }
}
async function getMaterialOut(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
) {
  try {
    console.log("adjkaidiadjaidiwjaijiwajd", session_id);
    // 1. Lấy data từ cache
    const rdTempItems = sePlanOrdCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.name_s) === String(factory_code) &&
          String(item.name_t) === String(user_code),
      );

    const textImportItems = textImportCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.varchar01) === String(factory_code) &&
          String(item.varchar02) === String(user_code),
      );
    const allRd = sePlanOrdCache.getAll(session_id);
    const allText = textImportCache.getAll(session_id);
    console.log("allRd[0]:", JSON.stringify(allRd[0], null, 2));
    console.log("allText[0]:", JSON.stringify(allText[0], null, 2));
    console.log("filter conditions:", { factory_code, user_code });
    if (rdTempItems.length === 0 || textImportItems.length === 0) {
      console.log("dang bi rong");

      return [];
    }
    // 2. Build IN list cho RD_TEMP (STOC_NO)
    const stocNoList = rdTempItems
      .map((item) => `'${item.item_no}'`)
      .join(", ");
    // 3. Build VALUES cho TEXT_IMPORT
    const textImportValues = textImportItems
      .map(
        (item) => `(
        '${item.varchar03}',
        '${item.varchar04}',
        ${item.varchar05 ?? 0}
      )`,
      )
      .join(",\n");
    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      user_code,
      item_no: filters.item_no ? `${filters.item_no}%` : "%",
      s_transdate: filters.s_date_1 || null,
      e_transdate: filters.e_date_1 || null,
      s_se_id: filters.s_number_1 || null,
      e_se_id: filters.e_number_1 || null,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "B.org_id = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "B.org_id = :factory_code AND B.GRT_DEPT = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "B.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT 
        B.ITEM_NO,
        B.org_id,
        B.STOC_NO,
        B.TRANS_TYPE,
        NULL AS SPECIAL_INVENTORY,
        B.TRANS_NO AS MATERIAL_FILE,
        B.TRANS_SEQ AS MATERIAL_FILE_ITEM,
        B.TRANS_DATE,
        COALESCE(NULLIF(B.OUT_QTY, 0), B.IN_QTY) AS OUT_QTY,
        B.UNIT,
        B.COL1 AS WORK_ORDER_NO,
        B.COL3 AS PO,
        B.AMOUNT AS AMOUNT,
        C.NAME_E,
        NULL AS TRANS_TYPE_TEXT,
        B.ITEM_TEXT
      FROM "po".iv_trans_d B
      LEFT JOIN "public".MM_ITEM C ON B.ITEM_NO = C.ITEM_NO
      INNER JOIN "Customs".SAP_TRANS_TYPE D
        ON B.org_id = D.org_id
        AND B.TRANS_TYPE = D.TYPE_NO
        AND COALESCE(D.MATERIAL_OUT, 'N') = 'Y'
      WHERE ${permissionCondition}
        AND B.org_id = :factory_code
        AND (B.TRANS_DATE BETWEEN DATE_TRUNC('day', :s_transdate::timestamp)
                               AND DATE_TRUNC('day', :e_transdate::timestamp)
             OR :s_transdate IS NULL)
        AND B.ITEM_NO ILIKE :item_no
        AND B.STOC_NO IN (${stocNoList})
        AND (COALESCE(B.OUT_QTY, 0) <> 0 OR COALESCE(B.IN_QTY, 0) <> 0)
        AND EXISTS (
          SELECT 1
          FROM "Customs".SE_BOM_SIZE_D X
         INNER JOIN (
            VALUES ${textImportValues}
          ) AS Y(varchar03, varchar04, varchar05)
            ON X.SE_ID  = Y.varchar03
            AND X.SE_VER = Y.varchar05::NUMERIC
            AND X.SE_SEQ = Y.varchar04::NUMERIC
          WHERE X.ORG_ID     = :factory_code
            AND X.SAP_AUFNR  = B.COL1
           AND X.ITEM_NO    = B.ITEM_NO
           AND (:s_se_id IS NULL OR X.SE_ID >= :s_se_id)
           AND (:e_se_id IS NULL OR X.SE_ID <= :e_se_id)
        )
      ORDER BY B.FACTORY_CODE, B.STOC_NO, B.TRANS_TYPE, B.ITEM_NO, C.NAME_E
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const excelRows = [];

    for (const row of rows) {
      // Step 1: AC_ITEM_M + AC_ITEM_REF theo I.ITEM_NO
      let acItem = {
        item_acno: null,
        ac_unit: null,
        ref_item_no: null,
        formula: null,
      };
      try {
        const acRows = await pool.query(
          `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
       FROM "Customs".AC_ITEM_M X
       INNER JOIN "Customs".AC_ITEM_REF Y
         ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
       WHERE Y.ORG_ID = :factory_code
         AND Y.ITEM_NO = :item_no
       LIMIT 1`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        if (acRows.length > 0) {
          acItem = {
            item_acno: acRows[0].item_acno,
            ac_unit: acRows[0].unit,
            ref_item_no: acRows[0].item_no,
            formula: acRows[0].formula,
          };
        }
      } catch (_) {}

      // Step 2: MIN(SE_ID) từ SE_BOM_SIZE_D theo SAP_AUFNR
      let seid = null;
      try {
        const seidRows = await pool.query(
          `SELECT MIN(SE_ID) AS se_id
       FROM "Customs".SE_BOM_SIZE_D
       WHERE ORG_ID = :factory_code
         AND SAP_AUFNR = :work_order_no`,
          {
            replacements: { factory_code, work_order_no: row.work_order_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        seid = seidRows[0]?.se_id ?? null;
      } catch (_) {}

      // Step 3: fallback SE_ID từ SF_DRAW_M + WK_ORD_M nếu seid null
      if (!seid) {
        try {
          const drawRows = await pool.query(
            `SELECT MIN(B.SE_ID) AS se_id
         FROM "wk".SF_DRAW_M A
         INNER JOIN "wk".WK_ORD_M B
           ON A.ORG_ID = B.ORG_ID AND A.WK_ID = B.WK_ID
         WHERE A.ORG_ID = :factory_code
           AND :item_text ILIKE '%' || A.DRAW_NO || '%'
           AND A.STATUS > 1
           AND B.STATUS > 1`,
            {
              replacements: { factory_code, item_text: row.item_text ?? "" },
              type: pool.QueryTypes.SELECT,
            },
          );
          seid = drawRows[0]?.se_id ?? null;
        } catch (_) {}
      }

      // Push main row
      excelRows.push({ ...row, ...acItem, seid, is_sub: false });

      // Step 4: Sub-materials từ mxcp.pp_011c (hierarchical → dùng WITH RECURSIVE thay connect by)
      let subMaterials = [];
      try {
        subMaterials = await pool.query(
          `WITH RECURSIVE bom AS (
         SELECT 1 AS seq, B.IDNRK AS item_no, B.MENGE/10 AS rate, B.MEINS AS unit, B.MATNR, B.CREATE_DATE
         FROM "mxcp".PP_011C B
         WHERE B.WERKS = :factory_code AND B.MATNR = :item_no
         UNION ALL
         SELECT bom.seq + 1, B.IDNRK, B.MENGE/10, B.MEINS, B.MATNR, B.CREATE_DATE
         FROM "mxcp".PP_011C B
         INNER JOIN bom ON B.MATNR = bom.item_no
         WHERE B.WERKS = :factory_code
       )
       SELECT DISTINCT bom.seq, bom.item_no, bom.rate, bom.unit, C.NAME_E, bom.create_date
       FROM bom
       LEFT JOIN "public".MM_ITEM C ON bom.item_no = C.ITEM_NO
       ORDER BY 1, bom.item_no ASC, bom.create_date DESC`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
      } catch (_) {}

      // Step 5: loop sub-materials, dedup by item_no
      const seen = new Set();
      for (const sub of subMaterials) {
        if (seen.has(sub.item_no)) continue;
        seen.add(sub.item_no);

        // AC_ITEM_M + AC_ITEM_REF theo J.ITEM_NO
        let subAcItem = {
          item_acno: null,
          ac_unit: null,
          ref_item_no: null,
          formula: null,
        };
        try {
          const subAcRows = await pool.query(
            `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
         FROM "Customs".AC_ITEM_M X
         INNER JOIN "Customs".AC_ITEM_REF Y
           ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
         WHERE Y.ORG_ID = :factory_code
           AND Y.ITEM_NO = :item_no
         LIMIT 1`,
            {
              replacements: { factory_code, item_no: sub.item_no },
              type: pool.QueryTypes.SELECT,
            },
          );
          if (subAcRows.length > 0) {
            subAcItem = {
              item_acno: subAcRows[0].item_acno,
              ac_unit: subAcRows[0].unit,
              ref_item_no: subAcRows[0].item_no,
              formula: subAcRows[0].formula,
            };
          }
        } catch (_) {}

        excelRows.push({ ...row, ...sub, ...subAcItem, seid, is_sub: true });
      }
    }

    return excelRows;
  } catch (error) {
    console.error("Error in getMaterialOut:", error);
    throw error;
  }
}
async function getPeriodEndMaterial(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
) {
  try {
    const rdTempItems = sePlanOrdCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.name_s) === String(factory_code) &&
          String(item.name_t) === String(user_code),
      );
    const textImportItems = textImportCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.varchar01) === String(factory_code) &&
          String(item.varchar02) === String(user_code),
      );

    if (rdTempItems.length === 0 || textImportItems.length === 0) return [];

    const stocNoList = rdTempItems
      .map((item) => `'${item.item_no}'`)
      .join(", ");
    const textImportValues = textImportItems
      .map(
        (item) =>
          `('${item.varchar03}', '${item.varchar04}', ${item.varchar05 ?? 0})`,
      )
      .join(",\n");

    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      user_code,
      item_no: filters.item_no ? `${filters.item_no}%` : "%",
      s_transdate: filters.s_date_1 || null,
      e_transdate: filters.e_date_1 || null,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "B.FACTORY_CODE = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "B.FACTORY_CODE = :factory_code AND B.GRT_DEPT = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "B.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
        B.ITEM_NO,
        B.org_id,
        B.STOC_NO,
        B.TRANS_TYPE,
        B.TRANS_NO    AS MATERIAL_FILE,
        B.TRANS_SEQ   AS MATERIAL_FILE_ITEM,
        B.TRANS_DATE,
        COALESCE(NULLIF(B.OUT_QTY, 0), B.IN_QTY) AS OUT_QTY,
        B.UNIT,
        B.COL1        AS WORK_ORDER_NO,
        B.COL3        AS PO,
        B.AMOUNT,
        C.NAME_E,
        B.ITEM_TEXT
      FROM "po".iv_trans_d B
      LEFT JOIN "public".MM_ITEM C ON B.ITEM_NO = C.ITEM_NO
      INNER JOIN "Customs".SAP_TRANS_TYPE D
        ON B.FACTORY_CODE = D.FACTORY_CODE
        AND B.TRANS_TYPE = D.TYPE_NO
        AND COALESCE(D.MATERIAL_OUT, 'N') = 'Y'
      WHERE ${permissionCondition}
        AND B.FACTORY_CODE = :factory_code
        AND (B.TRANS_DATE BETWEEN DATE_TRUNC('day', :s_transdate::timestamp)
                               AND DATE_TRUNC('day', :e_transdate::timestamp)
             OR :s_transdate IS NULL)
        AND B.ITEM_NO ILIKE :item_no
        AND B.STOC_NO IN (${stocNoList})
        AND (COALESCE(B.OUT_QTY, 0) <> 0 OR COALESCE(B.IN_QTY, 0) <> 0)
        AND EXISTS (
          SELECT 1
          FROM "Customs".SE_BOM_SIZE_D X
          INNER JOIN (VALUES ${textImportValues}) AS Y(varchar03, varchar04, varchar05)
            ON X.SE_ID  = Y.varchar03
            AND X.SE_VER = Y.varchar05::NUMERIC
            AND X.SE_SEQ = Y.varchar04::NUMERIC
          WHERE X.ORG_ID    = :factory_code
            AND X.SAP_AUFNR = B.COL1
            AND X.ITEM_NO   = B.ITEM_NO
        )
      ORDER BY B.FACTORY_CODE, B.STOC_NO, B.TRANS_TYPE, B.ITEM_NO, C.NAME_E
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const excelRows = [];

    for (const row of rows) {
      // Step 1: V_WK_PARIS từ pp_019a
      let wk_paris = null;
      try {
        const wkRows = await pool.query(
          `SELECT MAX(COALESCE(GAMNG, 0) + COALESCE(GASMG, 0)) AS wk_paris
           FROM "mxcp".PP_019A
           WHERE AUFNR = :work_order_no
             AND WERKS = :factory_code
             AND CREATE_DATE = (
               SELECT MAX(CREATE_DATE) FROM "mxcp".PP_019A
               WHERE AUFNR = :work_order_no AND WERKS = :factory_code
             )`,
          {
            replacements: { factory_code, work_order_no: row.work_order_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        wk_paris = wkRows[0]?.wk_paris ?? null;
      } catch (_) {}

      // Step 2: V_SHIP_PARIS từ pp_026out2
      let ship_paris = null;
      try {
        const shipRows = await pool.query(
          `SELECT SUM(COALESCE(LMNGA, 0) + COALESCE(XMNGA, 0)) AS ship_paris
           FROM "mxcp".PP_026OUT2
           WHERE (WERKS, AUFNR, BUDAT, STEUS, SAP_PROC_DATETIME) IN (
             SELECT WERKS, AUFNR, BUDAT, STEUS, MAX(SAP_PROC_DATETIME)
             FROM "mxcp".PP_026OUT2
             WHERE WERKS = :factory_code
               AND AUFNR = :work_order_no
               AND STEUS = 'PP99'
             GROUP BY WERKS, AUFNR, BUDAT, STEUS
           )`,
          {
            replacements: { factory_code, work_order_no: row.work_order_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        ship_paris = shipRows[0]?.ship_paris ?? null;
      } catch (_) {}

      // Step 3: AC_ITEM_M + AC_ITEM_REF theo I.ITEM_NO
      let acItem = {
        item_acno: null,
        ac_unit: null,
        ref_item_no: null,
        formula: null,
      };
      try {
        const acRows = await pool.query(
          `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
           FROM "Customs".AC_ITEM_M X
           INNER JOIN "Customs".AC_ITEM_REF Y
             ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
           WHERE Y.ORG_ID = :factory_code AND Y.ITEM_NO = :item_no
           LIMIT 1`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        if (acRows.length > 0) {
          acItem = {
            item_acno: acRows[0].item_acno,
            ac_unit: acRows[0].unit,
            ref_item_no: acRows[0].item_no,
            formula: acRows[0].formula,
          };
        }
      } catch (_) {}

      // Step 4: SF_DRAW_M + WK_ORD_M + SF_DRAW_D + SF_DRAW_S
      let seid = null,
        sever = null,
        seseq = null,
        sizeno = null,
        needqty = null;
      try {
        const drawRows = await pool.query(
          `SELECT MIN(B.SE_ID)           AS se_id,
                  MIN(COALESCE(B.SE_VER,1)) AS se_ver,
                  MIN(B.SE_SEQ)          AS se_seq,
                  MIN(D.SIZE_NO)         AS size_no,
                  SUM(COALESCE(D.REQ_QTY,0)) AS need_qty
           FROM "wk".SF_DRAW_M A
           INNER JOIN "wk".WK_ORD_M B ON A.ORG_ID = B.ORG_ID AND A.WK_ID = B.WK_ID
           INNER JOIN "wk".SF_DRAW_D C ON A.ORG_ID = C.ORG_ID AND A.DRAW_ID = C.DRAW_ID
           INNER JOIN "wk".SF_DRAW_S D ON C.ORG_ID = D.ORG_ID AND C.DRAW_ID = D.DRAW_ID AND C.ITEM_ID = D.ITEM_ID
           WHERE A.ORG_ID = :factory_code
             AND :item_text ILIKE '%' || A.DRAW_NO || '%'
             AND A.STATUS > 1 AND B.STATUS > 1
             AND D.ITEM_NO = :item_no
             AND D.SAP_AUFNR = :work_order_no`,
          {
            replacements: {
              factory_code,
              item_no: row.item_no,
              item_text: row.item_text ?? "",
              work_order_no: row.work_order_no,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        seid = drawRows[0]?.se_id ?? null;
        sever = drawRows[0]?.se_ver ?? null;
        seseq = drawRows[0]?.se_seq ?? null;
        sizeno = drawRows[0]?.size_no ?? null;
        needqty = drawRows[0]?.need_qty ?? null;
      } catch (_) {}

      // Step 5: fallback SE_BOM_SIZE_D nếu seid null
      if (!seid) {
        try {
          const bomRows = await pool.query(
            `SELECT MIN(SE_ID)              AS se_id,
                    MIN(COALESCE(SE_VER,1)) AS se_ver,
                    MIN(SE_SEQ)             AS se_seq,
                    MIN(SIZE_NO)            AS size_no,
                    SUM(COALESCE(NEED_QTY,0)) AS need_qty
             FROM "Customs".SE_BOM_SIZE_D
             WHERE ORG_ID     = :factory_code
               AND SAP_AUFNR  = :work_order_no
               AND ITEM_NO    = :item_no`,
            {
              replacements: {
                factory_code,
                work_order_no: row.work_order_no,
                item_no: row.item_no,
              },
              type: pool.QueryTypes.SELECT,
            },
          );
          seid = bomRows[0]?.se_id ?? null;
          sever = bomRows[0]?.se_ver ?? null;
          seseq = bomRows[0]?.se_seq ?? null;
          sizeno = bomRows[0]?.size_no ?? null;
          needqty = bomRows[0]?.need_qty ?? null;
        } catch (_) {}
      }

      // Step 6: se_ord_size → V_SEQTY
      let seqty = null;
      if (seid) {
        try {
          const seqtyRows = await pool.query(
            `SELECT COALESCE(SE_QTY, 0) AS se_qty
             FROM "Customs".SE_ORD_SIZE
             WHERE ORG_ID   = :factory_code
               AND SE_ID    = :seid
               AND COALESCE(SE_VER, 1) = COALESCE(:sever, 1)
               AND SE_SEQ   = :seseq
               AND SIZE_NO  = :sizeno
             LIMIT 1`,
            {
              replacements: { factory_code, seid, sever, seseq, sizeno },
              type: pool.QueryTypes.SELECT,
            },
          );
          seqty = seqtyRows[0]?.se_qty ?? null;
        } catch (_) {}
      }

      // Push main row
      excelRows.push({
        ...row,
        ...acItem,
        wk_paris,
        ship_paris,
        seid,
        sever,
        seseq,
        sizeno,
        needqty,
        seqty,
        is_sub: false,
      });

      // Step 7: Sub-materials từ pp_011b (khác 152 dùng pp_011c)
      let subMaterials = [];
      try {
        subMaterials = await pool.query(
          `WITH RECURSIVE bom AS (
             SELECT 1 AS seq, B.IDNRK AS item_no, B.MENGE/10 AS rate, B.MEINS AS unit, B.MATNR, B.CREATE_DATE
             FROM "mxcp".PP_011B B
             WHERE B.WERKS = :factory_code AND B.MATNR = :item_no
             UNION ALL
             SELECT bom.seq + 1, B.IDNRK, B.MENGE/10, B.MEINS, B.MATNR, B.CREATE_DATE
             FROM "mxcp".PP_011B B
             INNER JOIN bom ON B.MATNR = bom.item_no
             WHERE B.WERKS = :factory_code
           )
           SELECT DISTINCT bom.seq, bom.item_no, bom.rate, bom.unit, C.NAME_E, bom.create_date
           FROM bom
           LEFT JOIN "public".MM_ITEM C ON bom.item_no = C.ITEM_NO
           ORDER BY 1, bom.item_no ASC, bom.create_date DESC`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
      } catch (_) {}

      const seen = new Set();
      for (const sub of subMaterials) {
        if (seen.has(sub.item_no)) continue;
        seen.add(sub.item_no);

        let subAcItem = {
          item_acno: null,
          ac_unit: null,
          ref_item_no: null,
          formula: null,
        };
        try {
          const subAcRows = await pool.query(
            `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
             FROM "Customs".AC_ITEM_M X
             INNER JOIN "Customs".AC_ITEM_REF Y
               ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
             WHERE Y.ORG_ID = :factory_code AND Y.ITEM_NO = :item_no
             LIMIT 1`,
            {
              replacements: { factory_code, item_no: sub.item_no },
              type: pool.QueryTypes.SELECT,
            },
          );
          if (subAcRows.length > 0) {
            subAcItem = {
              item_acno: subAcRows[0].item_acno,
              ac_unit: subAcRows[0].unit,
              ref_item_no: subAcRows[0].item_no,
              formula: subAcRows[0].formula,
            };
          }
        } catch (_) {}

        excelRows.push({
          ...row,
          ...sub,
          ...subAcItem,
          wk_paris,
          ship_paris,
          seid,
          sever,
          seseq,
          sizeno,
          needqty,
          seqty,
          is_sub: true,
        });
      }
    }

    return excelRows;
  } catch (error) {
    console.error("Error in getPeriodEndMaterial:", error);
    throw error;
  }
}

async function getShipOrder(
  session_id,
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
) {
  try {
    // 1. Lấy data từ cache (giữ nguyên)
    const rdTempItems = sePlanOrdCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.name_s) === String(factory_code) &&
          String(item.name_t) === String(user_code),
      );

    const textImportItems = textImportCache
      .getAll(session_id)
      .filter(
        (item) =>
          String(item.varchar01) === String(factory_code) &&
          String(item.varchar02) === String(user_code),
      );

    if (rdTempItems.length === 0 || textImportItems.length === 0) {
      return [];
    }

    // 2. Build IN list cho RD_TEMP (STOC_NO) — từ sf_draw_m.stoc_no
    const stocNoList = rdTempItems
      .map((item) => `'${item.item_no}'`)
      .join(", ");

    // 3. Build VALUES cho TEXT_IMPORT (varchar03=ori_se_id, varchar04=se_seq, varchar05=se_ver)
    const textImportValues = textImportItems
      .map(
        (item) => `(
        '${item.varchar03}',
        ${item.varchar05 ?? 1},
        ${item.varchar04 ?? 0}
      )`,
      )
      .join(",\n");

    // 4. Permission condition — áp dụng trên B (sf_draw_m)
    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      user_code,
      item_no: filters.item_no ? `${filters.item_no}%` : "%",
      s_transdate: filters.s_date_1 || null,
      e_transdate: filters.e_date_1 || null,
      s_se_id: filters.s_number_1 || null,
      e_se_id: filters.e_number_1 || null,
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "A.FACTORY_CODE = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "A.FACTORY_CODE = :factory_code AND A.GRT_DEPT = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "A.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    // 5. Main query — theo đúng cấu trúc Oracle SQL mẫu, chuyển sang PostgreSQL
    //    Oracle: se_plan_ord A, sd_ord_m_c F, sf_draw_m B, sf_draw_d C, sf_draw_s D, rd_item E
    //    DATE filter: a.p_shipdate BETWEEN trunc(s_transdate) AND trunc(e_transdate)
    //    STOC_NO IN (RD_TEMP), TEXT_IMPORT dùng VALUES inline
    const sql = `
      SELECT
        A.FACTORY_CODE,
        A.SE_ID,
        C.ITEM_NO,
        E.NAME_E,
        D.SIZE_NO,
        B.WK_ID,
        B.DRAW_NO,
        B.STOC_NO,
        B.DRAW_TYPE,
        B.REQ_DATE,
        B.DRAW_DATE,
        B.STATUS,
        B.COLUMN1,
        D.REQ_QTY,
        D.DRAW_QTY,
        E.UNIT,
        C.SAP_SORTF,
        D.SAP_AUFNR,
        D.SAP_WK_POSNR,
        D.RSNUM,
        D.RSPOS,
        COALESCE(A.SE_VER, 1)  AS SE_VER,
        A.SE_SEQ,
        A.SHIP_SEQ,
        A.PACK_GU,
        D.PART_NO
      FROM "Customs".SE_PLAN_ORD A
      INNER JOIN "pac".SD_ORD_M_C F
        ON F.ORG_ID = A.FACTORY_CODE
        AND F.SE_ID  = A.SE_ID
        AND F.PACK_GU = A.PACK_GU
      INNER JOIN "wk".SF_DRAW_M B
        ON B.ORG_ID = F.ORG_ID
        AND B.WK_ID ILIKE F.ORI_SE_ID || '%'
      INNER JOIN "wk".SF_DRAW_D C
        ON C.ORG_ID  = B.ORG_ID
        AND C.DRAW_ID = B.DRAW_ID
      INNER JOIN "wk".SF_DRAW_S D
        ON D.ORG_ID  = C.ORG_ID
        AND D.DRAW_ID = C.DRAW_ID
        AND D.ITEM_ID = C.ITEM_ID
      LEFT JOIN "public".RD_ITEM E
        ON E.ITEM_NO = C.ITEM_NO
      WHERE ${permissionCondition}
        AND (
          A.P_SHIPDATE BETWEEN DATE_TRUNC('day', :s_transdate::timestamp)
                           AND DATE_TRUNC('day', :e_transdate::timestamp)
          OR :s_transdate IS NULL
        )
        AND C.ITEM_NO ILIKE :item_no
        AND B.STOC_NO IN (${stocNoList})
        AND (D.REQ_QTY <> 0 OR D.DRAW_QTY <> 0)
        AND (F.ORI_SE_ID, COALESCE(A.SE_VER, 1), A.SE_SEQ) IN (
          SELECT Y.col1, Y.col2, Y.col3
          FROM (
            VALUES ${textImportValues}
          ) AS Y(col1, col2, col3)
        )
        AND (:s_se_id IS NULL OR A.SE_ID >= :s_se_id)
        AND (:e_se_id IS NULL OR A.SE_ID <= :e_se_id)
      ORDER BY A.FACTORY_CODE, A.SE_ID, C.ITEM_NO, D.SIZE_NO, B.WK_ID, B.DRAW_NO
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const excelRows = [];

    for (const row of rows) {
      // ── Step 1: Aggregate IV_TRANS_D theo sap_aufnr + item_no (vòng FOR J trong Oracle) ──
      let v_sap_outqty = 0;
      let v_sap_unit = "";
      let v_gr_no = "";
      let v_gr_item = "";
      let v_cur_no = "";
      let v_money = 0;
      let v_trans_type = "";
      let v_trans_date = row.draw_date ?? null;

      try {
        const transRows = await pool.query(
          `SELECT OUT_QTY, UNIT, TRANS_NO AS GR_NO, CAST(TRANS_SEQ AS VARCHAR) AS GR_ITEM,
                  CUR_NO, MONEY, TRANS_TYPE, TRANS_DATE
           FROM "Customs".IV_TRANS_D
           WHERE COL1    = :sap_aufnr
             AND ITEM_NO = :item_no
             AND ORG_ID  = :factory_code`,
          {
            replacements: {
              factory_code,
              item_no: row.item_no,
              sap_aufnr: row.sap_aufnr,
            },
            type: pool.QueryTypes.SELECT,
          },
        );

        for (const j of transRows) {
          // trans_date fallback
          if (j.trans_date != null && v_trans_date == null) {
            v_trans_date = j.trans_date;
          }
          v_sap_outqty += j.out_qty ?? 0;
          v_sap_unit = j.unit ?? v_sap_unit;
          v_cur_no = j.cur_no ?? v_cur_no;
          v_money += j.money ?? 0;

          // GR_NO — concat không trùng, tối đa 2000 ký tự
          if (j.gr_no) {
            if (!v_gr_no) {
              v_gr_no = j.gr_no;
            } else if (
              v_gr_no.length + 3 + j.gr_no.length < 2000 &&
              !v_gr_no.includes(j.gr_no)
            ) {
              v_gr_no += " ; " + j.gr_no;
            }
          }
          // GR_ITEM
          if (j.gr_item) {
            if (!v_gr_item) {
              v_gr_item = j.gr_item;
            } else if (
              v_gr_item.length + 3 + j.gr_item.length < 2000 &&
              !v_gr_item.includes(j.gr_item)
            ) {
              v_gr_item += " ; " + j.gr_item;
            }
          }
          // TRANS_TYPE
          if (j.trans_type) {
            if (!v_trans_type) {
              v_trans_type = j.trans_type;
            } else if (
              v_trans_type.length + 3 + j.trans_type.length < 2000 &&
              !v_trans_type.includes(j.trans_type)
            ) {
              v_trans_type += " ; " + j.trans_type;
            }
          }
        }
      } catch (_) {}

      // ── Step 2: SHIP_QTY từ se_plan_size × sd_pack_d ──
      let v_ship_qty = 0;
      try {
        const shipRows = await pool.query(
          `SELECT COALESCE(SUM(COALESCE(Y.PAIRS, 0) * COALESCE(X.CTNS, 0)), 0) AS ship_qty
           FROM "Customs".SE_PLAN_SIZE X
           INNER JOIN "pac".SD_PACK_D Y
             ON X.ORG_ID  = Y.ORG_ID
             AND X.SE_ID   = Y.SE_ID
             AND COALESCE(X.SE_VER, 1) = COALESCE(Y.SE_VER, 1)
             AND X.SE_SEQ  = Y.SE_SEQ
             AND X.PACK_GU = Y.PACK_GU
             AND X.PK_SEQ  = Y.PK_SEQ
             AND Y.SIZE_NO = :size_no
           WHERE X.ORG_ID   = :factory_code
             AND X.SE_ID    = :se_id
             AND COALESCE(X.SE_VER, 1) = :se_ver
             AND X.SE_SEQ   = :se_seq
             AND X.SHIP_SEQ = :ship_seq
             AND X.PACK_GU  = :pack_gu`,
          {
            replacements: {
              factory_code,
              se_id: row.se_id,
              se_ver: row.se_ver,
              se_seq: row.se_seq,
              ship_seq: row.ship_seq,
              pack_gu: row.pack_gu,
              size_no: row.size_no,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_ship_qty = shipRows[0]?.ship_qty ?? 0;
      } catch (_) {}

      // ── Step 3: SE_QTY từ sd_ord_size ──
      let v_se_qty = null;
      try {
        const seQtyRows = await pool.query(
          `SELECT COALESCE(SE_QTY, 0) AS se_qty
           FROM "pac".SD_ORD_SIZE
           WHERE ORG_ID = :factory_code
             AND (
               (:se_id NOT ILIKE '%-%' AND SE_ID = :se_id)
               OR
               (:se_id ILIKE '%-%' AND :se_id ILIKE SE_ID || '%')
             )
             AND COALESCE(SE_VER, 1) = :se_ver
             AND SE_SEQ  = :se_seq
             AND SIZE_NO = :size_no
           LIMIT 1`,
          {
            replacements: {
              factory_code,
              se_id: row.se_id,
              se_ver: row.se_ver,
              se_seq: row.se_seq,
              size_no: row.size_no,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_se_qty = seQtyRows[0]?.se_qty ?? null;
      } catch (_) {}

      // ── Step 4: ISTAT + GAMNG từ pp_019a ──
      let v_istat = null;
      let v_gamng = 0;
      try {
        const pp019Rows = await pool.query(
          `SELECT MIN(ISTAT) AS istat,
                  MAX(COALESCE(GAMNG, 0) + COALESCE(GASMG, 0)) AS gamng
           FROM "mxcp".PP_019A
           WHERE AUFNR = :sap_aufnr
             AND WERKS  = :factory_code
             AND CREATE_DATE = (
               SELECT MAX(CREATE_DATE)
               FROM "mxcp".PP_019A
               WHERE AUFNR = :sap_aufnr AND WERKS = :factory_code
             )`,
          {
            replacements: { factory_code, sap_aufnr: row.sap_aufnr },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_istat = pp019Rows[0]?.istat ?? null;
        v_gamng = pp019Rows[0]?.gamng ?? 0;
      } catch (_) {}

      // ── Step 5: AC_ITEM_M + AC_ITEM_REF theo I.ITEM_NO ──
      let acItem = {
        item_acno: null,
        ac_unit: null,
        ref_item_no: null,
        formula: null,
      };
      try {
        const acRows = await pool.query(
          `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
           FROM "Customs".AC_ITEM_M X
           INNER JOIN "Customs".AC_ITEM_REF Y
             ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
           WHERE Y.ORG_ID = :factory_code
             AND Y.ITEM_NO = :item_no
           LIMIT 1`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        if (acRows.length > 0) {
          acItem = {
            item_acno: acRows[0].item_acno,
            ac_unit: acRows[0].unit,
            ref_item_no: acRows[0].item_no,
            formula: acRows[0].formula,
          };
        }
      } catch (_) {}

      // Push main row
      excelRows.push({
        ...row,
        ...acItem,
        v_sap_outqty,
        v_sap_unit,
        v_gr_no,
        v_gr_item,
        v_cur_no,
        v_money,
        v_trans_type,
        v_trans_date,
        v_ship_qty,
        v_se_qty,
        v_istat,
        v_gamng,
        is_sub: false,
      });

      // ── Step 6: Sub-materials từ pp_011b (Oracle CONNECT BY → PostgreSQL WITH RECURSIVE) ──
      //    Oracle dùng pp_011b, dedup bằng T_ITEM_NO
      let subMaterials = [];
      try {
        subMaterials = await pool.query(
          `WITH RECURSIVE bom AS (
             SELECT 1 AS seq,
                    B.IDNRK      AS item_no,
                    B.MENGE / 10 AS rate,
                    B.MEINS      AS unit,
                    B.MATNR,
                    B.CREATE_DATE
             FROM "mxcp".PP_011B B
             WHERE B.WERKS  = :factory_code
               AND B.MATNR  = :item_no
             UNION ALL
             SELECT bom.seq + 1,
                    B.IDNRK,
                    B.MENGE / 10,
                    B.MEINS,
                    B.MATNR,
                    B.CREATE_DATE
             FROM "mxcp".PP_011B B
             INNER JOIN bom ON B.MATNR = bom.item_no
             WHERE B.WERKS = :factory_code
           )
           SELECT DISTINCT
             bom.seq,
             bom.item_no,
             bom.rate,
             bom.unit,
             C.NAME_E,
             bom.create_date
           FROM bom
           LEFT JOIN "public".MM_ITEM C ON bom.item_no = C.ITEM_NO
           ORDER BY 1, bom.item_no ASC, bom.create_date DESC`,
          {
            replacements: { factory_code, item_no: row.item_no },
            type: pool.QueryTypes.SELECT,
          },
        );
      } catch (_) {}

      // Dedup theo item_no (T_ITEM_NO logic trong Oracle)
      const seen = new Set();
      for (const sub of subMaterials) {
        if (seen.has(sub.item_no)) continue;
        seen.add(sub.item_no);

        // AC_ITEM_M + AC_ITEM_REF theo J.ITEM_NO
        let subAcItem = {
          item_acno: null,
          ac_unit: null,
          ref_item_no: null,
          formula: null,
        };
        try {
          const subAcRows = await pool.query(
            `SELECT X.ITEM_ACNO, X.UNIT, Y.ITEM_NO, Y.FORMULA
             FROM "Customs".AC_ITEM_M X
             INNER JOIN "Customs".AC_ITEM_REF Y
               ON X.ORG_ID = Y.ORG_ID AND X.ITEM_ACNO = Y.ITEM_ACNO
             WHERE Y.ORG_ID  = :factory_code
               AND Y.ITEM_NO = :item_no
             LIMIT 1`,
            {
              replacements: { factory_code, item_no: sub.item_no },
              type: pool.QueryTypes.SELECT,
            },
          );
          if (subAcRows.length > 0) {
            subAcItem = {
              item_acno: subAcRows[0].item_acno,
              ac_unit: subAcRows[0].unit,
              ref_item_no: subAcRows[0].item_no,
              formula: subAcRows[0].formula,
            };
          }
        } catch (_) {}

        excelRows.push({ ...row, ...sub, ...subAcItem, is_sub: true });
      }
    }

    return excelRows;
  } catch (error) {
    console.error("Error in getMaterialOut:", error);
    throw error;
  }
}
async function getPP026Excel(session_id, factory_code, user_code, filters) {
  try {
    const replacements = {
      factory_code,
      start_date: filters?.s_date_1 || null,
      end_date: filters?.e_date_1 || null,
      mat_code: filters?.mat_code ? `${filters?.mat_code}%` : "%",
    };

    const sql = `
      SELECT
        A.WERKS                                                          AS org_id,
        TO_CHAR(:start_date::date, 'YYYY/MM/DD') || ' ~ ' ||
        TO_CHAR(:end_date::date,   'YYYY/MM/DD')                        AS date_range,
        A.VBELN                                                          AS se_id,
        C.PROD_NO                                                        AS ga_item,
        A.MATNR                                                          AS va_item,
        C.CUST_LOT                                                       AS article_no,
        C.CR_PROD                                                        AS article_name,
        B.SIZE_NO,
        A.LMNGA
      FROM "mxcp".PP_026OUT2 A
      LEFT JOIN "pac".SD_ORD_SIZE_D B
        ON  A.WERKS  = B.ORG_ID
        AND A.VBELN  = B.SE_ID
        AND A.POSNR  = B.SAP_POSNR
        AND A.MATNR  = B.SAP_MATNR
      LEFT JOIN "pac".SD_ORD_M C
        ON  B.ORG_ID = C.ORG_ID
        AND B.SE_ID  = C.SE_ID
        AND B.SE_VER = C.SE_VER
        AND B.SE_SEQ = C.SE_SEQ
      WHERE A.WERKS = :factory_code
        AND A.STEUS = 'PP99'
        AND A.ARBPL IN (
          SELECT WC_NO
          FROM "Customs".RD_WC_M
          WHERE factory_code = :factory_code
            AND IS_CX  = 'Y'
        )
        AND A.BUDAT BETWEEN TO_CHAR(:start_date::date, 'YYYYMMDD')
                        AND TO_CHAR(:end_date::date,   'YYYYMMDD')
        AND A.MATNR ILIKE :mat_code
        AND A.SAP_SEQ = (
          SELECT MAX(SAP_SEQ)
          FROM "mxcp".PP_026OUT2
          WHERE WERKS  = :factory_code
            AND STEUS  = 'PP99'
            AND ARBPL IN (
              SELECT WC_NO
              FROM "Customs".RD_WC_M
              WHERE factory_code = :factory_code
                AND IS_CX  = 'Y'
            )
            AND BUDAT BETWEEN TO_CHAR(:start_date::date, 'YYYYMMDD')
                          AND TO_CHAR(:end_date::date,   'YYYYMMDD')
            AND MATNR ILIKE :mat_code
            AND WERKS  = A.WERKS
            AND AUFNR  = A.AUFNR
            AND VORNR  = A.VORNR
            AND BUDAT  = A.BUDAT
            AND ARBPL  = A.ARBPL
            AND STEUS  = A.STEUS
        )
      ORDER BY A.WERKS, A.VBELN, A.MATNR, B.SIZE_NO
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const excelRows = [];

    for (const row of rows) {
      // Lấy v_nw từ SC00.AC_CUST_SIZE theo org_id + ga_item + size_no
      let v_nw = null;
      try {
        const nwRows = await pool.query(
          `SELECT NW
           FROM "SC00".AC_CUST_SIZE
           WHERE ORG_ID  = :org_id
             AND PROD_NO = :ga_item
             AND SIZE_NO = :size_no
           LIMIT 1`,
          {
            replacements: {
              org_id: row.org_id,
              ga_item: row.ga_item,
              size_no: row.size_no,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_nw = nwRows[0]?.nw ?? null;
      } catch (_) {}

      excelRows.push({ ...row, v_nw });
    }

    return excelRows;
  } catch (error) {
    console.error("Error in getPP026Excel:", error);
    throw error;
  }
}
async function search(
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = {
    vi: "S",
    en: "E",
    zh: "T",
  };
  console.log("adu filter", filters);

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
    p_sdate: filters.s_date_1 || null,
    p_edate: filters.e_date_1 || null,
    s_sdate: filters.s_date_2 || null,
    s_edate: filters.e_date_2 || null,
    s_date: filters.s_date_3 || null,
    e_date: filters.e_date_3 || null,
    fs_date: filters.s_date_4 || null,
    fe_date: filters.e_date_4 || null,
    se_id: filters.se_id || "",
    status: filters.status ?? null,
    cust_id: filters.cust_no ? `%${filters.cust_no}%` : null,
    hg_stoc: filters.hg_stoc || "",
    agent: filters.agent || "",
    ex_status: filters.ex_status || "",
  };

  // Permission conditions
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "A.FACTORY_CODE = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "A.GRT_DEPT = :permission_dept AND A.FACTORY_CODE = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "A.GRT_USER = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT 
        A.FACTORY_CODE,
        A.SALES_ID,
        A.SE_ID,
        A.SE_ID AS PACKING_SEID,
        B.ORI_SE_ID AS SO,
        A.SE_SEQ,
        A.SE_VER,
        A.PACK_GU,
        A.SHIP_SEQ,
        A.P_SHIPDATE,
        A.P_SHIPQTY,
        A.CBM,
        A.BOOK_NO,
        A.COLUMN4 AS ETD,
        A.COLUMN2 AS INVOICE_NO,
        B.SE_CUSTID,
        "Customs".GF_CUSTNM_J(B.ORG_ID, B.SE_CUSTID, :p_charset) AS SE_CUSTNAME,
        B.ACC_CUSTID,
        "Customs".GF_CUSTNM_J(B.ORG_ID, B.ACC_CUSTID, :p_charset) AS ACC_CUSTNAME,
        "Customs".GF_SE_CODE(B.ORG_ID, B.ORI_SE_ID, B.SE_VER, B.SE_SEQ) AS SPEC_CODE,
        A.COLUMN1,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'STOC', A.COLUMN1, :p_charset) AS COLUMN1_NAME,
        A.SEND_TYPE,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDMODE', A.SEND_TYPE, :p_charset) AS SEND_TYPENAME,
        A.SHIP_COMP,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDCOMP', A.SHIP_COMP, :p_charset) AS SHIP_COMPNAME,
        A.COL6,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SHIPDEST', A.COL6, :p_charset) AS COL6_NAME,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'SENDMODE', B.SEND_MODE, :p_charset) AS SENDTY,
        B.SEND_MODE,
        "Customs".GF_CODE_NAME(A.FACTORY_CODE, 'AGENT', A.COL5, :p_charset) AS COL5_NAME,
        A.COL5,
        A.COL7,
        A.P_EXDATE,
        B.NLT,
        B.NST,
        CASE A.EX_STATUS 
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS EX_STATUS_NAME,
        A.EX_STATUS,
        A.STATUS ,
        A.LOCKED_INFORMATION,
        A.GRT_DEPT,
        "Customs".GF_DEPTNM(A.FACTORY_CODE, A.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
        A.GRT_USER,
        "Customs".GF_EMPNM(A.GRT_USER, :p_charset) AS GRT_USERNAME,
        A.GRT_DATE,
        A.LAST_USER,
        "Customs".GF_EMPNM(A.LAST_USER, :p_charset) AS LAST_USERNAME,
        A.LAST_DATE,
        A.locked_information,
        (COALESCE(C.SUM_CTNS, 0)) AS SUM_CTNS
      FROM "Customs".SE_PLAN_ORD A
       LEFT JOIN (
    SELECT
        FACTORY_CODE,
        SE_ID,
        SE_VER,
        SE_SEQ,
        SHIP_SEQ,
        PACK_GU,
        SUM(COALESCE(CTNS, 0)) AS SUM_CTNS
    FROM "Customs".SE_PLAN_SIZE
    GROUP BY
        FACTORY_CODE,
        SE_ID,
        SE_VER,
        SE_SEQ,
        SHIP_SEQ,
        PACK_GU
) C
    ON A.FACTORY_CODE = C.FACTORY_CODE
    AND A.SE_ID = C.SE_ID
    AND A.SE_VER = C.SE_VER
    AND A.SE_SEQ = C.SE_SEQ
    AND A.SHIP_SEQ = C.SHIP_SEQ
    AND A.PACK_GU = C.PACK_GU
      INNER JOIN "pac".SD_ORD_M_C B 
        ON A.FACTORY_CODE = B.ORG_ID 
       AND A.SE_ID = B.se_id 
        AND A.PACK_GU = B.PACK_GU
      WHERE ${permissionCondition}
        AND A.FACTORY_CODE = :factory_code
        AND ((DATE_TRUNC('day', A.P_SHIPDATE) >= DATE_TRUNC('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (DATE_TRUNC('day', A.P_SHIPDATE) <= DATE_TRUNC('day', :p_edate::timestamp) OR :p_edate IS NULL))
        AND ((DATE_TRUNC('day', A.P_EXDATE) >= DATE_TRUNC('day', :s_sdate::timestamp) OR :s_sdate IS NULL)
        AND (DATE_TRUNC('day', A.P_EXDATE) <= DATE_TRUNC('day', :s_edate::timestamp) OR :s_edate IS NULL))
        AND (DATE_TRUNC('day', B.NLT) >= DATE_TRUNC('day', :s_date::timestamp) OR :s_date IS NULL)
        AND (DATE_TRUNC('day', B.NLT) <= DATE_TRUNC('day', :e_date::timestamp) OR :e_date IS NULL)
        AND (COALESCE(A.SE_ID, '')      ILIKE '%' || :se_id     || '%')
        AND (A.STATUS = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(A.FACTORY_CODE, B.SE_CUSTID) ILIKE :cust_id OR :cust_id IS NULL)
        AND (COALESCE(A.COLUMN1, '')    ILIKE '%' || :hg_stoc   || '%')
        AND (COALESCE(A.COL5, '')       ILIKE '%' || :agent     || '%')
        AND (COALESCE(A.EX_STATUS, '')  ILIKE '%' || :ex_status || '%')
        AND (DATE_TRUNC('day', B.NST) >= DATE_TRUNC('day', :fs_date::timestamp) OR :fs_date IS NULL)
        AND (DATE_TRUNC('day', B.NST) <= DATE_TRUNC('day', :fe_date::timestamp) OR :fe_date IS NULL)
      ORDER BY A.SE_ID, A.SE_VER, A.SE_SEQ, A.SHIP_SEQ
      LIMIT :limit
      OFFSET :offset
    `;
    const countSql = `
      SELECT COUNT(*) as total 
       FROM "Customs".SE_PLAN_ORD A
      INNER JOIN "pac".SD_ORD_M_C B 
        ON A.FACTORY_CODE = B.ORG_ID 
       AND A.SE_ID = B.se_id 
        AND A.PACK_GU = B.PACK_GU
      WHERE ${permissionCondition}
          AND A.FACTORY_CODE = :factory_code
        AND ((DATE_TRUNC('day', A.P_SHIPDATE) >= DATE_TRUNC('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (DATE_TRUNC('day', A.P_SHIPDATE) <= DATE_TRUNC('day', :p_edate::timestamp) OR :p_edate IS NULL))
        AND ((DATE_TRUNC('day', A.P_EXDATE) >= DATE_TRUNC('day', :s_sdate::timestamp) OR :s_sdate IS NULL)
        AND (DATE_TRUNC('day', A.P_EXDATE) <= DATE_TRUNC('day', :s_edate::timestamp) OR :s_edate IS NULL))
        AND (DATE_TRUNC('day', B.NLT) >= DATE_TRUNC('day', :s_date::timestamp) OR :s_date IS NULL)
        AND (DATE_TRUNC('day', B.NLT) <= DATE_TRUNC('day', :e_date::timestamp) OR :e_date IS NULL)
        AND (COALESCE(A.SE_ID, '')      ILIKE '%' || :se_id     || '%')
        AND (A.STATUS = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(A.FACTORY_CODE, B.SE_CUSTID) ILIKE :cust_id OR :cust_id IS NULL)
        AND (COALESCE(A.COLUMN1, '')    ILIKE '%' || :hg_stoc   || '%')
        AND (COALESCE(A.COL5, '')       ILIKE '%' || :agent     || '%')
        AND (COALESCE(A.EX_STATUS, '')  ILIKE '%' || :ex_status || '%')
        AND (DATE_TRUNC('day', B.NST) >= DATE_TRUNC('day', :fs_date::timestamp) OR :fs_date IS NULL)
        AND (DATE_TRUNC('day', B.NST) <= DATE_TRUNC('day', :fe_date::timestamp) OR :fe_date IS NULL)
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countRows = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    const total = parseInt(countRows[0]?.total);
    return {
      rows: actualRows,
      count: null,
      total: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in listAllSePlanOrd:", error);
    throw error;
  }
}
async function searchLink(
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
  isAll = false,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
    se_custid: filters.se_custid ? `${filters.se_custid}%` : null,
    agent: filters.agent ? `${filters.agent}%` : null,
    s_pdate: filters.s_date_1 || null,
    e_pdate: filters.e_date_1 || null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "T.FACTORY_CODE = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "T.GRT_DEPT = :permission_dept AND T.FACTORY_CODE = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "T.GRT_USER = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const baseSql = `
      FROM "Customs".SE_PLAN_ORD T
      INNER JOIN "Customs".AC_PLAN_ORD X
        ON X.FACTORY_CODE = T.FACTORY_CODE
       AND X.SE_ID       = T.SE_ID
       AND X.SE_SEQ      = T.SE_SEQ
       AND X.SHIP_SEQ    = T.SHIP_SEQ
      INNER JOIN "Customs".VW_CHG_EXP Y
        ON Y.FACTORY_CODE = T.FACTORY_CODE
      AND Y.AC_NO        = X.AC_NO
      INNER JOIN "pac".SD_ORD_M_C Z
        ON Z.ORG_ID = T.FACTORY_CODE
       AND Z.SE_ID  = T.SE_ID
       AND Z.SE_SEQ = T.SE_SEQ::NUMERIC
      INNER JOIN "public".MM_ITEM M
        ON M.ITEM_NO = Z.PROD_NO
      WHERE
        T.FACTORY_CODE = :factory_code
        AND T.STATUS > 1
        AND NOT EXISTS (
          SELECT FACTORY_CODE
          FROM "Customs".AC_CO_M
          WHERE FACTORY_CODE = T.FACTORY_CODE
            AND SE_ID        = T.SE_ID
            AND SE_VER       = T.SE_VER
            AND PACK_GU      = T.PACK_GU
            AND SE_SEQ       = T.SE_SEQ::NUMERIC
        )
        AND (
          "Customs".GF_CUSTID_CUSTNO(
            T.FACTORY_CODE,
            "Customs".GF_SE_SECUST(T.FACTORY_CODE, T.SE_ID, T.SE_VER)
          ) ILIKE :se_custid OR :se_custid IS NULL
        )
        AND (
          "Customs".GF_SEID_CUST_AGENT(T.FACTORY_CODE, T.SE_ID)
          ILIKE :agent OR :agent IS NULL
        )
        AND (DATE_TRUNC('day', T.P_SHIPDATE) >= DATE_TRUNC('day', :s_pdate::timestamp) OR :s_pdate IS NULL)
        AND (DATE_TRUNC('day', T.P_SHIPDATE) <= DATE_TRUNC('day', :e_pdate::timestamp) OR :e_pdate IS NULL)
    `;

    const sql = `
      SELECT
        T.FACTORY_CODE,
        T.SE_ID,
        T.SE_VER,
        T.SE_SEQ,
        T.PACK_GU,
        T.SHIP_SEQ,
        X.AC_NO,
        Y.AC_CHGS,
        "Customs".GF_CUSTID_CUSTNO(
          T.FACTORY_CODE,
          "Customs".GF_SE_SECUST(T.FACTORY_CODE, Z.ORI_SE_ID, T.SE_VER)
        ) AS CUST_NO,
        "Customs".GF_CUSTNM_J(
          T.FACTORY_CODE,
          "Customs".GF_SE_SECUST(T.FACTORY_CODE, Z.ORI_SE_ID, T.SE_VER),
          :p_charset
        ) AS CUST_NAME,
        Z.PO,
        Z.PROD_NO,
        M.SPG_NO,
        M.NAME_E AS PROD_NAME,
        T.P_SHIPQTY,
        T.P_SHIPDATE,
        NULL AS SEL
      ${baseSql}
      ORDER BY T.SE_ID, T.SE_SEQ, T.SHIP_SEQ
     ${isAll ? "" : "LIMIT :limit OFFSET :offset"} 
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countRows = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    const total = parseInt(countRows[0]?.total);

    return {
      rows: actualRows,
      count: null,
      total: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in searchSePlanOrd:", error);
    throw error;
  }
}

async function searchPlanOrd(
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
    cust_id: filters.cust_id ? `${filters.cust_id}%` : null,
    agent: filters.agent ? `${filters.agent}%` : null,
    p_sdate: filters.s_date_1 || null,
    p_edate: filters.e_date_1 || null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "a.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "a.grt_dept = :permission_dept AND a.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "a.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
      a.factory_code,
        a.se_id,
        a.se_seq,
        a.pack_gu,
        a.ship_seq,
        a.p_shipdate,
        a.p_shipqty,
        b.po,
        b.prod_no,
        "Customs".gf_custid_custno(a.factory_code, b.se_custid) AS cust_no,
        "Customs".gf_custnm_j(a.factory_code, b.se_custid, :p_charset) AS custnm,
        CASE :p_charset
          WHEN 'T' THEN c.name_t
          WHEN 'S' THEN c.name_s
          ELSE c.name_e
        END AS prod_name,
        CASE :p_charset
          WHEN 'T' THEN c.color_t
          WHEN 'S' THEN c.color_s
          ELSE c.color_e
        END AS color,
        CASE a.ex_status
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS ex_status
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE ${permissionCondition}
        AND a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND (b.se_custid ILIKE :cust_id OR :cust_id IS NULL)
        AND ("Customs".gf_seid_cust_agent(a.factory_code, b.ori_se_id) ILIKE :agent OR :agent IS NULL)
        AND (date_trunc('day', a.p_shipdate) >= date_trunc('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (date_trunc('day', a.p_shipdate) <= date_trunc('day', :p_edate::timestamp) OR :p_edate IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
      ORDER BY a.se_id, a.se_seq, a.pack_gu, a.ship_seq
      LIMIT :limit
      OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE ${permissionCondition}
        AND a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND (b.se_custid ILIKE :cust_id OR :cust_id IS NULL)
        AND ("Customs".gf_seid_cust_agent(a.factory_code, b.ori_se_id) ILIKE :agent OR :agent IS NULL)
        AND (date_trunc('day', a.p_shipdate) >= date_trunc('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (date_trunc('day', a.p_shipdate) <= date_trunc('day', :p_edate::timestamp) OR :p_edate IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countRows = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    const total = parseInt(countRows[0]?.total);

    return {
      rows: actualRows,
      count: null,
      total: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in search:", error);
    throw error;
  }
}

module.exports = {
  listAllSePlanOrd,
  listAllPlanOrd,
  listSePlanOrdLink,
  fetchFieldDropdown,
  confirmCheck,
  getByID,
  getTempTable,
  getTempTextTable,
  clearTempTable,
  clearTempTextTable,
  createShipSeq,
  createCBM,
  createMoney,
  add,
  edit,
  deleteItem,
  deleteItems,
  search,
  searchPlanOrd,
  searchLink,
  checkItem,
  checkTextItem,
  recreateTempT,
  getMaterialOut,
  getPeriodEndMaterial,
  getShipOrder,
  getPP026Excel,
  listAllSePlanOrdDetails,
  confirm,
  confirmItems,
  unconfirmItems
};
