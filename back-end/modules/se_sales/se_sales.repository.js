const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_SHIPING_M = require("./se_sales.model.js");

async function listAllSeSales(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  const charSet = { vi: "S", en: "E", zh: "T" };
  let permissionCondition = "1=1";
  const replacements = {
    factory_code: factory_code || null,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 10,
    offset: parseInt(offset) || 0,
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "org_id = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND org_id = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
    A.ORG_ID                                                                      AS FACTORY_CODE,
    A.SALES_ID,
    A.COL2                                                                        AS SHIPPING_ORDER,
    A.SALES_DATE,
    A.SEND_TYPE,
    "Customs".GF_CODE_NAME(A.ORG_ID, 'SENDMODE', A.SEND_TYPE, :p_charset)        AS SEND_TYPENAME,
    A.SEND_CORP,
    "Customs".GF_CODE_NAME(A.ORG_ID, 'SENDCOMP', A.SEND_CORP, :p_charset)        AS SEND_COMPNAME,
    A.DESTINATION,
    A.REMARK,
    A.STATUS,
    A.GRT_DEPT,
    "Customs".GF_DEPTNM(A.ORG_ID, A.GRT_DEPT, :p_charset)                        AS GRT_DEPTNAME,
    A.GRT_USER,
    "Customs".GF_EMPNM(A.GRT_USER, :p_charset)                                   AS GRT_USERNAME,
    A.GRT_DATE,
    A.LAST_USER,
    "Customs".GF_EMPNM(A.LAST_USER, :p_charset)                                  AS LAST_USERNAME,
    A.LAST_DATE
  FROM "Customs".VW_SALES_SH A
  WHERE ${permissionCondition}
  ORDER BY A.SALES_ID ASC
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
      hasMore,
    };
  } catch (error) {
    console.error("Error in getDetailSeSales:", error);
    throw error;
  }
}
async function listAllSalesDetails(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
) {
  const charSet = { vi: "S", en: "E", zh: "T" };
  let permissionCondition = "1=1";
  const replacements = {
    factory_code: factory_code || null,
    p_charset: charSet[language] || "E",
    send_corp: query?.send_corp || null,
    sales_no: query?.sales_no || null,
    send_type: query?.send_type || null,
    se_id: query?.se_id || null,
    s_date_1: query?.s_date_1 || null,
    e_date_1: query?.e_date_1 || null,
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "m.org_id = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "m.grt_dept = :permission_dept AND m.org_id = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "m.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  try {
    const sql = `
      SELECT
        M.SALES_ID,
        M.COL2                                                                        AS SALES_NO,
        "Customs".GF_CODE_NAME(M.ORG_ID, 'SENDCOMP', M.SEND_CORP, :p_charset)        AS CORP_NAME,
        M.SALES_DATE,
        M.REMARK,
        D.SALES_SEQ,
        D.COL1                                                                        AS STT,
        SEP.BOOK_NO,
        D.COL3                                                                        AS CHE,
        D.SE_ID,
        D.SE_SEQ,
        D.SHIP_SEQ,
        SEP.PACK_GU,
        CASE M.STATUS
          WHEN 1  THEN 'New'
          WHEN 7  THEN 'Released'
          WHEN 29 THEN 'Shipping'
          WHEN 99 THEN 'Finished'
          WHEN 0  THEN 'Canceled'
          ELSE ' '
        END                                                                           AS STATUS,
        SEP.CBM,
        "Customs".GF_CODE_NAME(D.ORG_ID, 'STOC', SEP.COLUMN1, :p_charset)            AS P_STOC,
        AC.AC_CHGNO,
        AC.AC_NO,
        -- CTNS từ SE_PLAN_SIZE
        COALESCE((
          SELECT SUM(COALESCE(PS.CTNS, 0))
          FROM "Customs".SE_PLAN_SIZE PS
          WHERE PS.factory_code   = :factory_code
            AND PS.SE_ID    = D.SE_ID
            AND PS.SE_SEQ   = D.SE_SEQ
            AND PS.PACK_GU  = SEP.PACK_GU
            AND PS.SHIP_SEQ = D.SHIP_SEQ
        ), 0)                                                                         AS CTNS,
        -- NLT/PDD từ SD_ORD_M
        (
          SELECT SD.NLT
          FROM "pac".SD_ORD_M SD
          WHERE SD.ORG_ID  = :factory_code
            AND SD.SE_ID   = D.SE_ID
            AND SD.SE_SEQ  = D.SE_SEQ::NUMERIC
          LIMIT 1
        )                                                                             AS PDD,
        -- DM_NO từ AC_ISSUE_M_T
        (
          SELECT
            MIN("Customs".GF_AC_YEARNO(AIT.factory_code, AIT.CONF_SEQ))
            || ' - ' ||
            MAX("Customs".GF_AC_YEARNO(AIT.factory_code, AIT.CONF_SEQ))
          FROM "Customs".AC_ISSUE_M_T AIT
          WHERE AIT.factory_code = :factory_code
            AND AIT.AC_NO  = AC.AC_NO
        )                                                                             AS DM_NO
      FROM       "Customs".VW_SALES_SH    M
      LEFT JOIN  "pac".sd_sales_d     D   ON  M.ORG_ID   = D.ORG_ID
                                              AND M.SALES_ID  = D.SALES_ID
      LEFT JOIN  "Customs".SE_PLAN_ORD    SEP ON  D.ORG_ID   = sep.factory_code
                                              AND D.SE_ID     = SEP.SE_ID
                                              AND D.SE_SEQ    = SEP.SE_SEQ
                                              AND D.SHIP_SEQ  = SEP.SHIP_SEQ
      LEFT JOIN  "Customs".AC_PLAN_ORD    ACP ON  sep.factory_code  = ACP.FACTORY_CODE
                                              AND SEP.SE_ID   = ACP.SE_ID
                                              AND SEP.SE_SEQ  = ACP.SE_SEQ
                                              AND SEP.PACK_GU = ACP.PACK_GU
                                              AND SEP.SHIP_SEQ= ACP.SHIP_SEQ
      LEFT JOIN  "Customs".AC_CHG_M       AC  ON  ACP.FACTORY_CODE  = ac.factory_code
                                              AND ACP.AC_NO   = AC.AC_NO
      WHERE ${permissionCondition}
        AND M.OU_RE  = '1'
        AND (:send_corp IS NULL OR M.SEND_CORP = :send_corp)
        AND (:sales_no  IS NULL OR M.COL2 LIKE :sales_no || '%')
        AND (:send_type IS NULL OR M.SEND_TYPE = :send_type)
        AND (:s_date_1  IS NULL OR M.SALES_DATE >= :s_date_1::date)
        AND (:e_date_1  IS NULL OR M.SALES_DATE <= :e_date_1::date)
        AND (:se_id     IS NULL OR D.SE_ID LIKE :se_id || '%')
      ORDER BY D.COL1, D.SE_ID, D.SE_SEQ, D.COL3
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in exportSalesReport:", error);
    throw error;
  }
}

async function listAllSalesDetails2(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  sales_id,
) {
  const charSet = { vi: "S", en: "E", zh: "T" };
  let permissionCondition = "1=1";
  const replacements = {
    factory_code: factory_code || null,
    sales_id: parseInt(sales_id) || null,
    p_charset: charSet[language] || "E",
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "m.org_id = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "m.grt_dept = :permission_dept AND m.org_id = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "m.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  try {
    const sql = `
      SELECT
        M.COL2                                                                        AS SALES_NO,
        M.SEND_CORP,
        "Customs".GF_CODE_NAME(M.ORG_ID, 'SENDCOMP', M.SEND_CORP, :p_charset)        AS CORP_NAME,
        M.SALES_DATE,
        D.COL1                                                                        AS STT,
        D.COL3                                                                        AS CHE,
        D.SALES_SEQ,
        D.SE_ID,
        D.SE_SEQ,
        D.SHIP_SEQ,
        SEP.PACK_GU,
        SEP.BOOK_NO,
        CASE M.STATUS
          WHEN 1  THEN 'New'
          WHEN 7  THEN 'Released'
          WHEN 29 THEN 'Shipping'
          ELSE ' '
        END                                                                           AS STATUS,
        SEP.CBM,
        AC.AC_CHGNO,
        "Customs".GF_CODE_NAME(D.ORG_ID, 'STOC', SEP.COLUMN1, :p_charset)            AS P_STOC,
        -- CTNS từ SE_PLAN_SIZE
        COALESCE((
          SELECT SUM(COALESCE(PS.CTNS, 0))
          FROM "Customs".SE_PLAN_SIZE PS
          WHERE PS.factory_code  = :factory_code
            AND PS.SE_ID    = D.SE_ID
            AND PS.SE_SEQ   = D.SE_SEQ
            AND PS.PACK_GU  = SEP.PACK_GU
            AND PS.SHIP_SEQ = D.SHIP_SEQ
        ), 0)                                                                         AS CTNS
      FROM       "Customs".VW_SALES_SH  M
      LEFT JOIN  "pac".sd_sales_d   D   ON  M.ORG_ID    = D.ORG_ID
                                            AND M.SALES_ID  = D.SALES_ID
      LEFT JOIN  "Customs".SE_PLAN_ORD  SEP ON  D.ORG_ID    = SEP.FACTORY_CODE
                                            AND D.SE_ID     = SEP.SE_ID
                                            AND D.SE_SEQ    = SEP.SE_SEQ
                                            AND D.SHIP_SEQ  = SEP.SHIP_SEQ
      LEFT JOIN  "Customs".AC_PLAN_ORD  ACP ON  SEP.FACTORY_CODE  = ACP.FACTORY_CODE
                                            AND SEP.SE_ID   = ACP.SE_ID
                                            AND SEP.SE_SEQ  = ACP.SE_SEQ
                                            AND SEP.PACK_GU = ACP.PACK_GU
                                            AND SEP.SHIP_SEQ= ACP.SHIP_SEQ
      LEFT JOIN  "Customs".AC_CHG_M     AC  ON  ACP.FACTORY_CODE  = AC.FACTORY_CODE
                                            AND ACP.AC_NO   = AC.AC_NO
                                            AND AC.STATUS   = '7'
      WHERE ${permissionCondition}
        AND M.SALES_ID = :sales_id
      ORDER BY D.COL1, D.SE_ID, D.SE_SEQ, D.COL3
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in exportExcelSeSales:", error);
    throw error;
  }
}
async function fetchFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  language = "en",
  page,
  limit,
  search,
) {
  let charSet = { vi: "L", en: "E", zh: "T" };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    language: charSet[language] || "E",
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
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        ${field} ILIKE :search OR
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  let sql;
  let countSql;
  if (field === "sales_no") {
    sql = `
        SELECT COL2, SALES_DATE 
        FROM "Customs".VW_SALES_SH 
        WHERE ORG_ID=:factory_code
         ${searchCondition}
        AND OU_RE ='1' 
        ORDER BY COL2
        limit :limit
        offset :offset

      `;
    countSql = `
        SELECT COUNT(COL2) as total
       FROM "Customs".VW_SALES_SH  
      WHERE ORG_ID=:factory_code
         ${searchCondition}
      AND OU_RE ='1' 
      `;
  } else {
    sql = `
       SELECT 
       send_type as code_no,
      "Customs".GF_CODE_NAME(ORG_ID,'SENDMODE',send_type,:language) AS name 
      FROM "Customs".VW_SALES_SH 
        WHERE ORG_ID=:factory_code
         ${searchCondition}
         order by send_type
         limit :limit
        offset :offset

      `;
    countSql = `
        SELECT COUNT(send_type) as total
       FROM "Customs".VW_SALES_SH 
        WHERE ORG_ID=:factory_code
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
async function checkPermission(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const whereClause = {};
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
async function getByID(factory_code, cust_id, si_seq) {
  const acImp = await AC_SHIPING_M.findOne({
    where: {
      factory_code: factory_code,
      cust_id: cust_id,
      si_seq: si_seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function createsiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cust_id: cust_id,
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
    SELECT COALESCE(MAX(si_seq), 0) + 1 as si_seq
     from "Customs".SE_SHIPING_M 
     where factory_code=:factory_code 
     and cust_id=:cust_id
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    return rows[0] || 1;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getPosition(cust_id, si_seq, pageSize, t, permission) {
  try {
    const position = await AC_SHIPING_M.count({
      where: {
        [Op.or]: [
          {
            cust_id: {
              [Op.lt]: cust_id,
            },
          },
          {
            cust_id: cust_id,
            si_seq: {
              [Op.lt]: si_seq,
            },
          },
        ],
        ...permission,
      },
      transaction: t,
    });

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
    console.log("Cannot calculate position", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  seShipingM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_SHIPING_M.create(seShipingM, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItemM.cust_id,
      addItemM.si_seq,
      pageSize,
      t,
      permission,
    );
    return {
      data: addItemM,
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
  existAcInmM,
  editAcInmM,
  pageSize,
  t,
) {
  try {
    const editAIM = await existAcInmM.update(editAcInmM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editAIM.cust_id,
      editAIM.si_seq,
      pageSize,
      t,
      permission,
    );
    return {
      data: editAIM,
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
  language = "en",
  limit,
  offset,
) {
  const charSet = { vi: "S", en: "E", zh: "T" };
  let permissionCondition = "1=1";

  const replacements = {
    factory_code: factory_code || null,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 10,
    offset: parseInt(offset) || 0,
    send_corp: query?.send_corp || null,
    sales_no: query?.sales_no || null,
    send_type: query?.send_type || null,
    se_id: query?.se_id || null,
    s_date_1: query?.s_date_1 || null,
    e_date_1: query?.e_date_1 || null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "A.org_id = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "A.grt_dept = :permission_dept AND A.org_id = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "A.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  const whereClause = `
    WHERE ${permissionCondition}
      AND A.OU_RE = '1'
      AND (:send_corp IS NULL OR A.SEND_CORP = :send_corp)
      AND (:sales_no  IS NULL OR A.COL2 LIKE :sales_no || '%')
      AND (:send_type IS NULL OR A.SEND_TYPE = :send_type)
      AND (:s_date_1  IS NULL OR A.SALES_DATE >= :s_date_1::date)
      AND (:e_date_1  IS NULL OR A.SALES_DATE <= :e_date_1::date)
      AND (
        :se_id IS NULL OR
        (A.ORG_ID, A.SALES_ID) IN (
          SELECT ORG_ID, SALES_ID
          FROM "pac".sd_sales_d
          WHERE ORG_ID = :factory_code
            AND SE_ID LIKE :se_id || '%'
        )
      )
  `;

  const fromClause = `
    FROM "Customs".VW_SALES_SH A
  `;

  try {
    const sql = `
      SELECT
        A.ORG_ID                                                                    AS FACTORY_CODE,
        A.SALES_ID,
        A.COL2                                                                      AS SHIPPING_ORDER,
        A.SALES_DATE,
        A.SEND_TYPE,
        "Customs".GF_CODE_NAME(A.ORG_ID, 'SENDMODE', A.SEND_TYPE, :p_charset)      AS SEND_TYPENAME,
        A.SEND_CORP,
        "Customs".GF_CODE_NAME(A.ORG_ID, 'SENDCOMP', A.SEND_CORP, :p_charset)      AS SEND_COMPNAME,
        A.DESTINATION,
        A.REMARK,
        A.STATUS,
        A.GRT_DEPT,
        "Customs".GF_DEPTNM(A.ORG_ID, A.GRT_DEPT, :p_charset)                      AS GRT_DEPTNAME,
        A.GRT_USER,
        "Customs".GF_EMPNM(A.GRT_USER, :p_charset)                                 AS GRT_USERNAME,
        A.GRT_DATE,
        A.LAST_USER,
        "Customs".GF_EMPNM(A.LAST_USER, :p_charset)                                AS LAST_USERNAME,
        A.LAST_DATE
      ${fromClause}
      ${whereClause}
      ORDER BY A.SALES_ID ASC
      LIMIT  :limit
      OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      ${fromClause}
      ${whereClause}
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    let total = null;
    if (parseInt(offset) === 0) {
      const countResult = await pool.query(countSql, {
        replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.total);
    }

    return { rows: actualRows, count: total, hasMore };
  } catch (error) {
    console.error("Error in searchSeSales:", error);
    throw error;
  }
}

module.exports = {
  listAllSeSales,
  getByID,
  createsiSeq,
  add,
  edit,
  deleteImp,
  search,
  listAllSalesDetails,
  listAllSalesDetails2,
  fetchFieldDataDropdown,
};
