const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function getListOfContImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters = {},
) {
  try {
    console.log(
      "list all",
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const charset = {
      vi: "S",
      zh: "T",
      en: "E",
    };
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
      p_charset: charset[language] || "E",
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
        (:cont_no IS NULL OR cont_no ILIKE :cont_no || '%') AND
        (status = :status OR :status IS NULL) AND
        (DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::timestamp) OR :s_issuedate IS NULL) AND
        (DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::timestamp) OR :e_issuedate IS NULL) AND
        (DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::timestamp) OR :s_expiredate IS NULL) AND
        (DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::timestamp) OR :e_expiredate IS NULL) AND
        (cont_category = :cont_category OR :cont_category IS NULL)
      ORDER BY cont_no ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return { rows };
  } catch (error) {
    console.error("Error fetching Contract Import list:", error);
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
    d.cont_qty,
     u.ac_chgno,
     u.qty
  FROM "Customs".vw_cont_imp m
  INNER JOIN "Customs".ac_cont_d d 
    ON m.factory_code = d.factory_code 
    AND m.cont_no = d.cont_no
   LEFT JOIN "Customs".vw_cont_use u 
     ON d.factory_code = u.factory_code 
    AND d.cont_no = u.cont_no 
     AND d.goods_code = u.ac_itemno
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
      limit: parseInt(limit) + 1 || 6,
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
        CASE m.CONT_CATEGORY 
          WHEN '1' THEN '1-Small contract' 
          WHEN '2' THEN '2-Main contract' 
        END AS cont_category_name,
        m.ISSUED_DATE,
        m.EXPIRE_DATE,
        m.D_TYPE,
        m.BIG_CONTNO,
        m.LAST_EDATE,
        m.BVEND_NO,
        m.port_dis,
        
        -- Thông tin Buyer từ FACTORY (đã comment)
        (
          SELECT 
              CASE :p_charset 
                  WHEN 'L' THEN factory_name_l 
                  WHEN 'E' THEN factory_name_e
                  ELSE factory_name_e 
              END
          FROM "Customs".FACTORY 
          WHERE FACTORY_CODE = m.FACTORY_CODE
      ) AS BUYER_NAME,
        
         (SELECT 
          factory_address
          FROM "Customs".FACTORY 
          WHERE FACTORY_CODE = m.FACTORY_CODE) AS B_ADDR,
        
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
        FROM "po".po_vender_m             
        WHERE FACTORY_CODE = m.FACTORY_CODE             
        AND VEND_NO = m.VEND_NO) AS S_ADDR,
        
        -- Thông tin tiền tệ và thanh toán từ PO_VENDER_M
        
        TERM_PAY,
        
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
        m.CURRENCY,
        
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
        m.locked_information,
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
      ${permissionCondition}
      ORDER BY m.CONT_NO
      limit :limit 
      offset :offset
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
  limit,
  page,
  search
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    limit: parseInt(limit) + 1,
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
  try {
      let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        cont_no ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
    const sql = `
      SELECT cont_no 
      FROM "Customs".VW_CONT_IMP 
        WHERE 
        ${permissionCondition} 
        ${searchCondition}
        AND status=7 
        AND cont_category='2'
      LIMIT :limit OFFSET :offset
    `;
    const countSql = `
        SELECT COUNT(CONT_NO) as total
         FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        ${searchCondition}
        AND status = 7
      AND cont_category='2'
      `;
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
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function fetchGroupFieldDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
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
        cont_no ILIKE :search OR
        issued_date ILIKE :search OR
        expire_date ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  let sql;
  let countSql;
  sql = `
       SELECT CONT_NO,ISSUED_DATE,EXPIRE_DATE 
        FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND status = 7
        ${searchCondition}
        order by cont_no
        limit :limit
        offset :offset
      `;
  countSql = `
        SELECT COUNT(CONT_NO) as total
         FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND status = 7
        ${searchCondition}
      `;

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
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cont_no: cont_no,
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
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  let sql;
  let countSql;
  if (field) {
    sql = `
       SELECT ${field} 
        FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND cont_no= :cont_no
        ${searchCondition}
        ${statusCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".vw_cont_imp
        WHERE 
        ${permissionCondition} 
        AND cont_no=:cont_no
        ${searchCondition}
         ${statusCondition}
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
async function fetchMinContDataDropdown(
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
  if (field) {
    sql = `
       SELECT ${field} 
        FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND big_contno=:cont_no
        AND cont_category = '1' 
        AND status = 7
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".vw_cont_imp
       WHERE 
        ${permissionCondition} 
        AND big_contno=:cont_no
        AND cont_category = '1' 
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
async function fetchInContDataDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  page,
  limit,
  search = {},
  mark = "A",
  vend_no,
  d_type,
  isStatus = true,
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
  if (search && search !== undefined && search.trim() !== "") {
    searchCondition = `
      AND (
        ${field} ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  let sql;
  let countSql;
  if (field && mark === "A") {
    sql = `
       SELECT ${field} 
        FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        ${statusCondition}
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".vw_cont_imp
       WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
         ${statusCondition}
        ${searchCondition}
      `;
  } else if (mark === "B") {
    sql = `
       SELECT ${field} 
        FROM "Customs".vw_cont_imp 
        WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND vend_no = :vend_no
        AND d_type = :d_type
         ${statusCondition}
        ${searchCondition}
        order by factory_code,cont_no
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
        FROM "Customs".vw_cont_imp
       WHERE 
        ${permissionCondition} 
        AND cont_category = '2' 
        AND vend_no = :vend_no
        AND d_type = :d_type
         ${statusCondition}
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
// vw_cont_imp.repository.js
async function copyContract(
  factory_code,
  department_code,
  user_code,
  query_level,
  old_cont_no,
  new_cont_no,
  limit,
) {
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
      permission_factory: factory_code,
      permission_dept: department_code,
      permission_user: user_code,
    };

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
    const positionQuery = `
      SELECT COUNT(*) as position
      FROM "Customs".VW_CONT_IMP m
      WHERE ${permissionCondition}
        AND m.FACTORY_CODE = :factory_code
        AND m.CONT_NO < :new_cont_no
    `;

    const [positionResult] = await pool.query(positionQuery, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const position = parseInt(positionResult.position) || 0;
    const size = parseInt(limit) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return {
      success: true,
      message: "Contract copied successfully",
      new_cont_no,
      position,
      size,
      page,
      offset,
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
async function updateLastExpireDate(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
  last_edate,
) {
  const transaction = await pool.transaction();

  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code,
      cont_no,
      last_edate,
      last_user: user_code,
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
      SET 
        LAST_EDATE = :last_edate,
        LAST_USER  = :last_user,
        LAST_DATE  = NOW()
      WHERE
        ${permissionCondition}
        AND FACTORY_CODE = :factory_code
        AND CONT_NO      = :cont_no
    `;

    await pool.query(updateQuery, {
      replacements,
      transaction,
      type: pool.QueryTypes.UPDATE,
    });

    await transaction.commit();

    return {
      success: true,
      cont_no,
      last_edate,
      last_user: user_code,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating last expire date:", error);
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
  limit,
  offset,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      cont_no: filters.cont_no || null,
      status: filters.status ?? null,
      s_date_1: filters.s_date_1 || null,
      e_date_1: filters.e_date_1 || null,
      s_date_2: filters.s_date_2 || null,
      e_date_2: filters.e_date_2 || null,
      cont_category: filters.cont_category || null,
      seller: filters.seller || null,
      buyer: filters.buyer || null,
      p_charset: filters.p_charset || "UTF8",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    console.log("statuadadads", filters.status);

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
        m.factory_code,
        m.CONT_TYPE,
        m.CONT_NO,
        m.CONT_CATEGORY,
         CASE m.CONT_CATEGORY 
          WHEN '1' THEN '1-Small contract' 
          WHEN '2' THEN '2-Main contract' 
        END AS cont_category_name,
        m.ISSUED_DATE,
        m.EXPIRE_DATE,
        m.D_TYPE,
        m.BIG_CONTNO,
        m.LAST_EDATE,
        m.BVEND_NO,
        m.port_dis,
        
        -- Thông tin Buyer từ SYORG (đã comment)
       (
          SELECT 
              CASE :p_charset 
                  WHEN 'L' THEN factory_name_l 
                  WHEN 'E' THEN factory_name_e
                  ELSE factory_name_e 
              END
          FROM "Customs".FACTORY 
          WHERE FACTORY_CODE = m.FACTORY_CODE
      ) AS BUYER_NAME,
        
         (SELECT 
          factory_address
          FROM "Customs".FACTORY 
          WHERE FACTORY_CODE = m.FACTORY_CODE) AS B_ADDR,
        
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
        FROM "po".po_vender_m             
        WHERE FACTORY_CODE = m.FACTORY_CODE             
        AND VEND_NO = m.VEND_NO) AS S_ADDR,
        
        -- Thông tin tiền tệ và thanh toán từ PO_VENDER_M
        
       TERM_PAY,
        
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
        m.CURRENCY,
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
        "Customs".GF_EMPNM(m.LAST_USER, :p_charset) AS LAST_USERNM,
        m.LAST_DATE,
        m.GRT_DEPT,
        "Customs".GF_DEPTNM(m.FACTORY_CODE, m.GRT_DEPT, :p_charset) AS GRT_DEPTNM,
        m.GRT_USER,
        "Customs".GF_EMPNM(m.GRT_USER, :p_charset) AS GRT_USERNM
      FROM "Customs".VW_CONT_IMP m
      WHERE
        ${permissionCondition} AND
        (:cont_no IS NULL OR cont_no ILIKE '%' || :cont_no || '%') AND
        (:status IS NULL OR status = :status) AND
        (:seller IS NULL OR seller ILIKE '%' || :seller || '%') AND
        (:buyer IS NULL OR buyer ILIKE '%' || :buyer || '%') AND
        (:cont_category IS NULL OR cont_category = :cont_category) AND
        (:s_date_1 IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_date_1::timestamp)) AND
        (:e_date_1 IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_date_1::timestamp)) AND
        (:s_date_2 IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_date_2::timestamp)) AND
        (:e_date_2 IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_date_2::timestamp))
      ORDER BY cont_no ASC
      limit :limit 
      offset :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    let total = null;
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    if (parseInt(offset) === 0) {
      const countQuery = `
      SELECT COUNT(*) FROM "Customs".vw_cont_imp
      WHERE
        ${permissionCondition} AND
        factory_code = :factory_code AND
        (:cont_no IS NULL OR cont_no ILIKE '%' || :cont_no || '%') AND
        (:status IS NULL OR status = :status) AND
        (:seller IS NULL OR seller ILIKE '%' || :seller || '%') AND
        (:buyer IS NULL OR buyer ILIKE '%' || :buyer || '%') AND
        (:cont_category IS NULL OR cont_category = :cont_category) AND
        (:s_date_1 IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_date_1::timestamp)) AND
        (:e_date_1 IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_date_1::timestamp)) AND
        (:s_date_2 IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_date_2::timestamp)) AND
        (:e_date_2 IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_date_2::timestamp))
      limit :limit 
      offset :offset
    `;
      countResult = await pool.query(countQuery, {
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
    console.error("Error searching Contract Import:", error);
    throw error;
  }
}
module.exports = {
  getListOfContImp,
  getContno,
  fetchFieldDataDropdown,
  fetchMinContDataDropdown,
  fetchInContDataDropdown,
  extendContract,
  copyContract,
  updateLastExpireDate,
  confirmExtendContract,
  getContractSetting,
  search,
  getContractDetails,
  fetchGroupFieldDataDropdown,
};
