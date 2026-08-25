const AC_CO_M = require("./ac_co_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function listAllAcCoM(
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
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

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
      T.FACTORY_CODE,
        T.co_id, T.se_id, T.se_seq, T.pack_gu, T.ship_seq,
        T.fa_cbm, T.net_weight, T.gross, T.board_date, T.bl_no,
        T.sort,
        "Customs".GF_CODE_NAME(T.factory_code, 'SORT', T.sort, :p_charset) AS sort_name,
        T.print_id, T.boat_cbm, T.otcbm, T.sorting_cbm, T.co_no,
        T.el_no, T.elno,
        "Customs".GF_CODE_NAME(T.factory_code, 'CHGCY', T.elno, :p_charset) AS el_country,
        T.ar_no, T.ws_no, T.ql_date, T.by_out, T.invoice_no,
        T.ship_order, T.zip_invoice, T.mer_po, T.po, T.destination,
        "Customs".GF_CODE_NAME(T.factory_code, 'SHIPDEST', T.destination, :p_charset) AS dest_name,
        T.boat_company,
        "Customs".GF_CODE_NAME(T.factory_code, 'AGENT', T.boat_company, :p_charset) AS boat_companynm,
        T.boat_name, T.note, T.is_prt,
        CASE T.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name,
        T.status,
        T.locked_information,
        T.grt_dept,
        "Customs".GF_DEPTNM(T.factory_code, T.grt_dept, :p_charset) AS grt_deptname,
        T.grt_user,
        "Customs".GF_EMPNM(T.grt_user, :p_charset) AS grt_username,
        T.grt_date, T.last_user,
        "Customs".GF_EMPNM(T.last_user, :p_charset) AS last_username,
        T.last_date
      FROM "Customs".ac_co_m T
      WHERE  ${permissionCondition}
      ORDER BY T.co_id, T.se_id, T.se_seq, T.ship_seq
      LIMIT :limit OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return { rows: actualRows, hasMore };
  } catch (error) {
    console.error("Error in listAllAcCoM:", error);
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
async function getAllShipOrderToExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters = {},
) {
  try {
    const charset = { en: "E", vi: "L", zh: "T" };
    const p_charset = charset[language] || "E";

    let permissionCondition = "1=1";
    const replacements = {
      factory_code:    factory_code || null,
      p_charset,
      se_id1:          filters.se_id1          || null,
      cust_id:         filters.cust_id          || null,
      s_date:          filters.s_date           || null,
      e_date:          filters.e_date           || null,
      s_bdate:         filters.s_bdate          || null,
      e_bdate:         filters.e_bdate          || null,
      print_id:        filters.print_id         || null,
      status:          filters.status !== undefined ? filters.status : null,
      ship_plan_sdate: filters.ship_plan_sdate  || null,
      ship_plan_edate: filters.ship_plan_edate  || null,
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "A.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "A.grt_dept = :permission_dept AND A.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "A.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
        A.factory_code,
        TO_CHAR(B.nlt, 'YYYY/MM/DD')                                                        AS nlt,
        "Customs".GF_CUSTID_CUSTNO(B.org_id, B.se_custid)                                   AS cust_no,
        B.po, B.mer_po, B.cust_lot, B.cr_prod, B.prod_no, B.se_qty, B.ori_se_id,
        A.se_id, A.se_ver, A.pack_gu, A.se_seq, A.ship_seq,
        COALESCE(A.net_weight, 0)                                                             AS net_weight,
        COALESCE(A.gross, 0)                                                                  AS gross,
        COALESCE(A.fa_cbm, 0)                                                                 AS fa_cbm,
        TO_CHAR(A.board_date, 'YYYY/MM/DD')                                                  AS board_date,
        A.boat_name,
        "Customs".GF_CODE_NAME(A.factory_code, 'SHIPDEST', A.destination, :p_charset)       AS dest_nm,
        "Customs".GF_CODE_NAME(A.factory_code, 'AGENT', A.boat_company, :p_charset)         AS boat_company_nm,
        COALESCE(A.boat_cbm, 0)                                                               AS boat_cbm,
        A.ar_no,
        COALESCE(A.otcbm, 0)                                                                  AS over_cbm,
        COALESCE(A.sorting_cbm, 0)                                                            AS sorting_cbm,
        A.co_no, A.el_no, A.bl_no,
        "Customs".GF_CODE_NAME(A.factory_code, 'CHGCY', A.elno, :p_charset)                 AS country,
        A.ws_no,
        TO_CHAR(A.ql_date, 'YYYY/MM/DD')                                                     AS ql_date,
        TO_CHAR(A.by_out,  'YYYY/MM/DD')                                                     AS by_out,
        A.ship_order, A.zip_invoice, A.invoice_no, A.note,
        TO_CHAR(SP.min_ship_date, 'YYYY/MM/DD')                                              AS plan_ship_date,
        ACPR.customs_tariff,
        APO.ac_no,
        CHG.ac_chgno,
        TO_CHAR(CHG.out_date, 'YYYY/MM/DD')                                                  AS out_date,
        PKM.pack_ctns                                                                          AS ctns,
        CHG.sh_pairs,
        CHG.sum_money,
        INV.invoice_id,
        INV.invoice_no_inv                                                                    AS sales_invoice,
        ZIP.zip_price_str,
        ZIP.zip_price,
        PM.prod_mat
      FROM "Customs".ac_co_m A
      LEFT JOIN "pac".SD_ORD_M_C B
        ON  A.factory_code = B.org_id
        AND A.se_id        = B.se_id
        AND A.pack_gu      = B.pack_gu
        AND A.se_seq       = B.se_seq
      LEFT JOIN LATERAL (
        SELECT MIN(p_shipdate) AS min_ship_date
        FROM "Customs".SE_PLAN_ORD
        WHERE factory_code = A.factory_code
          AND se_id        = A.se_id
          AND pack_gu      = A.pack_gu
          AND se_seq       = A.se_seq::TEXT
          AND ship_seq     = A.ship_seq
      ) SP ON TRUE
      LEFT JOIN LATERAL (
        SELECT X.customs_tariff
        FROM "Customs".AC_SHOE_M X
        JOIN "Customs".AC_SHOE_REF Y
          ON  X.factory_code    = Y.factory_code
          AND X.customs_shoe_id = Y.customs_shoe_id
        WHERE Y.factory_code = A.factory_code
          AND X.status       > 0
        LIMIT 1
      ) ACPR ON TRUE
      LEFT JOIN LATERAL (
        SELECT ac_no
        FROM "Customs".AC_PLAN_ORD
        WHERE factory_code = A.factory_code
          AND se_id        = A.se_id
          AND pack_gu      = A.pack_gu
         AND se_seq       = A.se_seq::TEXT
          AND ship_seq     = A.ship_seq
        LIMIT 1
      ) APO ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          ac_chgno,
          out_date,
          COALESCE(peice,     0) AS sh_ctns,
          COALESCE(sum_qty,   0) AS sh_pairs,
          COALESCE(sum_money, 0) AS sum_money
        FROM "Customs".VW_CHG_EXP
        WHERE factory_code = A.factory_code
          AND ac_no        = APO.ac_no
        LIMIT 1
      ) CHG ON TRUE
      LEFT JOIN LATERAL (
        SELECT MAX(M.invoice_id) AS invoice_id, MAX(M.invoice_no) AS invoice_no_inv
        FROM "Customs".SE_INV_M M
        JOIN "Customs".SE_INV_D D
          ON  M.factory_code = D.factory_code
          AND M.invoice_id   = D.invoice_id
        JOIN "Customs".AC_CHG_M C
          ON  M.factory_code = C.factory_code
          AND M.ac_no        = C.ac_no
        WHERE M.ac_no        = APO.ac_no
          AND D.factory_code = A.factory_code
          AND D.se_id        = A.se_id
          AND D.se_seq       = A.se_seq::TEXT
          AND D.pack_gu      = A.pack_gu
          AND D.ship_seq     = A.ship_seq
         AND M.status       > 0
          AND C.status       > 0
      ) INV ON TRUE
      LEFT JOIN LATERAL (
        SELECT SUM(COALESCE(ctns, 0)) AS pack_ctns
        FROM "pac".SD_PACK_M
        WHERE factory_code = A.factory_code
          AND se_id        = A.se_id
          AND pack_gu      = A.pack_gu
          AND se_seq       = A.se_seq
      ) PKM ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          (X.adj_price * Y.se_qty)::TEXT || Y.curr_no AS zip_price_str,
          X.adj_price                                   AS zip_price
        FROM "pac".SD_PRICE_ITEM X
        JOIN "pac".SD_ORD_M Y
          ON  X.org_id = Y.org_id
          AND X.se_id  = Y.se_id
          AND X.se_seq = Y.se_seq
        WHERE X.org_id = A.factory_code
          AND X.se_id  = A.se_id
          AND X.se_seq = A.se_seq
        LIMIT 1
      ) ZIP ON TRUE
      LEFT JOIN LATERAL (
        SELECT X.prod_acno AS prod_mat
        FROM "Customs".AC_PROD_M X
        JOIN "Customs".AC_SHOE_REF Y
          ON  X.factory_code    = Y.factory_code
          AND X.customs_shoe_id = Y.customs_shoe_id
        LIMIT 1
      ) PM ON TRUE
      WHERE ${permissionCondition}
        AND A.factory_code = :factory_code
        AND (:se_id1     IS NULL OR A.se_id LIKE :se_id1 || '%')
        AND (:cust_id    IS NULL OR "Customs".GF_CUSTID_CUSTNO(A.factory_code, A.cust_id) = :cust_id)
        AND (:s_date     IS NULL OR DATE_TRUNC('day', "Customs".GF_SE_NLT(A.factory_code, A.se_id, A.se_ver, A.se_seq)) >= DATE_TRUNC('day', :s_date::timestamptz))
        AND (:e_date     IS NULL OR DATE_TRUNC('day', "Customs".GF_SE_NLT(A.factory_code, A.se_id, A.se_ver, A.se_seq)) <= DATE_TRUNC('day', :e_date::timestamptz))
        AND (:s_bdate    IS NULL OR DATE_TRUNC('day', A.board_date) >= DATE_TRUNC('day', :s_bdate::timestamptz))
        AND (:e_bdate    IS NULL OR DATE_TRUNC('day', A.board_date) <= DATE_TRUNC('day', :e_bdate::timestamptz))
        AND (:print_id   IS NULL OR A.print_id = :print_id)
        AND (:status     IS NULL OR A.status   = :status::int)
        AND (
         (:ship_plan_sdate IS NULL AND :ship_plan_edate IS NULL)
          OR (A.factory_code, A.se_id, A.se_ver, A.se_seq::TEXT, A.ship_seq) IN (
           SELECT factory_code, se_id::TEXT, se_ver, se_seq, ship_seq
            FROM "Customs".SE_PLAN_ORD
           WHERE factory_code = :factory_code
             AND (:ship_plan_sdate IS NULL OR DATE_TRUNC('day', p_shipdate) >= DATE_TRUNC('day', :ship_plan_sdate::timestamptz))
             AND (:ship_plan_edate IS NULL OR DATE_TRUNC('day', p_shipdate) <= DATE_TRUNC('day', :ship_plan_edate::timestamptz))
          )
        )
      ORDER BY A.co_id, A.se_id, A.se_seq, A.ship_seq
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
      logging: console.log,
    });

    return rows;
  } catch (error) {
    console.error("Error in getAllShipOrderToExcel:", error);
    throw error;
  }
}

async function createCoid(
  factory_code,
) {
  let replacements = {
    factory_code: factory_code,
  };
  try {
    const sql = `
      SELECT COALESCE(MAX(CO_ID),0)+1 as new_co_id
      FROM "Customs".ac_co_m WHERE FACTORY_CODE=:factory_code
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const newCoid = rows[0]?.new_co_id;
    return newCoid;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getByID(factory_code, co_id) {
  const acBomM = await AC_CO_M.findOne({
    where: {
      factory_code: factory_code,
      co_id: co_id,
    },
    include: [FACTORY],
  });
  if (!acBomM) {
    console.log("No ac bom m found!");
    return null;
  }
  return acBomM;
}
async function getPosition(keys, pageSize, model, t, permission) {
  try {
    const orderFields = Object.keys(keys);
    const orConditions = [];
    for (let i = 0; i < orderFields.length; i++) {
      const condition = {};
      for (let j = 0; j < i; j++) {
        condition[orderFields[j]] = keys[orderFields[j]];
      }
      condition[orderFields[i]] = {
        [Op.lt]: keys[orderFields[i]],
      };
      orConditions.push(condition);
    }
    const position = await model.count({
      where: {
        [Op.or]: orConditions,
        ...permission,
      },
      transaction: t,
    });
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
  acBomM,
  pageSize,
  t,
) {
  const addItem = await AC_CO_M.create(acBomM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      co_id: addItem.co_id,
    },
    pageSize,
    AC_CO_M,
    t,
    permission,
  );
  return { data: addItem, ...positionInfo };
}

async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existacBomM,
  editacBomM,
  pageSize,
  t,
) {
  try {
    const editItem = await existacBomM.update(editacBomM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        co_id: editItem.co_id,
      },
      pageSize,
      AC_CO_M,
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
async function deleteABM(existacBomM, t) {
  try {
    const deleteImp = await existacBomM.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete ac bom m from db", error);
  }
}
async function fetchFieldDropdown(
  factory_code,
  field = null,
  page,
  limit,
  search,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
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
  if (field) {
    sql = `
    SELECT 
    DISTINCT ${field} 
    FROM "Customs".AC_CO_M 
    WHERE ${permissionCondition} 
    ${searchCondition}
    ORDER BY ${field} 
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
      FROM "Customs".AC_CO_M 
    WHERE ${permissionCondition} 
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
async function search(
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    let charset = { en: "E", vi: "L", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      se_id: filters.se_id || null,
      cust_id: filters.cust_id || null,
      s_date: filters.s_date_3 || null,
      e_date: filters.e_date_3 || null,
      s_bdate: filters.s_date_2 || null,
      e_bdate: filters.e_date_2 || null,
      print_id: filters.print_id || null,
      status: filters.status ?? null,
      ship_plan_sdate: filters.s_date_1 || null,
      ship_plan_edate: filters.e_date_2 || null,
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

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
         T.FACTORY_CODE,T.co_id, T.se_id, T.se_seq, T.pack_gu, T.ship_seq,
        T.fa_cbm, T.net_weight, T.gross, T.board_date, T.bl_no,
        T.sort,
        T.status,
        T.locked_information,
        "Customs".GF_CODE_NAME(T.factory_code, 'SORT', T.sort, :p_charset) AS sort_name,
        T.print_id, T.boat_cbm, T.otcbm, T.sorting_cbm, T.co_no,
        T.el_no, T.elno,
        "Customs".GF_CODE_NAME(T.factory_code, 'CHGCY', T.elno, :p_charset) AS el_country,
        T.ar_no, T.ws_no, T.ql_date, T.by_out, T.invoice_no,
        T.ship_order, T.zip_invoice, T.mer_po, T.po, T.destination,
        "Customs".GF_CODE_NAME(T.factory_code, 'SHIPDEST', T.destination, :p_charset) AS dest_name,
        T.boat_company,
        "Customs".GF_CODE_NAME(T.factory_code, 'AGENT', T.boat_company, :p_charset) AS boat_companynm,
        T.boat_name, T.note, T.is_prt,
        CASE T.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name,
        T.grt_dept,
        "Customs".GF_DEPTNM(T.factory_code, T.grt_dept, :p_charset) AS grt_deptname,
        T.grt_user,
        "Customs".GF_EMPNM(T.grt_user, :p_charset) AS grt_username,
        T.grt_date, T.last_user,
        "Customs".GF_EMPNM(T.last_user, :p_charset) AS last_username,
        T.last_date
      FROM "Customs".ac_co_m T
      WHERE T.factory_code = :factory_code
        AND ${permissionCondition}
        AND (:se_id          IS NULL OR T.se_id ILIKE :se_id || '%')
        AND (:cust_id        IS NULL OR "Customs".GF_CUSTID_CUSTNO(T.factory_code, T.cust_id) = :cust_id)
        AND (:s_date         IS NULL OR DATE("Customs".GF_SE_NLT(T.factory_code, T.se_id, T.se_ver, T.se_seq)) >= DATE(:s_date))
        AND (:e_date         IS NULL OR DATE("Customs".GF_SE_NLT(T.factory_code, T.se_id, T.se_ver, T.se_seq)) <= DATE(:e_date))
        AND (:s_bdate        IS NULL OR DATE(T.board_date) >= DATE(:s_bdate))
        AND (:e_bdate        IS NULL OR DATE(T.board_date) <= DATE(:e_bdate))
        AND (:print_id       IS NULL OR T.print_id = :print_id)
        AND (:status         IS NULL OR T.status = :status OR :status = 99)
        AND (
          (:ship_plan_sdate IS NULL AND :ship_plan_edate IS NULL)
          OR EXISTS (
            SELECT 1 FROM "Customs".se_plan_ord S
            WHERE S.factory_code = T.factory_code
              AND S.se_id        = T.se_id
              AND S.se_ver       = T.se_ver
              AND S.se_seq       = T.se_seq::TEXT
              AND S.ship_seq     = T.ship_seq
              AND (:ship_plan_sdate IS NULL OR DATE(S.p_shipdate) >= DATE(:ship_plan_sdate))
              AND (:ship_plan_edate IS NULL OR DATE(S.p_shipdate) <= DATE(:ship_plan_edate))
          )
        )
      ORDER BY T.co_id, T.se_id, T.se_seq, T.ship_seq
      LIMIT :limit OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    let total = null;
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    if (parseInt(offset) === 0) {
      const countSql = `
        SELECT COUNT(*) AS count
        FROM "Customs".ac_co_m T
        WHERE T.factory_code = :factory_code
          AND ${permissionCondition}
          AND (:se_id          IS NULL OR T.se_id ILIKE :se_id || '%')
          AND (:cust_id        IS NULL OR "Customs".GF_CUSTID_CUSTNO(T.factory_code, T.cust_id) = :cust_id)
          AND (:s_date         IS NULL OR DATE("Customs".GF_SE_NLT(T.factory_code, T.se_id, T.se_ver, T.se_seq)) >= DATE(:s_date))
          AND (:e_date         IS NULL OR DATE("Customs".GF_SE_NLT(T.factory_code, T.se_id, T.se_ver, T.se_seq)) <= DATE(:e_date))
          AND (:s_bdate        IS NULL OR DATE(T.board_date) >= DATE(:s_bdate))
          AND (:e_bdate        IS NULL OR DATE(T.board_date) <= DATE(:e_bdate))
          AND (:print_id       IS NULL OR T.print_id = :print_id)
          AND (:status         IS NULL OR T.status = :status OR :status = 99)
          AND (
            (:ship_plan_sdate IS NULL AND :ship_plan_edate IS NULL)
            OR EXISTS (
              SELECT 1 FROM "Customs".se_plan_ord S
              WHERE S.factory_code = T.factory_code
                AND S.se_id        = T.se_id
                AND S.se_ver       = T.se_ver
                AND S.se_seq       = T.se_seq::TEXT
                AND S.ship_seq     = T.ship_seq
                AND (:ship_plan_sdate IS NULL OR DATE(S.p_shipdate) >= DATE(:ship_plan_sdate))
                AND (:ship_plan_edate IS NULL OR DATE(S.p_shipdate) <= DATE(:ship_plan_edate))
            )
          )
      `;
      const countResult = await pool.query(countSql, {
        replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.count);
    }

    return { rows: actualRows, count: total, hasMore };
  } catch (error) {
    console.error("Error in searchAcCoM:", error);
    throw error;
  }
}

module.exports = {
  listAllAcCoM,
  getByID,
  createCoid,
  add,
  edit,
  deleteABM,
  search,
  fetchFieldDropdown,
  getAllShipOrderToExcel
};
