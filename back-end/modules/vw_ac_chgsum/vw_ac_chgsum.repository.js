const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function listAllVwAcChgsum(
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
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "s.org_id = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "s.grt_dept = :permission_dept AND s.org_id = :factory_code";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "s.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      S.src,
        S.org_id,
        S.ac_no,
        S.ac_chgno,
        S.ac_date,
        S.cont_no,
        S.ac_itemno,
        "Customs".GF_AC_ITEMNAME(S.org_id, S.ac_itemno, :p_charset) AS ac_itemname,
        S.qty,
        S.over_qty,
        CASE S.d_type
          WHEN '1' THEN '1-Local VAT'
          WHEN '2' THEN '2-Direct Import'
          WHEN '3' THEN '3-Import VN'
          WHEN '4' THEN '4-Direct Imp A12'
          WHEN '5' THEN '5-無(None)'
          WHEN '6' THEN '6-其它Other'
        END AS d_type,
        CASE S.stoc_type
          WHEN '1' THEN '1-非保稅'
          WHEN '2' THEN '2-保稅'
          WHEN '3' THEN '3-None'
          WHEN '4' THEN '4-VAT'
        END AS stoc_type,
        S.com_invoice,
        "Customs".GF_INVOICE_FACTDATE(S.org_id, S.ac_no, S.src, S.com_invoice, S.sort) AS fact_date,
        S.status
      FROM "Customs".vw_ac_chgsum S
      WHERE  ${permissionCondition}
      ORDER BY S.ac_date ASC
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
    console.error("Error in fetchAllVwAcChgsum:", error);
    throw error;
  }
}
// ============================================================
// exportExcelVwAcChgsum — lấy data cho nút OUT_EXCEL
// Logic price:
//   - SRC != '9' → dùng S.price
//   - SRC = '9' AND ac_proc_m.mark = 'B' → AVG(ac_proc_d.ref_price)
//   - SRC = '9' AND ac_proc_m.mark != 'B' → dùng S.price
// ============================================================
async function listOutVwAcChgsum(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
  language,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      // filter fields
      ac_chgno: filters.ac_chgno || null,
      ac_itemno: filters.ac_itemno || null,
      s_outdate: filters.s_date_1 || null,
      e_outdate: filters.e_date_2 || null,
      cont_no: filters.cont_no || null,
      status: filters.status ?? null,
      src: filters.src || null,
      stoc_type: filters.stoc_type || null,
      s_fact: filters.s_date_1 || null,
      e_fact: filters.e_date_2 || null,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "s.org_id = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "s.grt_dept = :permission_dept AND s.org_id = :factory_code";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "s.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      S.src,
        s.org_id,
        S.ac_no,
        S.ac_chgno,
        CASE S.stoc_type
          WHEN '1' THEN '非保稅'
          WHEN '2' THEN '保稅'
          WHEN '3' THEN 'None'
          ELSE 'VAT'
        END AS stoc_type,
        "Customs".GF_AC_ITEMNAME(s.org_id, S.ac_itemno, :p_charset) AS ac_itemnm,
        S.ac_itemno,
        S.money,
        S.curr_rate,
        S.b_money,
        "Customs".GF_CODE_NAME(
          s.org_id,
          '1105',
          "Customs".GF_AC_ITEMUNIT(s.org_id, S.ac_itemno),
          :p_charset
        ) AS unitnm,
        S.ac_date,
        S.qty,
        S.src,
        S.over_qty,
        "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort) AS fact_date,
        -- Logic tính price theo SRC và MARK
        CASE
          WHEN S.src = '9' AND PM.mark = 'B' THEN
            COALESCE((
              SELECT AVG(PD.ref_price)
              FROM "Customs".ac_proc_d PD
              WHERE PD.factory_code = s.org_id
                AND PD.ac_no = S.ac_no
                AND PD.ac_itemno = S.ac_itemno
            ), 0)
          ELSE COALESCE(S.price, 0)
        END AS price
      FROM "Customs".vw_ac_chgsum S
      -- Join ac_proc_m để lấy mark (chỉ cần khi src='9')
      LEFT JOIN "Customs".ac_proc_m PM
        ON S.src = '9'
        AND PM.factory_code = s.org_id
        AND PM.ac_no = S.ac_no
      WHERE ${permissionCondition}
        AND (:ac_chgno  IS NULL OR S.ac_chgno ILIKE :ac_chgno || '%')
        AND (:ac_itemno IS NULL OR S.ac_itemno = :ac_itemno)
        AND (:cont_no   IS NULL OR S.cont_no = :cont_no)
        AND (:src       IS NULL OR S.src = :src)
        AND (:stoc_type IS NULL OR S.stoc_type = :stoc_type)
        AND (:s_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) >= DATE_TRUNC('day', :s_outdate::timestamp))
        AND (:e_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) <= DATE_TRUNC('day', :e_outdate::timestamp))
        AND (
          :status IS NULL
          OR (:status = 1 AND (COALESCE(S.over_qty, 0) <= 0 OR S.status = 9))
          OR (:status = 2 AND COALESCE(S.over_qty, 0) > 0 AND S.status <> 9)
        )
        AND (
          :s_fact IS NULL OR
          DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
         >= DATE_TRUNC('day', :s_fact::timestamp)
      )
        AND (
         :e_fact IS NULL OR
         DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
          <= DATE_TRUNC('day', :e_fact::timestamp)
        )
      ORDER BY S.ac_date ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in exportExcelVwAcChgsum:", error);
    throw error;
  }
}
async function getContractSetting(
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
      vi: "S",
      zh: "T",
      en: "E",
    };

    let replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

    // Permission logic
    let permissionCondition = "1=1";
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
      m.factory_code, 
        m.CONT_NO,
        m.cont_type,
        m.cont_category,
        CASE m.CONT_CATEGORY 
          WHEN '1' THEN '1-小合同' 
          WHEN '2' THEN '2-大合同' 
        END AS cont_category_name,
        m.ISSUED_DATE,
        m.EXPIRE_DATE,
        m.D_TYPE,
        m.BIG_CONTNO,
        m.LAST_EDATE,
        m.BVEND_NO,
        m.BUYER,
        m.B_ADDR,
        m.VEND_NO,
        m.SELLER,
        m.S_ADDR,
        m.CURRENCY,
        m.TERM_PAY,
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'PAYMENT_WAY', m.TERM_PAY, :p_charset) AS TERM_PAYNM,
        m.S_PIC,
        m.S_POSITION,
        m.S_ACCNO,
        m.P_SELLER,
        m.BANK,
        m.BANK_IC,
        m.BANK_ADDR,
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, '1105', m.CURRENCY, :p_charset) AS CURRENCYNM,
        m.PAY_TERM,
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'PAYMENT_WAY', m.PAY_TERM, :p_charset) AS PAY_TERMNM,
        m.FREIGHT,
        m.INSURANCE,
        m.GOODS_ORIGIN,
        m.SUM_QTY,
        m.SUM_MONEY,
        m.NOTE,
        m.LAST_USER,
        "Customs".GF_EMPNM(m.LAST_USER, :p_charset) AS LAST_USERNM,
        m.LAST_DATE,
        m.GRT_DEPT,
        "Customs".GF_DEPTNM(m.FACTORY_CODE, m.GRT_DEPT, :p_charset) AS GRT_DEPTNM,
        m.GRT_USER,
        "Customs".GF_EMPNM(m.GRT_USER, :p_charset) AS GRT_USERNM,
        m.STATUS,
        m.locked_information
      FROM "Customs".VW_CONT_EXP m
      WHERE 
        ${permissionCondition}
        AND m.FACTORY_CODE = :factory_code
      ORDER BY m.CONT_NO
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
    return { rows: actualRows, hasMore: hasMore, count: total };
  } catch (error) {
    console.error("Error fetching contract details:", error);
    throw error;
  }
}
async function getContno(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
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
  try {
    const sql = `
      SELECT cont_no 
      FROM "Customs".VW_CONT_EXP 
        WHERE 
        ${permissionCondition} 
        AND status=7 
        AND cont_category='2'
      LIMIT 1
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const newItem = rows?.length > 0 ? rows[0] : {};
    console.log("new item", rows, newItem);
    return newItem;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function fetchFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  cont_no,
  page,
  limit,
  search,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cont_no: cont_no,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
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
  if (field) {
    sql = `
       SELECT ${field} 
        FROM "Customs".VW_CONT_EXP 
        WHERE 
        ${permissionCondition} 
        AND cont_no= :cont_no
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".VW_CONT_EXP
        WHERE 
        ${permissionCondition} 
        AND cont_no=:cont_no
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
      data: rows[0],
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in fetchFieldDropdown:", error);
    throw error;
  }
}
async function fetchInAcnoDataDropdown(
  factory_code,
  src,
  out_dtype,
  matd_no,
  page,
  limit,
  search,
) {
  let replacements = {
    factory_code: factory_code,
    src: src || null,
    out_dtype: out_dtype || null,
    matd_no: matd_no || null,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        AC_NO ILIKE :search OR
        AC_CHGNO ILIKE :search OR
        CAST(AC_DATE AS VARCHAR) ILIKE :search OR
        D_TYPE ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }

  const baseCondition = `
   FROM "Customs".VW_AC_CHGSUM
  WHERE ORG_ID = :factory_code
  --AND      SRC = :src
  AND      AC_ITEMNO = :matd_no
  AND      COALESCE(OVER_QTY,0) > 0
  AND      STATUS = 7
  AND     ((:out_dtype = '1' AND d_type IN ('2','3','1'))
  OR        (:out_dtype = '2' AND d_type IN ('4','1')))
    ${searchCondition}
  `;

  const sql = `
    SELECT AC_NO, AC_CHGNO, AC_DATE, D_TYPE 
    ${baseCondition}
    ORDER BY AC_DATE
    LIMIT :limit
    OFFSET :offset
  `;

  const countSql = `
    SELECT COUNT(*) as total
    ${baseCondition}
  `;

  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const totalResult = await pool.query(countSql, {
      replacements,
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
    console.error("Error in fetchInAcnoDataDropdown:", error);
    throw error;
  }
}
async function fetchInContDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  page,
  limit,
  search,
  mark = "A",
  vend_no,
  d_type,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    vend_no: vend_no || null,
    d_type: d_type || null,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
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
  if (field && mark === "A") {
    sql = `
       SELECT ${field} 
        FROM "Customs".VW_CONT_EXP 
        WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND status = 7
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".VW_CONT_EXP
       WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND status = 7
        ${searchCondition}
      `;
  } else if (mark === "B") {
    sql = `
       SELECT ${field} 
        FROM "Customs".VW_CONT_EXP 
        WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND vend_no = :vend_no
        AND d_type = :d_type
        AND status = 7
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".VW_CONT_EXP
       WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND vend_no = :vend_no
        AND d_type = :d_type
        AND status = 7
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
// VW_CONT_EXP.repository.js
async function copyContract(
  factory_code,
  department_code,
  user_code,
  query_level,
  old_cont_no,
  new_cont_no,
) {
  console.log(
    "pass",
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
  );

  const transaction = await pool.transaction();

  try {
    let permissionCondition = "1=1";

    const replacements = {
      factory_code,
      old_cont_no,
      new_cont_no,
      grt_dept: department_code,
      grt_user: user_code,
      last_user: user_code,
      // ✅ Thêm các permission keys
      permission_factory: factory_code,
      permission_dept: department_code,
      permission_user: user_code,
    };

    // ✅ Logic permission không đổi
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "factory_code = :permission_factory";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "grt_dept = :permission_dept AND factory_code = :permission_factory";
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
      }
    }

    // ==================== VALIDATION ====================

    // 1. Kiểm tra hợp đồng cũ có tồn tại không (với permission)
    const checkOldContract = `
      SELECT COUNT(*) as count 
      FROM "Customs".AC_CONT_M 
      WHERE ${permissionCondition}
        AND FACTORY_CODE = :factory_code 
        AND CONT_NO = :old_cont_no
    `;

    const [checkResult] = await pool.query(checkOldContract, {
      replacements,
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    console.log("check result ddd", checkResult.count);

    if (checkResult.count === 0) {
      throw new Error(
        `Source contract '${old_cont_no}' not found or you don't have permission to access it`,
      );
    }

    // 2. Kiểm tra hợp đồng mới đã tồn tại chưa
    const checkNewContract = `
      SELECT COUNT(*) as count 
      FROM "Customs".AC_CONT_M 
      WHERE FACTORY_CODE = :factory_code 
        AND CONT_NO = :new_cont_no
    `;

    const [newCheckResult] = await pool.query(checkNewContract, {
      replacements: {
        factory_code: replacements.factory_code,
        new_cont_no: replacements.new_cont_no,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (newCheckResult.count > 0) {
      throw new Error(`Contract '${new_cont_no}' already exists`);
    }

    // ==================== COPY DATA ====================

    // 3. Copy AC_CONT_M (Master table)
    const sqlCopyMaster = `
      INSERT INTO "Customs".AC_CONT_M (
        FACTORY_CODE, CONT_NO, CONT_TYPE, ISSUED_DATE, EXPIRE_DATE, 
        SELLER, S_ADDR, S_PIC, S_POSITION, S_ACCNO,
        BUYER, B_ADDR, B_PIC, B_POSITION, B_ACCNO,
        SUM_MONEY, CURRENCY, FREIGHT, INSURANCE, 
        TERM_PAY, PAY_TERM, TIME_DELIVE, GOODS_ORIGIN, NOTE, PORT_DIS,
        STATUS, GRT_DEPT, GRT_USER, LAST_USER, LAST_DATE,
        VEND_NO, BVEND_NO, BANK, BANK_IC, BANK_ADDR,
        D_TYPE, CONT_CATEGORY, BIG_CONTNO
      )
      SELECT 
        FACTORY_CODE, 
        :new_cont_no,
        CONT_TYPE, ISSUED_DATE, EXPIRE_DATE,
        SELLER, S_ADDR, S_PIC, S_POSITION, S_ACCNO,
        BUYER, B_ADDR, B_PIC, B_POSITION, B_ACCNO,
        SUM_MONEY, CURRENCY, FREIGHT, INSURANCE,
        TERM_PAY, PAY_TERM, TIME_DELIVE, GOODS_ORIGIN, NOTE, PORT_DIS,
        '1',
        :grt_dept,
        :grt_user,
        :last_user,
        NOW(),
        VEND_NO, BVEND_NO, BANK, BANK_IC, BANK_ADDR,
        D_TYPE, CONT_CATEGORY, BIG_CONTNO
      FROM "Customs".AC_CONT_M
      WHERE ${permissionCondition} 
        AND FACTORY_CODE = :factory_code
        AND CONT_NO = :old_cont_no
    `;

    await pool.query(sqlCopyMaster, {
      replacements,
      transaction,
      type: pool.QueryTypes.INSERT,
    });

    // Đếm xem insert được bao nhiêu
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM "Customs".AC_CONT_M 
       WHERE FACTORY_CODE = :factory_code 
      AND CONT_NO = :new_cont_no`,
      {
        replacements: { factory_code, new_cont_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );
    const masterInserted = countResult.count;
    if (masterInserted === 0) {
      throw new Error(`Failed to copy contract`);
    }
    // 4. Copy AC_CONT_D (Detail table)
    const sqlCopyDetail = `
      INSERT INTO "Customs".AC_CONT_D (
        FACTORY_CODE, CONT_NO, SEQ, GOODS_CODE, COLOR,
        CONT_QTY, CONT_PRICE, CONT_MONEY,
        USED_QTY, UNIT, SHOE_ID, STOCK_QTY
      )
      SELECT 
        FACTORY_CODE,
        :new_cont_no,
        SEQ, GOODS_CODE, COLOR,
        CONT_QTY, CONT_PRICE, CONT_MONEY,
        0,
        UNIT, SHOE_ID,
        CONT_QTY
      FROM "Customs".AC_CONT_D
      WHERE FACTORY_CODE = :factory_code
        AND CONT_NO = :old_cont_no
    `;

    const [detailResult] = await pool.query(sqlCopyDetail, {
      replacements: {
        factory_code: replacements.factory_code,
        old_cont_no: replacements.old_cont_no,
        new_cont_no: replacements.new_cont_no,
      },
      transaction,
      type: pool.QueryTypes.INSERT,
    });

    const detailCount = detailResult.affectedRows || 0;

    await transaction.commit();

    return {
      success: true,
      message: "Contract copied successfully",
      new_cont_no,
      details: {
        master_copied: masterInserted,
        detail_copied: detailCount,
        warning:
          detailCount === 0
            ? "No detail records found in source contract"
            : null,
      },
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error copying contract:", error);
    throw error;
  }
}
// ==================== HÀM PHỤ ====================

async function GF_PARAM_VALUE(factory_code, param_type, param_no, transaction) {
  const query = `
    SELECT "Customs".GF_PARAM_VALUE(:factory_code, :param_type, :param_no) as PARAM_VALUE
  `;

  const [result] = await pool.query(query, {
    replacements: { factory_code, param_type, param_no },
    type: pool.QueryTypes.SELECT,
    transaction,
  });

  return result?.PARAM_VALUE || "N";
}

async function GF_MESGNM(message_id, charset, transaction) {
  const query = `
    SELECT "Customs".GF_MESGNM(:message_id, :charset) as MESSAGE_TEXT
  `;
  const [result] = await pool.query(query, {
    replacements: { message_id, charset },
    type: pool.QueryTypes.SELECT,
    transaction,
  });
  console.log("check the result func mes ", result);

  return result?.message_text || `Message ID ${message_id} not found`;
}
function getAlertMessage(message_id, charset) {
  const messages = {
    540080: {
      EN: "Duplicate contract found with same vendor and date range!",
      VI: "Phát hiện hợp đồng trùng lặp với cùng nhà cung cấp và thời gian!",
      CN: "发现重复合同！",
    },
  };

  return messages[message_id]?.[charset] || `Message ${message_id} not found`;
}

// ==================== HÀM CHÍNH ====================

async function extendContract(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  language = "EN",
) {
  const transaction = await pool.transaction();

  try {
    const charset = {
      en: "E",
      zh: "T",
      vi: "S",
    };
    const p_charset = charset[language] || "E";

    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      vend_no: filters.vend_no,
      d_type: filters.d_type,
      issued_date: filters.issued_date,
      expire_date: filters.expire_date,
      cont_no: filters.cont_no,
      cont_category: filters.cont_category,
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

    let X = 1;
    let N = 0;
    let alertMessage = null;
    let confirmMessage = null;

    if (filters.cont_category === "2") {
      // Kiểm tra trùng lặp cấp 1
      const checkExactQuery = `
        SELECT COUNT(FACTORY_CODE) as N
        FROM "Customs".VW_CONT_EXP
        WHERE ${permissionCondition} 
          AND FACTORY_CODE = :factory_code
          AND VEND_NO = :vend_no
          AND D_TYPE = :d_type
          AND ISSUED_DATE = :issued_date
          AND EXPIRE_DATE = :expire_date
          AND CONT_NO <> COALESCE(:cont_no, '??')
          AND CONT_CATEGORY = '2'
          AND STATUS > 1
      `;

      const [exactResult] = await pool.query(checkExactQuery, {
        replacements,
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      N = exactResult.N;

      if (N > 0) {
        alertMessage = await getAlertMessage(540080, p_charset, transaction);
        const paramValue = await GF_PARAM_VALUE(
          factory_code,
          "AC",
          21,
          transaction,
        );

        if (paramValue === "Y") {
          X = 0;
        }
      } else {
        // Kiểm tra trùng lặp cấp 2
        const checkOverlapQuery = `
          SELECT COUNT(FACTORY_CODE) as N
          FROM "Customs".VW_CONT_EXP
          WHERE ${permissionCondition} 
            AND FACTORY_CODE = :factory_code
            AND VEND_NO = :vend_no
            AND D_TYPE = :d_type
            AND (
              (:issued_date BETWEEN ISSUED_DATE AND EXPIRE_DATE)
              OR (:expire_date BETWEEN ISSUED_DATE AND EXPIRE_DATE)
            )
            AND CONT_NO <> COALESCE(:cont_no, '??')
            AND CONT_CATEGORY = '2'
            AND STATUS > 1
        `;

        const [overlapResult] = await pool.query(checkOverlapQuery, {
          replacements,
          type: pool.QueryTypes.SELECT,
          transaction,
        });

        N = overlapResult.N;

        if (N > 0) {
          alertMessage = await getAlertMessage(540080, p_charset, transaction);
          const paramValue = await GF_PARAM_VALUE(
            factory_code,
            "AC",
            21,
            transaction,
          );

          if (paramValue === "Y") {
            X = 0;
          }
        }
      }
    }

    // Xử lý X
    if (X === 1) {
      confirmMessage = await GF_MESGNM(230741, p_charset, transaction);
      await transaction.rollback();

      // ✅ Chỉ trả data, KHÔNG format response
      return {
        requireConfirmation: true,
        alertMessage: alertMessage,
        confirmMessage: confirmMessage,
        cont_no: filters.cont_no,
        duplicateFound: N > 0,
      };
    } else {
      await transaction.rollback();

      // ✅ Throw error để controller bắt
      throw new Error(
        alertMessage || "Duplicate contract blocked by AC-21 parameter",
      );
    }
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}

// ==================== API CONFIRM EXTEND ====================

async function verifyRemainder(factory_code, ac_no, ac_itemno, language) {
  try {
    // 1. Lấy QTY, OVER_QTY, SRC từ VW_AC_CHGSUM (MASTER)
    const masterSql = `
      SELECT
        COALESCE(qty, 0)      AS n_mqty,
        COALESCE(over_qty, 0) AS n_over_qty,
        src
      FROM "Customs".vw_ac_chgsum
      WHERE org_id = :factory_code
        AND ac_no       = :ac_no
        AND ac_itemno   = :ac_itemno
    `;
    const masterResult = await pool.query(masterSql, {
      replacements: { factory_code, ac_no, ac_itemno },
      type: pool.QueryTypes.SELECT,
    });

    let n_mqty = 0;
    let n_over_qty = 0;
    let n_src = 0;

    if (masterResult.length > 0) {
      n_mqty = Number(masterResult[0].n_mqty) || 0;
      n_over_qty = Number(masterResult[0].n_over_qty) || 0;
      n_src = Number(masterResult[0].src) || 0;
    }

    // 2. Tính SUM(QTY) từ AC_CHK_T (DETAIL) với STATUS = 9
    const detailSql = `
      SELECT COALESCE(SUM(qty), 0) AS n_sum_dqty
      FROM "Customs".ac_chk_t
      WHERE factory_code = :factory_code
        AND in_acno      = :ac_no
        AND matd_no      = :ac_itemno
        AND status       = 9
    `;
    const detailResult = await pool.query(detailSql, {
      replacements: { factory_code, ac_no, ac_itemno },
      type: pool.QueryTypes.SELECT,
    });

    const n_sum_dqty = Number(detailResult[0]?.n_sum_dqty) || 0;

    // 3. So sánh: N_MQTY - N_SumDQTY = N_OverQTY ?
    const isBalanced = n_mqty - n_sum_dqty === n_over_qty;

    if (isBalanced) {
      const message = await gf_mesgnm(531001, language);
      return {
        success: true,
        balanced: true,
        message,
        n_mqty,
        n_sum_dqty,
        n_over_qty,
      };
    } else {
      const message = await gf_mesgnm(531002, language);
      return {
        success: true,
        balanced: false,
        message,
        n_mqty,
        n_sum_dqty,
        n_over_qty,
        updatePayload: { factory_code, ac_no, ac_itemno, n_mqty, n_src },
      };
    }
  } catch (error) {
    console.error("Error in verifyRemainder:", error);
    throw error;
  }
}
/**
 * Cập nhật OVER_QTY (gọi sau khi người dùng xác nhận từ verifyRemainder)
 * Tương đương GF_UPDATE_OVERQTY trong Oracle Forms
 */
async function updateOverQty(factory_code, ac_no, ac_itemno, n_mqty, n_src) {
  try {
    const result = await pool.query(
      `SELECT "Customs".gf_update_overqty(:factory_code, :ac_no, :ac_itemno, :n_mqty, :n_src) AS result`,
      {
        replacements: { factory_code, ac_no, ac_itemno, n_mqty, n_src },
        type: pool.QueryTypes.SELECT,
      },
    );

    return { success: true, result: result[0]?.result };
  } catch (error) {
    console.error("Error in updateOverQty:", error);
    throw error;
  }
}
async function restoreStatus(factory_code, ac_no, src) {
  const transaction = await pool.transaction();

  try {
    if (src === "1") {
      await pool.query(
        `
        UPDATE "Customs".ac_chg_m
        SET status        = 9,
            complete_type = '1'
        WHERE factory_code = :factory_code
          AND ac_no IN (
            SELECT ac_no
            FROM "Customs".ac_chg_d
            WHERE factory_code = :factory_code
              AND ac_no        = :ac_no
              AND over_qty    <= 0
          )
        `,
        {
          replacements: { factory_code, ac_no },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      // --- AC_CHG_M: OVER_QTY > 0 → STATUS = 7 ---
      await pool.query(
        `
        UPDATE "Customs".ac_chg_m
        SET status        = 7,
            complete_type = NULL
        WHERE factory_code = :factory_code
          AND ac_no IN (
            SELECT ac_no
            FROM "Customs".ac_chg_d
            WHERE factory_code = :factory_code
              AND ac_no        = :ac_no
              AND over_qty    > 0
          )
        `,
        {
          replacements: { factory_code, ac_no },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );
    } else if (src === "9") {
      // --- AC_PROC_M: OVER_QTY <= 0 → STATUS = 9 ---
      await pool.query(
        `
        UPDATE "Customs".ac_proc_m
        SET status        = 9,
            complete_type = '1'
        WHERE factory_code = :factory_code
          AND ac_no IN (
            SELECT ac_no
            FROM "Customs".ac_proc_d
            WHERE factory_code = :factory_code
              AND ac_no        = :ac_no
              AND over_qty    <= 0
          )
        `,
        {
          replacements: { factory_code, ac_no },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      // --- AC_PROC_M: OVER_QTY > 0 → STATUS = 7 ---
      await pool.query(
        `
        UPDATE "Customs".ac_proc_m
        SET status        = 7,
            complete_type = NULL
        WHERE factory_code = :factory_code
          AND ac_no IN (
            SELECT ac_no
            FROM "Customs".ac_proc_d
            WHERE factory_code = :factory_code
              AND ac_no        = :ac_no
              AND over_qty    > 0
          )
        `,
        {
          replacements: { factory_code, ac_no },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );
    } else {
      throw new Error(`SRC không hợp lệ: ${src}. Chỉ chấp nhận '1' hoặc '9'.`);
    }

    await transaction.commit();

    return { success: true, message: "Khôi phục trạng thái thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in restoreStatus:", error);
    throw error;
  }
}
async function confirmExtendContract(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) {
  const transaction = await pool.transaction();

  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      last_user: user_code,
      cont_no: cont_no,
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
    const updateQuery = `
      UPDATE "Customs".AC_CONT_M
      SET STATUS = 7,
          LAST_USER = :last_user,
          LAST_DATE = NOW()
      WHERE
       ${permissionCondition} AND
       FACTORY_CODE = :factory_code
        AND CONT_NO = :cont_no
    `;
    await pool.query(updateQuery, {
      replacements,
      transaction,
      type: pool.QueryTypes.UPDATE,
    });

    await transaction.commit();

    return {
      cont_no,
      new_status: 7,
      last_user: user_code,
    };
  } catch (error) {
    await transaction.rollback();
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
    let replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
      // filter fields
      ac_chgno: filters.ac_chgno || null,
      ac_itemno: filters.ac_itemno || null,
      s_outdate: filters.s_date_1 || null,
      e_outdate: filters.e_date_2 || null,
      cont_no: filters.cont_no || null,
      status: filters.status ?? null,
      src: filters.src || null,
      stoc_type: filters.stoc_type || null,
      s_fact: filters.s_date_1 || null,
      e_fact: filters.e_date_2 || null,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "S.org_id = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "S.grt_dept = :permission_dept AND S.org_id = :factory_code";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "S.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
      S.src,
      s.org_id,
        S.ac_no,
        S.ac_chgno,
        S.ac_date,
        S.cont_no,
        S.ac_itemno,
        "Customs".GF_AC_ITEMNAME(s.org_id, S.ac_itemno, :p_charset) AS ac_itemname,
        S.qty,
        S.over_qty,
        CASE S.d_type
          WHEN '1' THEN '1-Local VAT'
          WHEN '2' THEN '2-Direct Import'
          WHEN '3' THEN '3-Import VN'
          WHEN '4' THEN '4-Direct Imp A12'
          WHEN '5' THEN '5-無(None)'
          WHEN '6' THEN '6-其它Other'
        END AS d_type,
        CASE S.stoc_type
          WHEN '1' THEN '1-非保稅'
          WHEN '2' THEN '2-保稅'
          WHEN '3' THEN '3-None'
          WHEN '4' THEN '4-VAT'
        END AS stoc_type,
        S.com_invoice,
        "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort) AS fact_date,
          S.status
      FROM "Customs".vw_ac_chgsum S
      WHERE ${permissionCondition} 
        AND (:ac_chgno  IS NULL OR S.ac_chgno ILIKE :ac_chgno || '%')
        AND (:ac_itemno IS NULL OR S.ac_itemno = :ac_itemno)
        AND (:cont_no   IS NULL OR S.cont_no = :cont_no)
        AND (:src       IS NULL OR S.src = :src)
        AND (:stoc_type IS NULL OR S.stoc_type = :stoc_type)
        AND (:s_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) >= DATE_TRUNC('day', :s_outdate::timestamp))
        AND (:e_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) <= DATE_TRUNC('day', :e_outdate::timestamp))
        AND (
          :status IS NULL
          OR (:status = 1 AND (COALESCE(S.over_qty, 0) <= 0 OR S.status = 9))
          OR (:status = 2 AND COALESCE(S.over_qty, 0) > 0 AND S.status <> 9)
        )
        AND (
          :s_fact IS NULL OR
          DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
          >= DATE_TRUNC('day', :s_fact::timestamp)
        )
        AND (
          :e_fact IS NULL OR
          DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
          <= DATE_TRUNC('day', :e_fact::timestamp)
        )
      ORDER BY S.ac_date ASC
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
            FROM "Customs".vw_ac_chgsum S
      WHERE ${permissionCondition} 
        AND (:ac_chgno  IS NULL OR S.ac_chgno ILIKE :ac_chgno || '%')
        AND (:ac_itemno IS NULL OR S.ac_itemno = :ac_itemno)
        AND (:cont_no   IS NULL OR S.cont_no = :cont_no)
        AND (:src       IS NULL OR S.src = :src)
        AND (:stoc_type IS NULL OR S.stoc_type = :stoc_type)
        AND (:s_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) >= DATE_TRUNC('day', :s_outdate::timestamp))
        AND (:e_outdate IS NULL OR DATE_TRUNC('day', S.ac_date) <= DATE_TRUNC('day', :e_outdate::timestamp))
        AND (
          :status IS NULL
          OR (:status = 1 AND (COALESCE(S.over_qty, 0) <= 0 OR S.status = 9))
          OR (:status = 2 AND COALESCE(S.over_qty, 0) > 0 AND S.status <> 9)
        )
        AND (
          :s_fact IS NULL OR
          DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
          >= DATE_TRUNC('day', :s_fact::timestamp)
        )
        AND (
          :e_fact IS NULL OR
          DATE_TRUNC('day', "Customs".GF_INVOICE_FACTDATE(s.org_id, S.ac_no, S.src, S.com_invoice, S.sort))
          <= DATE_TRUNC('day', :e_fact::timestamp)
        )
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
    console.error("Error in searchVwAcChgsum:", error);
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
module.exports = {
  getContno,
  fetchFieldDataDropdown,
  fetchInAcnoDataDropdown,
  fetchInContDataDropdown,
  extendContract,
  copyContract,
  confirmExtendContract,
  getContractSetting,
  search,
  listAllVwAcChgsum,
  listOutVwAcChgsum,
  verifyRemainder,
  updateOverQty,
  restoreStatus,
};
