const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_PLAN_SIZE = require("./se_plan_size.model.js");
const SE_PLAN_ORD = require("../se_plan_ord/se_plan_ord.model.js");

async function listAllSePlanSize(
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  language,
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
    se_id: se_id,
    pack_gu: parseFloat(pack_gu),
    se_seq: String(se_seq),
    se_ver: se_ver,
    ship_seq: parseFloat(ship_seq),
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
      A.SE_ID,
      A.SE_VER,
      A.SE_SEQ,
      A.PACK_GU,
      A.SHIP_SEQ,
        A.PK_SEQ,
        A.SIZERUN,
        C.SIZERUN AS SIZERUN_NAME,
        A.CTNS_PAIRS,
        B.CTNS AS PACK_CTNS,
        A.CTNS,
        CASE 
          WHEN COALESCE(B.CTNS, 0) = 0 THEN B.CBM / 1 * A.CTNS 
          ELSE B.CBM / B.CTNS * A.CTNS 
        END AS CBM,
        COALESCE(A.CTNS_PAIRS, 0) * COALESCE(A.CTNS, 0) AS PAIRS,
        A.STATUS ,
        A.locked_information,
        A.GRT_DEPT,
        "Customs".GF_DEPTNM(A.FACTORY_CODE, A.GRT_DEPT, :p_charset) AS GRT_DEPTNAME,
        A.GRT_USER,
        "Customs".GF_EMPNM(A.GRT_USER, :p_charset) AS GRT_USERNAME,
        A.GRT_DATE,
        A.LAST_USER,
        "Customs".GF_EMPNM(A.LAST_USER, :p_charset) AS LAST_USERNAME,
        A.LAST_DATE
      FROM "Customs".SE_PLAN_SIZE A
      INNER JOIN "pac".SD_PACK_M B 
        ON A.FACTORY_CODE = B.ORG_ID 
        AND A.SE_ID = B.SE_ID 
        AND A.PACK_GU = B.PACK_GU 
        AND A.SE_SEQ = B.SE_SEQ::TEXT
        AND A.PK_SEQ = B.PK_SEQ
      LEFT JOIN "Customs".SE_SIZERUN_M C 
        ON A.SIZERUN = CAST(C.S_ID AS VARCHAR)
      WHERE ${permissionCondition}
        AND A.SE_ID = :se_id
        AND A.PACK_GU = :pack_gu
        AND A.SE_VER = :se_ver
        AND A.SE_SEQ = :se_seq
        AND A.SHIP_SEQ = :ship_seq
      ORDER BY A.SE_ID, A.SE_VER, A.SE_SEQ, A.PACK_GU, A.SHIP_SEQ, A.PK_SEQ
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
    console.error("Error in listAllSePlanSize:", error);
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

async function getByID(
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
) {
  const acImp = await SE_PLAN_SIZE.findOne({
    where: {
      factory_code: factory_code,
      se_id: se_id,
      se_ver: se_ver,
      se_seq: se_seq,
      pack_gu: pack_gu,
      ship_seq: ship_seq,
      pk_seq: pk_seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}

async function getPosition(
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
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
    pk_seq: pk_seq,
  };

  try {
    const sql = `
      SELECT COUNT(*) as position
      FROM "Customs".SE_PLAN_SIZE A
      INNER JOIN "pac".SD_PACK_M B 
        ON A.FACTORY_CODE = B.ORG_ID 
        AND A.SE_ID = B.SE_ID 
        AND A.PACK_GU = B.PACK_GU 
        AND A.SE_SEQ = B.SE_SEQ::TEXT
        AND A.PK_SEQ = B.PK_SEQ
      LEFT JOIN "Customs".SE_SIZERUN_M C 
        ON A.SIZERUN = CAST(C.S_ID AS VARCHAR)
      WHERE
         (
          A.SE_ID < :se_id
          OR (A.SE_ID = :se_id AND A.SE_VER < :se_ver)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver AND A.SE_SEQ < :se_seq)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver 
              AND A.SE_SEQ = :se_seq AND A.PACK_GU < :pack_gu)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver 
              AND A.SE_SEQ = :se_seq AND A.PACK_GU = :pack_gu 
              AND A.SHIP_SEQ < :ship_seq)
          OR (A.SE_ID = :se_id AND A.SE_VER = :se_ver 
              AND A.SE_SEQ = :se_seq AND A.PACK_GU = :pack_gu 
              AND A.SHIP_SEQ = :ship_seq AND A.PK_SEQ < :pk_seq)
        ) ${permission.whereClause}
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
    const addItemM = await SE_PLAN_SIZE.create(sePlanOrd, {
      transaction: t,
    });
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
      addItemM.pk_seq,
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
  existSPS,
  editSPO,
  pageSize,
) {
  const t = await pool.transaction();
  try {
    if (editSPO.ctns !== undefined) {
      const validationResult = await getCtns(
        factory_code,
        existSPS.se_id,
        existSPS.pack_gu,
        existSPS.se_seq,
        existSPS.pk_seq,
        existSPS.ship_seq,
        editSPO.ctns,
        t,
      );
      editSPO.cbm = validationResult.calculatedCbm;
    }

    const editItem = await existSPS.update(editSPO, { transaction: t });

    if (editSPO.ctns !== undefined) {
      await updateSePlanOrdSummary(
        factory_code,
        editItem.se_id,
        editItem.pack_gu,
        editItem.se_seq,
        editItem.se_ver,
        editItem.ship_seq,
        t,
      );
    }

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
      editItem.pk_seq,
      pageSize,
      t,
      permission,
    );

    await t.commit();
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    await t.rollback();
    console.log("Cannot edit item from db", error);
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
async function confirm(
  factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
) {
  const replacements = {
    factory_code: factory_code,
    user_code: user_code,
    department_code: department_code,
    se_id: se_id,
    pack_gu: pack_gu,
    se_seq: se_seq,
    se_ver: se_ver,
    ship_seq: ship_seq,
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
    const sql = `
    UPDATE "Customs".se_plan_size
    SET status = 7, last_user = :user_code, last_date = now()
    WHERE se_id = :se_id and 
      pack_gu = :pack_gu and 
      se_seq = :se_seq and 
      se_ver = :se_ver and 
      ship_seq = :ship_seq and  
    status = 1 
      AND ${permissionCondition}
  `;
    await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    await transaction.commit();
    return {
      success: true,
      message: "Confirmed successfully!",
    };
  } catch (error) {
    console.log("Error when confirm all", error);
    await transaction.rollback();
    return {
      success: false,
      message: "Error when confirm all",
    };
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

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
    // Filter parameters - set to null if not provided
    p_sdate: filters.s_date_1 || null,
    p_edate: filters.e_date_1 || null,
    s_sdate: filters.s_date_2 || null,
    s_edate: filters.e_date_2 || null,
    s_date: filters.s_date_3 || null,
    e_date: filters.e_date_3 || null,
    fs_date: filters.s_date_4 || null,
    fe_date: filters.e_date_4 || null,
    se_id: filters.se_id ? `%${filters.se_id}%` : null,
    status: filters.status || null,
    cust_id: filters.cust_id ? `%${filters.cust_id}%` : null,
    hg_stoc: filters.hg_stoc || null,
    agent: filters.agent ? `${filters.agent}%` : null,
    ex_status: filters.ex_status || null,
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
      --  "Customs".GF_SE_CODE(B.ORG_ID, B.ORI_SE_ID, B.SE_VER, B.SE_SEQ) AS SPEC_CODE,
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
        END AS EX_STATUS,
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
        A.locked_information
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
        AND (A.SE_ID LIKE :se_id OR :se_id IS NULL)
        AND (A.STATUS = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(A.FACTORY_CODE, B.SE_CUSTID) LIKE :cust_id OR :cust_id IS NULL)
        AND (A.COLUMN1 = :hg_stoc OR :hg_stoc IS NULL)
        AND (A.COL5 LIKE :agent OR :agent IS NULL)
        AND (A.EX_STATUS = :ex_status OR :ex_status IS NULL)
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
        AND (A.SE_ID LIKE :se_id OR :se_id IS NULL)
        AND (A.STATUS = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(A.FACTORY_CODE, B.SE_CUSTID) LIKE :cust_id OR :cust_id IS NULL)
        AND (A.COLUMN1 = :hg_stoc OR :hg_stoc IS NULL)
        AND (A.COL5 LIKE :agent OR :agent IS NULL)
        AND (A.EX_STATUS = :ex_status OR :ex_status IS NULL)
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
async function getSizePlanShipQty(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  pk_seq,
  transaction = null,
) {
  try {
    const sql = `
      SELECT COALESCE(SUM(COALESCE(CTNS, 0)), 0) AS TOTAL_PLANNED
      FROM "Customs".SE_PLAN_SIZE
      WHERE FACTORY_CODE = :factory_code
        AND SE_ID = :se_id
        AND PACK_GU = :pack_gu
        AND SE_SEQ = :se_seq
        AND PK_SEQ = :pk_seq
    `;
    const result = await pool.query(sql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu,
        se_seq,
        pk_seq,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    return parseFloat(result[0]?.total_planned) || 0;
  } catch (error) {
    console.error("Error in getSizePlanShipQty:", error);
    throw error;
  }
}

/**
 * Auto-generate SE_PLAN_SIZE records from SD_PACK_M
 * when creating a new SE_PLAN_ORD
 */
async function autoGenerateSePlanSize(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
  transaction = null,
) {
  try {
    // 1. Get all SD_PACK_M records for this order
    const packMSql = `
      SELECT 
        PK_SEQ,
        SIZERUN,
        CTN_PAIRS,
        COALESCE(CTNS, 0) AS PACK_CTNS,
        COALESCE(CBM, 0) AS PACK_CBM
      FROM "pac".SD_PACK_M
      WHERE ORG_ID = :factory_code
        AND SE_ID = :se_id
        AND PACK_GU = :pack_gu
        AND SE_SEQ = :se_seq
      ORDER BY PK_SEQ
    `;
    const packMRecords = await pool.query(packMSql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu: parseInt(pack_gu),
        se_seq,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (!packMRecords || packMRecords.length === 0) {
      console.log("No SD_PACK_M records found, skip auto-generation");
      return [];
    }

    // 2. For each pack record, calculate available qty and insert
    const createdRecords = [];

    for (const packRecord of packMRecords) {
      const pkSeq = packRecord.pk_seq;
      const packCtns = parseFloat(packRecord.pack_ctns) || 0;

      // Get already planned quantity for this PK_SEQ
      const alreadyPlanned = await getSizePlanShipQty(
        factory_code,
        se_id,
        pack_gu,
        se_seq,
        pkSeq,
        transaction,
      );
      console.log("already plan", alreadyPlanned);

      // Calculate available quantity
      const availableQty = packCtns - alreadyPlanned;
      console.log("adadudud", availableQty, packCtns, alreadyPlanned);

      // Calculate CBM for this size record
      let sizeCbm = 0;
      if (packCtns > 0) {
        sizeCbm = (parseFloat(packRecord.pack_cbm) / packCtns) * availableQty;
      } else {
        sizeCbm = parseFloat(packRecord.pack_cbm) * availableQty;
      }
      const sizeRecord = {
        factory_code: factory_code,
        se_id: se_id,
        se_ver: se_ver,
        se_seq: se_seq,
        pack_gu: pack_gu,
        ship_seq: ship_seq,
        pk_seq: pkSeq,
        sizerun: packRecord.sizerun,
        ctns_pairs: packRecord.ctn_pairs,
        ctns: availableQty,
        status: 1,
      };

      const created = await SE_PLAN_SIZE.create(sizeRecord, {
        transaction,
      });

      createdRecords.push(created);

      console.log(
        `Auto-generated SE_PLAN_SIZE: PK_SEQ=${pkSeq}, CTNS=${availableQty}`,
      );
    }

    return createdRecords;
  } catch (error) {
    console.error("Error in autoGenerateSePlanSize:", error);
    throw error;
  }
}

/**
 * Update SE_PLAN_ORD summary fields (P_SHIPQTY, CBM) based on SE_PLAN_SIZE
 */
async function updateSePlanOrdSummary(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
  transaction = null,
) {
  try {
const summarySql = `
  SELECT 
    COALESCE(SUM(LAT.T_QTY), 0) AS TOTAL_CTNS,
    COALESCE(SUM(
      B.CBM / CASE WHEN COALESCE(B.CTNS, 0) = 0 THEN 1 ELSE B.CTNS END * LAT.T_QTY
    ), 0) AS TOTAL_CBM
  FROM "pac".SD_PACK_M B
  CROSS JOIN LATERAL (
    SELECT 
      GREATEST(
        COALESCE(B.CTNS, 0) - COALESCE(
          "Customs".GF_SIZE_PLAN_SHIPQTY(
            B.ORG_ID,
            B.SE_ID,
            B.PACK_GU,
            B.SE_SEQ::TEXT,
            B.PK_SEQ::NUMERIC
          ), 0
        ), 0
      ) AS T_QTY
  ) LAT
  WHERE B.ORG_ID  = :factory_code
    AND B.SE_ID   = :se_id
    AND B.PACK_GU = :pack_gu
    AND B.SE_SEQ  = :se_seq
`;

    const summaryResult = await pool.query(summarySql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu: parseFloat(pack_gu),
        se_seq,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    const totalCtns = parseFloat(summaryResult[0]?.total_ctns) || 0;
    const totalCbm = parseFloat(summaryResult[0]?.total_cbm) || 0;

    // Add 3% buffer to CBM
    const cbmWithBuffer = totalCbm * 1.03;

    // Update SE_PLAN_ORD
    await SE_PLAN_ORD.update(
      {
        p_shipqty: totalCtns,
        cbm: cbmWithBuffer,
      },
      {
        where: {
          factory_code,
          se_id,
          pack_gu,
          se_seq,
          se_ver,
          ship_seq,
        },
        transaction,
      },
    );

    console.log(
      `Updated SE_PLAN_ORD summary: CTNS=${totalCtns}, CBM=${cbmWithBuffer.toFixed(4)}`,
    );

    return {
      total_ctns: totalCtns,
      total_cbm: cbmWithBuffer,
    };
  } catch (error) {
    console.error("Error in updateSePlanOrdSummary:", error);
    throw error;
  }
}
async function getCtns(
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  pk_seq,
  ship_seq,
  new_ctns,
  transaction = null,
) {
  try {
    // Validate and calculate in one query
    const validationSql = `
      SELECT 
        -- Get max CTNS from packing
        COALESCE(B.CTNS, 0) AS MAX_CTNS,
        
        -- Get total planned CTNS (excluding current record)
        COALESCE(
          (SELECT SUM(COALESCE(CTNS, 0))
           FROM "Customs".SE_PLAN_SIZE
           WHERE FACTORY_CODE = :factory_code
             AND SE_ID = :se_id
             AND PACK_GU = :pack_gu
             AND SE_SEQ = :se_seq
             AND PK_SEQ = :pk_seq
             AND SHIP_SEQ != :ship_seq),
          0
        ) AS TOTAL_PLANNED,
        
        -- Calculate CBM for new CTNS
        CASE 
          WHEN COALESCE(B.CTNS, 0) = 0 THEN B.CBM * :new_ctns
          ELSE B.CBM / B.CTNS * :new_ctns
        END AS CALCULATED_CBM
        
      FROM "pac".SD_PACK_M B
      WHERE B.ORG_ID = :factory_code
        AND B.SE_ID = :se_id
        AND B.PACK_GU = :pack_gu
        AND B.SE_SEQ = :se_seq::NUMERIC
        AND B.PK_SEQ = :pk_seq
    `;

    const result = await pool.query(validationSql, {
      replacements: {
        factory_code,
        se_id,
        pack_gu: parseFloat(pack_gu),
        se_seq,
        pk_seq: parseFloat(pk_seq),
        ship_seq: parseFloat(ship_seq),
        new_ctns: parseFloat(new_ctns) || 0,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (!result || result.length === 0) {
      const message = "No packing data found for this item";
      throw new Error(message);
    }

    const maxCtns = parseFloat(result[0]?.max_ctns) || 0;
    const totalPlanned = parseFloat(result[0]?.total_planned) || 0;
    const calculatedCbm = parseFloat(result[0]?.calculated_cbm) || 0;
    const newCtnsValue = parseFloat(new_ctns) || 0;
    const newTotal = totalPlanned + newCtnsValue;

    // Validate
    if (newTotal > maxCtns) {
      const message = `CTNS exceeds packing limit! Planned: ${newTotal}, Max: ${maxCtns}, Available: ${maxCtns - totalPlanned}`;
      throw new Error(message);
    }

    console.log(
      `Validation passed: CTNS=${newCtnsValue}, CBM=${calculatedCbm.toFixed(4)}, Total=${newTotal}/${maxCtns}`,
    );

    return {
      isValid: true,
      maxCtns,
      totalPlanned,
      newTotal,
      available: maxCtns - totalPlanned,
      calculatedCbm,
      new_ctns: newCtnsValue,
    };
  } catch (error) {
    console.error("Error in validateAndCalculatePlanSizeCtns:", error);
    throw error;
  }
}
async function deleteItem(existSPS, t) {
  try {
    const deleteSizeSql = `
      DELETE FROM "Customs".SE_PLAN_SIZE
      WHERE FACTORY_CODE = :factory_code
        AND SE_ID = :se_id
        AND PACK_GU = :pack_gu
        AND SE_VER = :se_ver
        AND SE_SEQ = :se_seq
        AND SHIP_SEQ = :ship_seq
        AND PK_SEQ = :pk_seq
    `;
    const deletedSizes = await pool.query(deleteSizeSql, {
      replacements: {
        factory_code: existSPS.factory_code,
        se_id: existSPS.se_id,
        pack_gu: existSPS.pack_gu,
        se_ver: existSPS.se_ver,
        se_seq: existSPS.se_seq,
        ship_seq: existSPS.ship_seq,
        pk_seq: existSPS.pk_seq,
      },
      type: pool.QueryTypes.DELETE,
      transaction: t,
    });

    // 🔧 Cha vẫn còn, chỉ mất 1 size con → phải tính lại tổng
    // Thứ tự tham số khớp đúng signature hàm (se_seq trước se_ver)
    await updateSePlanOrdSummary(
      existSPS.factory_code,
      existSPS.se_id,
      existSPS.pack_gu,
      existSPS.se_seq,
      existSPS.se_ver,
      existSPS.ship_seq,
      t,
    );

    console.log(`Deleted ${deletedSizes[1] || 0} SE_PLAN_SIZE records`);

    return {
      deleted_sizes: deletedSizes[1] || 0,
    };
  } catch (error) {
    console.log("Cannot delete SE_PLAN_SIZE from db", error);
    throw error;
  }
}
async function deleteItems(items, t) {
  try {
    if (!items || items.length === 0) {
      return { deleted_sizes: 0 };
    }

    const replacements = {};
    const tuples = items.map((item, i) => {
      replacements[`factory_code_${i}`] = item.factory_code;
      replacements[`se_id_${i}`] = item.se_id;
      replacements[`pack_gu_${i}`] = item.pack_gu;
      replacements[`se_ver_${i}`] = item.se_ver;
      replacements[`se_seq_${i}`] = item.se_seq;
      replacements[`ship_seq_${i}`] = item.ship_seq;
      replacements[`pk_seq_${i}`] = item.pk_seq; 
      return `(:factory_code_${i}, :se_id_${i}, :pack_gu_${i}, :se_ver_${i}, :se_seq_${i}, :ship_seq_${i}, :pk_seq_${i})`;
    });
    const tupleList = tuples.join(", ");

    const deleteSizeSql = `
      DELETE FROM "Customs".SE_PLAN_SIZE
      WHERE (FACTORY_CODE, SE_ID, PACK_GU, SE_VER, SE_SEQ, SHIP_SEQ, PK_SEQ) IN (${tupleList})
    `;
    const deletedSizes = await pool.query(deleteSizeSql, {
      replacements,
      type: pool.QueryTypes.DELETE,
      transaction: t,
    });

    //  Bỏ hẳn đoạn DELETE "Customs".SE_PLAN_ORD — bulk delete cấp DETAIL
    // không được phép đụng tới bảng master

    //  Recalc lại p_shipqty/cbm cho (các) master bị ảnh hưởng.
    // Thực tế theo luồng FE hiện tại, tất cả item check đều thuộc cùng 1 master
    // (vì selectCheckSPS chỉ lấy trong 1 page của 1 selectRows[0] đang chọn),
    // nhưng vẫn dedupe theo composite key để an toàn nếu sau này FE cho phép
    // check xuyên nhiều master.
    const uniqueParents = new Map();
    for (const item of items) {
      const key = `${item.factory_code}|${item.se_id}|${item.pack_gu}|${item.se_ver}|${item.se_seq}|${item.ship_seq}`;
      if (!uniqueParents.has(key)) {
        uniqueParents.set(key, item);
      }
    }
    for (const parent of uniqueParents.values()) {
      await updateSePlanOrdSummary(
        parent.factory_code,
        parent.se_id,
        parent.pack_gu,
        parent.se_seq,
        parent.se_ver,
        parent.ship_seq,
        t,
      );
    }

    return {
      deleted_sizes: deletedSizes[1] || 0,
    };
  } catch (error) {
    console.log("Cannot bulk delete SE_PLAN_SIZE from db", error);
    throw error;
  }
}
async function confirmItems(
  items,
  factory_code,
  department_code,
  user_code,
  query_level,
  t,
) {
  return bulkUpdateMasterStatus(
    items,
    7,        // newStatus
    [1, 2],   // allowedFromStatuses — khớp handleStatusChange(7,"confirm",[1,2]) bên FE
    factory_code,
    department_code,
    user_code,
    query_level,
    t,
  );
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
  console.log("vvb",factory_code,department_code,user_code,query_level,items);
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
    replacements[`pk_seq_${i}`] = item.pk_seq;
    return `(:factory_code_${i}, :se_id_${i}, :pack_gu_${i}, :se_ver_${i}, :se_seq_${i}, :ship_seq_${i}, :pk_seq_${i})`;
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
      UPDATE "Customs".se_plan_size
      SET status = :new_status, last_user = :user_code, last_date = NOW()
      WHERE (factory_code, se_id, pack_gu, se_ver, se_seq, ship_seq, pk_seq) IN (${tupleList})
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
    console.log("Cannot bulk update status SE_PLAN_SIZE from db", error);
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
module.exports = {
  listAllSePlanSize,
  getByID,
  getCtns,
  add,
  edit,
  deleteImp,
  search,
  getSizePlanShipQty,
  autoGenerateSePlanSize,
  updateSePlanOrdSummary,
  confirm,
  unconfirmItems,
  deleteItem,
  deleteItems,
  confirmItems,
  bulkUpdateMasterStatus,
};
 