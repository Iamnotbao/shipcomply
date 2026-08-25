const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function getListOfAcChgExp(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };

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

    const sql = `
     SELECT DISTINCT ON (m.ac_no)
     m.factory_code,
  m.ac_no,
  m.ac_type,
  CASE m.ac_type
    WHEN '1' THEN '1-進口報關'
    WHEN '2' THEN '2-出口報關'
  END AS ac_type_name,
  m.d_type,
  CASE m.d_type
    WHEN '1' THEN '1-外銷'
    WHEN '2' THEN '2-內銷'
  END AS d_type_name,
  m.ac_chgs,
  m.ac_chgn,
  m.ac_chgo,
  m.ac_addr,
  c.issued_date,
  c.expire_date,
  m.old_no,
  m.org_tax,
  m.ac_bom,
  m.org_addr,
  m.cust_tax,
  m.ac_row,
  m.cust_addr,
  m.rec_addr,
  m.sort,
  "Customs".gf_code_name(m.factory_code, 'SORT',   m.sort,     :p_charset) AS sort_name,
  m.agent_make,
  m.chg_type,
  "Customs".gf_code_name(m.factory_code, 'ACTYPE', m.chg_type, :p_charset) AS typenm,
  m.license,
  m.lic_date,
  m.pass_date,
  m.out_port,
  "Customs".gf_code_name(m.factory_code, 'PORT',   m.out_port, :p_charset) AS port_name,
  m.in_country,
  "Customs".gf_code_name(m.factory_code, 'CHGCY',  m.in_country,  :p_charset) AS country_nm,
  m.trade,
  "Customs".gf_pay_name(m.factory_code, m.trade, :p_charset)                AS trade_name,
  m.payment,
  "Customs".gf_code_name(m.factory_code, 'AYRULE', m.payment,  :p_charset) AS pay_name,
  "Customs".gf_code_name(m.factory_code, '1105',   m.curr_no,  :p_charset) AS curr_name,
  m.curr_rate,
  m.gross,
  m.peice,
  m.grt_dept,
  "Customs".gf_deptnm(m.factory_code, m.grt_dept, :p_charset) AS grt_deptname,
  m.grt_user,
  "Customs".gf_empnm(m.grt_user,  :p_charset)                 AS grt_username,
  m.grt_date,
  m.last_user,
  "Customs".gf_empnm(m.last_user, :p_charset)                  AS last_username,
  m.last_date,
  v.ac_chgno,
  v.cont_no ,
  v.out_date ,
  v.min_cont,
  v.curr_no,
  "Customs".gf_code_name(v.factory_code, '1105', v.curr_no, :p_charset) AS currnm,
  v.sum_qty,
  v.sum_money,
  v.tax,
  v.status,
  m.locked_information,
  CASE v.status
    WHEN 1  THEN '1-New新單'
    WHEN 2  THEN '2-Check復核'
    WHEN 7  THEN '7-Confirm確認'
    WHEN 0  THEN '0-Cancel取消'
    WHEN 9  THEN '9-Locked'
    WHEN 99 THEN '99-Shipping'
  END AS status_name,
  p.se_id,
  p.ship_seq
FROM "Customs".ac_chg_m m
LEFT JOIN "Customs".vw_cont_exp c
  ON  c.factory_code = m.factory_code
  AND c.cont_no      = m.cont_no
LEFT JOIN "Customs".vw_chg_exp v
  ON  v.factory_code = m.factory_code
  AND v.ac_no        = m.ac_no
LEFT JOIN "Customs".ac_plan_ord p
  ON  p.factory_code = v.factory_code
  AND p.ac_no        = v.ac_no
WHERE m.ac_type::text = '2'::text 
  AND ${permissionCondition}
  order by m.ac_no,v.out_date DESC
  limit :limit
  offset :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    return { rows: actualRows, hasMore: hasMore };
  } catch (error) {
    console.error("Error fetching AC_CHG_EXP list:", error);
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
    (:cont_no IS NULL OR m.cont_no LIKE :cont_no || '%') AND
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
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0,
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
        m.factory_code,
        m.CONT_TYPE,
        m.CONT_NO,
        m.CONT_CATEGORY,
        m.ISSUED_DATE,
        m.EXPIRE_DATE,
        m.D_TYPE,
        m.BIG_CONTNO,
        m.LAST_EDATE,
        m.BVEND_NO,
        m.port_dis,
        
        -- Thông tin Buyer từ SYORG (đã comment)
        -- (SELECT FULLNM_E 
        --  FROM "Customs".SYORG 
        --  WHERE FACTORY_CODE = m.FACTORY_CODE) AS BUYER,
        
        -- (SELECT ADDRESS_E 
        --  FROM "Customs".SYORG 
        --  WHERE FACTORY_CODE = m.FACTORY_CODE) AS B_ADDR,
        
        m.VEND_NO,
        
        -- Thông tin Seller
        "Customs".GF_VEND_FULLNM(m.FACTORY_CODE, m.VEND_NO, :p_charset) AS SELLER,
        
        -- Thay DECODE bằng CASE WHEN
        (SELECT 
          CASE :p_charset
            WHEN 'S' THEN ADDRESS_S
            WHEN 'T' THEN ADDRESS_T
            WHEN 'E' THEN ADDRESS_E
            ELSE ADDRESS_E
          END
        FROM "Customs".PO_VENDER_M             
        WHERE FACTORY_CODE = m.FACTORY_CODE             
        AND VEND_NO = m.VEND_NO) AS S_ADDR,
        
        -- Thông tin tiền tệ và thanh toán từ PO_VENDER_M
        (SELECT PAY_CUR               
        FROM "Customs".PO_VENDER_M              
        WHERE FACTORY_CODE = m.FACTORY_CODE                
        AND VEND_NO = m.VEND_NO) AS CURRENCY,
        
        (SELECT PAY_NO 
        FROM "Customs".PO_VENDER_M
        WHERE FACTORY_CODE = m.FACTORY_CODE             
        AND VEND_NO = m.VEND_NO) AS TERM_PAY,
        
        -- Tên điều khoản thanh toán
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'PAYMENT_WAY', m.TERM_PAY, :p_charset) AS TERM_PAYNM,
        
        -- Các trường khác
        m.S_PIC,
        m.S_POSITION,
        m.S_ACCNO,
        m.P_SELLER,
        m.BANK,
        m.BANK_IC,
        m.BANK_ADDR,
        
        -- Tên loại tiền tệ
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, '1105', m.CURRENCY, :p_charset) AS CURRENCYNM,
        
        m.PAY_TERM,
        
        -- Tên điều khoản thanh toán
        "Customs".GF_CODE_NAME(m.FACTORY_CODE, 'PAYMENT_WAY', m.PAY_TERM, :p_charset) AS PAY_TERMNM,
        
        m.FREIGHT,
        m.INSURANCE,
        m.GOODS_ORIGIN,
        m.SUM_QTY,
        m.SUM_MONEY,
        m.NOTE,
        m.STATUS,
        m.LAST_USER,
        
        -- Tên user cuối cùng
        "Customs".GF_EMPNM(m.LAST_USER, :p_charset) AS LAST_USERNM,
        
        m.LAST_DATE,
        m.GRT_DEPT,
        
        -- Tên phòng ban
        "Customs".GF_DEPTNM(m.FACTORY_CODE, m.GRT_DEPT, :p_charset) AS GRT_DEPTNM,
        
        m.GRT_USER,
        
        -- Tên user phê duyệt
        "Customs".GF_EMPNM(m.GRT_USER, :p_charset) AS GRT_USERNM

      FROM "Customs".VW_CONT_IMP m
      
      WHERE 
        m.FACTORY_CODE = :factory_code 
      ORDER BY m.CONT_NO
      limit :limit 
      offset :offset
`;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    let total = null;
    if (parseInt(offset) === 0) {
      const countQuery = `
          SELECT COUNT(*) as total 
           FROM "Customs".VW_CONT_IMP m
           WHERE m.FACTORY_CODE = :factory_code 
        `;
      const countResult = await pool.query(countQuery, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.total) || 0;
    }
    return { rows: rows, count: total };
  } catch (error) {
    console.error("Error fetching contract details:", error);
    throw error;
  }
}
// vw_cont_imp.repository.js
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

    const [masterResult] = await pool.query(sqlCopyMaster, {
      replacements,
      transaction,
      type: pool.QueryTypes.INSERT,
    });

    const masterInserted = masterResult.affectedRows || 0;

    if (masterInserted === 0) {
      throw new Error(
        `Failed to copy contract. Source contract '${old_cont_no}' may not exist.`,
      );
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
        FROM "Customs".VW_CONT_IMP
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
          FROM "Customs".VW_CONT_IMP
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
  language,
  filters = {},
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      zh: "T",
      en: "E",
    };

    let permissionCondition = "1=1";

    let replacements = {
      factory_code: factory_code || null,
      s_date_1: filters.s_date_1 || null,
      e_date_1: filters.e_date_1 || null,
      ac_no: filters.ac_no || null,
      status: filters.status ?? null,
      ac_chgno: filters.ac_chgno || null,
      chg_type: filters.chg_type || null,
      cont_no: filters.cont_no || null,
      se_id: filters.se_id || null,
      ship_seq: filters.ship_seq || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
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

    const sql = `
   SELECT DISTINCT ON (m.ac_no)
    m.factory_code,
  m.ac_no,
  m.ac_type,
  CASE m.ac_type
    WHEN '1' THEN '1-進口報關'
    WHEN '2' THEN '2-出口報關'
  END AS ac_type_name,
  m.d_type,
  CASE m.d_type
    WHEN '1' THEN '1-外銷'
    WHEN '2' THEN '2-內銷'
  END AS d_type_name,
  m.ac_chgs,
  m.ac_chgn,
  m.ac_chgo,
  m.ac_addr,
  c.issued_date,
  c.expire_date,
  m.old_no,
  m.org_tax,
  m.ac_bom,
  m.org_addr,
  m.cust_tax,
  m.ac_row,
  m.cust_addr,
  m.rec_addr,
  m.sort,
  "Customs".gf_code_name(m.factory_code, 'SORT',   m.sort,     :p_charset) AS sort_name,
  m.agent_make,
  m.chg_type,
  "Customs".gf_code_name(m.factory_code, 'ACTYPE', m.chg_type, :p_charset) AS typenm,
  m.license,
  m.lic_date,
  m.pass_date,
  m.out_port,
  "Customs".gf_code_name(m.factory_code, 'PORT',   m.out_port, :p_charset) AS port_name,
  m.in_country,
  "Customs".gf_code_name(m.factory_code, 'CHGCY',  m.in_country,  :p_charset) AS country_nm,
  m.trade,
  "Customs".gf_pay_name(m.factory_code, m.trade, :p_charset)                AS trade_name,
  m.payment,
  "Customs".gf_code_name(m.factory_code, 'AYRULE', m.payment,  :p_charset) AS pay_name,
  "Customs".gf_code_name(m.factory_code, '1105',   m.curr_no,  :p_charset) AS curr_name,
  m.curr_rate,
  m.gross,
  m.peice,
  m.grt_dept,
  "Customs".gf_deptnm(m.factory_code, m.grt_dept, :p_charset) AS grt_deptname,
  m.grt_user,
  "Customs".gf_empnm(m.grt_user,  :p_charset)                 AS grt_username,
  m.grt_date,
  m.last_user,
  "Customs".gf_empnm(m.last_user, :p_charset)                  AS last_username,
  m.last_date,
  v.ac_chgno ,
  v.cont_no ,
  v.out_date ,
  v.min_cont ,
  v.curr_no,
  "Customs".gf_code_name(v.factory_code, '1105', v.curr_no, :p_charset) AS currnm,
  v.sum_qty,
  v.sum_money,
  v.tax,
  v.status,
  CASE v.status
    WHEN 1  THEN '1-New新單'
    WHEN 2  THEN '2-Check復核'
    WHEN 7  THEN '7-Confirm確認'
    WHEN 0  THEN '0-Cancel取消'
    WHEN 9  THEN '9-Locked'
    WHEN 99 THEN '99-Shipping'
  END AS status_name,
  p.se_id,
  p.ship_seq,
  m.locked_information
FROM "Customs".ac_chg_m m
LEFT JOIN "Customs".vw_cont_exp c
  ON  c.factory_code = m.factory_code
  AND c.cont_no      = m.cont_no
LEFT JOIN "Customs".vw_chg_exp v
  ON  v.factory_code = m.factory_code
  AND v.ac_no        = m.ac_no
LEFT JOIN "Customs".ac_plan_ord p
  ON  p.factory_code = v.factory_code
  AND p.ac_no        = v.ac_no
WHERE m.ac_type::text = '2'::text
  AND m.factory_code  = :factory_code
  AND ${permissionCondition}
AND (:ac_no     IS NULL OR m.ac_no     ILIKE '%' || :ac_no     || '%')
AND (:ac_chgno  IS NULL OR v.ac_chgno  ILIKE '%' || :ac_chgno  || '%')
AND (:chg_type  IS NULL OR v.chg_type  ILIKE '%' || :chg_type  || '%')
AND (:cont_no   IS NULL OR v.cont_no   ILIKE '%' || :cont_no   || '%')
AND (:status    IS NULL OR v.status     = :status)
AND (:s_date_1  IS NULL OR DATE_TRUNC('day', v.out_date) >= DATE_TRUNC('day', :s_date_1::timestamp))
AND (:e_date_1  IS NULL OR DATE_TRUNC('day', v.out_date) <= DATE_TRUNC('day', :e_date_1::timestamp))
AND (:se_id     IS NULL OR p.se_id     ILIKE '%' || :se_id     || '%')
AND (:ship_seq  IS NULL OR p.ship_seq   = :ship_seq)
ORDER BY  m.ac_no, v.out_date DESC
LIMIT  :limit
OFFSET :offset
    `;
    const countSql = `
      SELECT COUNT(*) as total 
     FROM "Customs".ac_chg_m m
LEFT JOIN "Customs".vw_cont_exp c
  ON  c.factory_code = m.factory_code
  AND c.cont_no      = m.cont_no
LEFT JOIN "Customs".vw_chg_exp v
  ON  v.factory_code = m.factory_code
  AND v.ac_no        = m.ac_no
LEFT JOIN "Customs".ac_plan_ord p
  ON  p.factory_code = v.factory_code
  AND p.ac_no        = v.ac_no
WHERE m.ac_type::text = '2'::text
  AND m.factory_code  = :factory_code
  AND (m.ac_no ILIKE '%' || :ac_no || '%' OR :ac_no IS NULL)
  AND (v.ac_chgno     ILIKE :ac_chgno  || '%' OR :ac_chgno  IS NULL)
  AND (v.chg_type     ILIKE :chg_type  || '%' OR :chg_type  IS NULL)
  AND (v.cont_no      ILIKE :cont_no   || '%' OR :cont_no   IS NULL)
  AND (v.status        = :status               OR :status    IS NULL)
  AND (DATE_TRUNC('day', v.out_date) >= DATE_TRUNC('day', :s_date_1::timestamp) OR :s_date_1 IS NULL)
  AND (DATE_TRUNC('day', v.out_date) <= DATE_TRUNC('day', :e_date_1::timestamp) OR :e_date_1 IS NULL)
  AND (p.se_id        ILIKE :se_id     || '%' OR :se_id     IS NULL)
  AND (p.ship_seq      = :ship_seq             OR :ship_seq   IS NULL)
  AND ${permissionCondition}
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    let total = null;
      const countResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.total) || 0;
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    console.log("kodakodad",total);
    
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error searching AC_CHG_EXP:", error);
    throw error;
  }
}
module.exports = {
  getListOfAcChgExp,
  copyContract,
  extendContract,
  confirmExtendContract,
  getContractSetting,
  search,
  getContractDetails,
};
