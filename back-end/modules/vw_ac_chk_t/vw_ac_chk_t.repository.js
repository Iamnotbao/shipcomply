const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function listAllVwAcChkT(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  ac_itemno,
  language,
  limit,
  offset,
) {
  try {
    let charSet = {
      vi: "S",
      en: "E",
      zh: "T",
    };
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code,
      ac_no: ac_no || null,
      ac_itemno: ac_itemno || null,
      language: charSet[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "t.factory_code = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "t.grt_dept = :permission_dept AND t.factory_code = :factory_code";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "t.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        "Customs".GF_AC_YEARNO(:factory_code, t.conf_seq)                        AS in_acseq,
        "Customs".GF_AC_BOMNO(:factory_code, t.conf_seq)                         AS bom_seq,
        t.out_acno,
        "Customs".GF_CHGID_CHGNO(:factory_code, t.out_acno)                       AS out_chgno,
        (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = :factory_code
            AND ac_no        = t.out_acno
            AND ac_type      = '2'
        )                                                                         AS out_date,
        t.prod_no,
        "Customs".GF_ACPROD_NAME(:factory_code, t.prod_no, :language)          AS ac_itemname,
        t.unit_qty,
        t.loss_per,
        t.pairs,
        t.qty,
        t.over_qty
      FROM "Customs".vw_ac_chk_t t
      WHERE ${permissionCondition}
        AND (t.in_acno = :ac_no OR t.out_acno = :ac_no)
        AND t.matd_no = :ac_itemno
      ORDER BY t.lock_seq, t.over_qty DESC
      limit :limit 
      offset :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    return {
      data: actualRows,
      hasMore,
    };
  } catch (error) {
    console.error("Error in getAcChkT:", error);
    throw error;
  }
}
async function listAllVwAcChkTWithDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  ac_itemno,
  language,
) {
  try {
    let charSet = {
      vi: "S",
      en: "E",
      zh: "T",
    };
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code,
      ac_no: ac_no || null,
      ac_itemno: ac_itemno || null,
      language: charSet[language] || "E",
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "t.factory_code = :factory_code";
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "t.grt_dept = :permission_dept AND t.factory_code = :factory_code";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "t.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        "Customs".GF_AC_YEARNO(:factory_code, t.conf_seq)                        AS in_acseq,
        "Customs".GF_AC_BOMNO(:factory_code, t.conf_seq)                         AS bom_seq,
        t.out_acno,
        "Customs".GF_CHGID_CHGNO(:factory_code, t.out_acno)                       AS out_chgno,
        (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = :factory_code
            AND ac_no        = t.out_acno
            AND ac_type      = '2'
        )                                                                         AS out_date,
        t.prod_no,
        "Customs".GF_ACPROD_NAME(:factory_code, t.prod_no, :language)          AS ac_itemname,
        t.unit_qty,
        t.loss_per,
        t.pairs,
        t.qty,
        t.over_qty
      FROM "Customs".vw_ac_chk_t t
      inner join "Customs".vw_ac_chgsum v
      on (t.in_acno = :ac_no OR t.out_acno = v.ac_no) AND t.matd_no = v.ac_itemno
      WHERE ${permissionCondition} 
      ORDER BY t.lock_seq, t.over_qty DESC
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    return rows;
  } catch (error) {
    console.error("Error in getAcChkT:", error);
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
    out_dtype1: out_dtype || null,
    out_dtype2: out_dtype || null,
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
    WHERE org_id = :factory_code 
    AND SRC = :src 
    AND AC_ITEMNO = :matd_no 
    AND COALESCE(OVER_QTY, 0) > 0 
    AND STATUS = 7 
    AND (
      (:out_dtype1 = '1' AND D_TYPE IN ('2','3','1')) 
      OR 
      (:out_dtype2 = '2' AND D_TYPE IN ('4','1'))
    )
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
  limit,
  offset,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      cont_no: filters.cont_no || null,
      status: filters.status ?? null,
      s_issuedate: filters.s_issuedate || null,
      e_issuedate: filters.e_issuedate || null,
      s_expiredate: filters.s_expiredate || null,
      e_expiredate: filters.e_expiredate || null,
      cont_category: filters.cont_category || null,
      p_charset: filters.p_charset || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // Permission logic
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
      m.factory_code, 
        m.CONT_NO,
        m.cont_type,
        m.cont_category,
        CASE m.CONT_CATEGORY 
          WHEN '1' THEN '1-小合同' 
          WHEN '2' THEN '2-大合同' 
        END AS CONT_CATEGORY_NAME,
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
        AND FACTORY_CODE = :factory_code
        AND (:cont_no IS NULL OR CONT_NO LIKE :cont_no LIKE '%' || :cont_no || '%')
        AND (:status IS NULL OR STATUS = :status)
        AND (:s_issuedate IS NULL OR DATE_TRUNC('day', ISSUED_DATE) >= DATE_TRUNC('day', :s_issuedate::timestamp))
        AND (:e_issuedate IS NULL OR DATE_TRUNC('day', ISSUED_DATE) <= DATE_TRUNC('day', :e_issuedate::timestamp))
        AND (:s_expiredate IS NULL OR DATE_TRUNC('day', EXPIRE_DATE) >= DATE_TRUNC('day', :s_expiredate::timestamp))
        AND (:e_expiredate IS NULL OR DATE_TRUNC('day', EXPIRE_DATE) <= DATE_TRUNC('day', :e_expiredate::timestamp))
        AND (:cont_category IS NULL OR CONT_CATEGORY = :cont_category)
      ORDER BY CONT_NO
      LIMIT :limit 
      OFFSET :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    let total = null;
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    // Chỉ tính count khi offset = 0
    if (parseInt(offset) === 0) {
      const countQuery = `
        SELECT COUNT(*) as count
        FROM "Customs".VW_CONT_EXP
        WHERE
          ${permissionCondition}
          AND FACTORY_CODE = :factory_code
          AND (:cont_no IS NULL OR CONT_NO LIKE :cont_no || '%')
          AND (:status IS NULL OR STATUS = :status)
          AND (:s_issuedate IS NULL OR DATE_TRUNC('day', ISSUED_DATE) >= DATE_TRUNC('day', :s_issuedate::timestamp))
          AND (:e_issuedate IS NULL OR DATE_TRUNC('day', ISSUED_DATE) <= DATE_TRUNC('day', :e_issuedate::timestamp))
          AND (:s_expiredate IS NULL OR DATE_TRUNC('day', EXPIRE_DATE) >= DATE_TRUNC('day', :s_expiredate::timestamp))
          AND (:e_expiredate IS NULL OR DATE_TRUNC('day', EXPIRE_DATE) <= DATE_TRUNC('day', :e_expiredate::timestamp))
          AND (:cont_category IS NULL OR CONT_CATEGORY = :cont_category)
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
    console.error("Error searching Contract:", error);
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
  listAllVwAcChkT,
  listAllVwAcChkTWithDetails,
  search,
};
