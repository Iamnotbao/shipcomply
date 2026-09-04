const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_CHG_M = require("./ac_chg_m.model.js");

async function listAllAcInmM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  language = "en",
) {
  const charset = {
    vi: "L",
    en: "E",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code || null,
    limit: parseInt(limit) + 1 || 10,
    offset: parseInt(offset) || 0,
    charset: charset[language] || "E",
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "t.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "t.grt_dept = :permission_dept AND t.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "t.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  const sql = `
   SELECT
  t.*,
  CONCAT(
    t.stoc_type,
    ' - ',
    COALESCE(
      CASE 'E'
        WHEN 'E' THEN bd.name_e
        WHEN 'T' THEN bd.name_t
        WHEN 'L' THEN bd.name_l
        ELSE bd.name_e
      END,
      ''
    )
  ) AS stoc_type_name
FROM "Customs".ac_chg_m t
LEFT JOIN "Customs".basic_data bd
  ON bd.factory_code = t.factory_code
  AND bd.category_code = 'STOC_TYPE'
  AND bd.code_no = t.stoc_type
WHERE ${permissionCondition}
ORDER BY t.factory_code ASC, t.invoice_no ASC, t.sort ASC
LIMIT :limit OFFSET :offset
    `;
  const rows = await pool.query(sql, {
    replacements,
    type: pool.QueryTypes.SELECT,
  });
  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;

  let total = null;

  if (parseInt(offset) === 0) {
    try {
      total = await AC_CHG_M.count({
        where: whereClause,
      });
      console.log("total", total);
    } catch (countError) {
      try {
        const sequelizeCount = await AC_CHG_M.count({
          where: whereClause,
        });
        total = parseInt(sequelizeCount) || 0;
      } catch (fallbackError) {
        total = 0;
      }
    }
  }
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
  type = "1",
) {
  const replacements = {
    user_code,
    ac_no,
    factory_code,
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

  try {
    const transaction = await pool.transaction();

    // Update ac_chg_d
    await pool.query(
      `UPDATE "Customs".ac_chg_d 
       SET status = 7, last_user = :user_code, last_date = NOW()
       WHERE ac_no = :ac_no AND status = 1 AND ${permissionCondition}`,
      { replacements, type: pool.QueryTypes.UPDATE, transaction },
    );

    // Update ac_chg_a hoặc ac_desc_chg tùy type
    const table2 =
      type === "1" ? '"Customs".ac_chg_a' : '"Customs".ac_desc_chg';
    await pool.query(
      `UPDATE ${table2}
       SET status = 7, last_user = :user_code, last_date = NOW()
       WHERE ac_no = :ac_no AND status = 1 AND ${permissionCondition}`,
      { replacements, type: pool.QueryTypes.UPDATE, transaction },
    );

    await transaction.commit();
    return { success: true, message: "Confirmed successfully" };
  } catch (error) {
    await transaction.rollback();
    console.log("Error when confirm", error);
    throw error;
  }
}
function checkPermission(permission, tableAlias = "m") {
  const conditions = [];
  const replacements = {};

  if (permission.factory_code) {
    conditions.push(`${tableAlias}.factory_code = :permission_factory_code`);
    replacements.permission_factory_code = permission.factory_code;
  }

  if (permission.grt_dept) {
    conditions.push(`${tableAlias}.grt_dept = :permission_dept`);
    replacements.permission_dept = permission.grt_dept;
  }

  if (permission.grt_user) {
    conditions.push(`${tableAlias}.grt_user = :permission_user`);
    replacements.permission_user = permission.grt_user;
  }

  return {
    whereClause: conditions.length > 0 ? "AND " + conditions.join(" AND ") : "",
    replacements: replacements,
  };
}
async function listAllAcChgMWithDetails(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters = {},
) {
  if (user_code === "admin") {
    return await AC_CHG_M.findAll({
      order: [["ac_no", "ASC"]],
    });
  }
  const charset = {
    vi: "S",
    zh: "T",
    en: "E",
  };
  let replacements = {
    factory_code: factory_code || null,
    s_date_1: filters.s_date_1 || null,
    e_date_1: filters.e_date_1 || null,
    com_invoice: filters.com_invoice || null,
    status: filters.status || null,
    ac_chgno: filters.ac_chgno || null,
    vend_no: filters.vend_no || null,
    cont_no: filters.cont_no || null,
    p_charset: charset[language] || "E",
  };
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

  const transaction = await pool.transaction();
  try {
    const sql = `
      SELECT  
        D.AC_NO,
        M.AC_CHGNO,
        "Customs".GF_AC_ITEMNAME(:factory_code, D.AC_ITEMNO, :p_charset) AS AC_ITEMNM,
        D.AC_ITEM,
        "Customs".GF_CODE_NAME(:factory_code, 'CHGCY', D.COUNTRY, :p_charset) AS COUNTRY,
        "Customs".GF_CODE_NAME(:factory_code, '1108', D.UNIT, :p_charset) AS UNITNM,
        ' ' AS SKY,
        D.TAX_RATE AS TAXRATE,
        D.AC_ITEMNO,
        0 AS ZERO,
        MIN(D.SEQ) AS SEQ,
        MIN(M.OUT_DATE) AS OUT_DATE,
        MIN(M.TRANS_DATE) AS ETD,
        MIN(M.AC_CHGS || M.AC_CHGNO || M.AC_CHGN || CASE WHEN M.AC_CHGO IS NULL THEN '' ELSE '/' || M.AC_CHGO END) AS C_SheetNo,
        MIN(M.CURR_RATE) AS CURR_RATE,
        MIN(M.SUM_MONEY) AS SUM_MONEY,
        MIN(M.COM_INVOICE) AS COM_INVOICE,
        MIN(M.COM_DATE) AS COM_DATE,
        MIN(M.ARR_DATE) AS ARR_DATE
      FROM "Customs".AC_CHG_D D 
      INNER JOIN "Customs".AC_CHG_M M 
        ON M.FACTORY_CODE = D.FACTORY_CODE
        AND M.AC_NO = D.AC_NO
      WHERE M.AC_TYPE::NUMERIC = 1
        AND M.STATUS = 7
        AND M.FACTORY_CODE = :factory_code
        AND (:ac_chgno IS NULL OR M.AC_CHGNO ILIKE '%' || :ac_chgno || '%')
        AND (:cont_no IS NULL OR M.CONT_NO ILIKE '%' || :cont_no || '%')
        AND (:s_date_1 IS NULL OR DATE_TRUNC('day', M.OUT_DATE) >= DATE_TRUNC('day', :s_date_1::timestamp))
        AND (:e_date_1 IS NULL OR DATE_TRUNC('day', M.OUT_DATE) <= DATE_TRUNC('day', :e_date_1::timestamp))
        AND (:status IS NULL OR M.STATUS = :status)
        AND (:com_invoice IS NULL OR M.COM_INVOICE ILIKE '%' || :com_invoice || '%')
        AND (:vend_no IS NULL OR EXISTS (
          SELECT 1 
          FROM "Customs".VW_CONT_IMP VCI
          WHERE VCI.FACTORY_CODE = M.FACTORY_CODE
            AND VCI.CONT_NO = M.CONT_NO
            AND VCI.VEND_NO ILIKE '%' || :vend_no || '%'
        ))
        AND ${permissionCondition}
      GROUP BY D.AC_NO, M.AC_CHGNO, D.AC_ITEM, D.COUNTRY, D.UNIT, D.TAX_RATE, D.AC_ITEMNO
      ORDER BY MIN(D.SEQ)
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    console.log("tao chiu roi day", rows);
    return rows;
  } catch (error) {
    console.log("tao chiu roi day", error);
    throw error;
  }
}
async function listAllAcChgMToExcel(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) {
  try {
    const charSet = { vi: "S", en: "E", zh: "T" };
    const v_charset = charSet[language] || "E";
    const replacements = {
      factory_code,
      v_charset,
      ac_no: filters.ac_no ? `${filters.ac_no}%` : "%",
      ac_chgno: filters.ac_chgno ? `${filters.ac_chgno}%` : "%",
      chg_type: filters.chg_type ? `${filters.chg_type}%` : "%",
      cont_no: filters.cont_no ? `${filters.cont_no}%` : "%",
      status: filters.status || null,
      s_date: filters.s_date || null,
      e_date: filters.e_date || null,
      se_id: filters.se_id ? `${filters.se_id}%` : "%",
      ship_seq: filters.ship_seq || null,
    };
    let permissionCondition = "1=1";
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        a.ac_no,
        a.min_cont,
        COALESCE(a.sum_qty, 0) AS sum_qty,
        COALESCE(a.sum_money, 0) AS sum_money,
        a.tax,
        STRING_AGG(DISTINCT b.se_id, ';' ORDER BY b.se_id) AS v_po,
        d.ac_itemno,
        d.shoe_id,
        d.qty,
        d.price,
        d.money,
        "Customs".gf_ac_prod_ac_prod(:factory_code, d.shoe_id) AS t_acprod,
        COALESCE(
         "Customs".gf_ac_prodname(p.factory_code, p.customs_shoe_id, :v_charset) || 'Size' || ' ' || p.start_size,
          NULL
        ) AS t_name
      FROM "Customs".vw_chg_exp a
      LEFT JOIN "Customs".ac_plan_ord b
        ON a.factory_code = b.factory_code
       AND a.ac_no = b.ac_no
      INNER JOIN "Customs".ac_chg_d d
        ON a.factory_code = d.factory_code
       AND a.ac_no = d.ac_no
      LEFT JOIN "Customs".ac_prod_m p
        ON p.customs_shoe_id = d.shoe_id
       AND p.factory_code = :factory_code
       AND p.prod_acno = d.ac_itemno
      WHERE a.factory_code = :factory_code
        AND a.ac_no LIKE :ac_no
        AND a.ac_chgno LIKE :ac_chgno
        AND a.chg_type LIKE :chg_type
        AND a.cont_no LIKE :cont_no
        AND (a.status = :status OR :status IS NULL)
        AND (date_trunc('day', a.out_date) >= date_trunc('day', :s_date::timestamp) OR :s_date IS NULL)
        AND (date_trunc('day', a.out_date) <= date_trunc('day', :e_date::timestamp) OR :e_date IS NULL)
        AND (b.se_id LIKE :se_id OR b.se_id IS NULL)
        AND (b.ship_seq = :ship_seq OR :ship_seq IS NULL)
        AND ${permissionCondition}
      GROUP BY
        a.ac_no, a.min_cont, a.sum_qty, a.sum_money, a.tax,
        d.ac_itemno, d.shoe_id, d.qty, d.price, d.money,
        p.factory_code, p.customs_shoe_id, p.start_size,
        a.ac_chgno,
        a.out_date
      ORDER BY a.ac_no, a.ac_chgno, a.out_date, d.shoe_id, d.ac_itemno, d.price
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows || [];
  } catch (error) {
    console.error("ERROR in exportToExcel:", error);
    throw error;
  }
}
async function listAllReportChgD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  try {
    console.log("ininin", factory_code);

    // Permission logic
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      ac_no: ac_no || null,
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
    // SQL1: data chính
    const mainResult = await pool.query(
      `
      SELECT
        m.factory_code, m.ac_chgs, m.ac_chgn, m.ac_chgo, m.ac_no, m.ac_chgno,
        m.org_tax, m.org_addr, m.min_cont, m.cust_tax, m.cust_addr, m.rec_addr,
        m.ac_row, m.ac_bom, m.sort, m.com_date, m.ac_unit, m.in_country,
        m.ac_addr, m.agent_make, m.chg_type, m.license,
        m.cont_no, TO_CHAR(m.lic_date, 'DD/MM/YYYY') AS lic_date,
        m.out_date, m.out_port, m.curr_no, m.trade, m.curr_rate, m.payment,
        m.tax, m.add_tax, m.peice, m.sum_qty, m.sum_money,
        m.suttle, m.gross,
        d.seq, d.ac_itemno, d.unit, d.price, d.qty, d.money, d.in_qty
      FROM "Customs".vw_chg_exp m
      INNER JOIN "Customs".ac_chg_d d
        ON m.factory_code = d.factory_code
       AND m.ac_no = d.ac_no
      WHERE m.factory_code = :factory_code
        AND m.ac_no = :ac_no
        AND ${permissionCondition}
      ORDER BY m.factory_code, m.ac_no, d.seq, d.ac_itemno
      `,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
      },
    );

    return mainResult;
  } catch (error) {
    console.error("ERROR in getReportChgExp:", error);
    throw error;
  }
}
async function listAllReportDescProc(
  factory_code,
  department_code,
  user_code,
  query_level,

  ac_no,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      ac_no: ac_no || null,
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
    // SQL2: description
    const descResult = await pool.query(
      `
      SELECT factory_code, ac_no, seq, desc_item, ori, addo
      FROM "Customs".ac_desc_chg
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND ${permissionCondition}
      ORDER BY seq
      `,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
      },
    );

    return descResult;
  } catch (error) {
    console.error("ERROR in getReportChgExp:", error);
    throw error;
  }
}
async function listAllReportChgDWithName(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) {
  try {
    // Permission logic
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      ac_no: ac_no || null,
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "M.FACTORY_CODE = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "M.GRT_DEPT = :permission_dept AND M.FACTORY_CODE = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "M.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    // SQL: data chính
    const mainResult = await pool.query(
      `
      SELECT 
        M.FACTORY_CODE, M.AC_CHGS, M.AC_CHGN, M.AC_CHGO, M.AC_NO, M.AC_CHGNO, 
        M.ORG_TAX, M.ORG_ADDR, M.MIN_CONT, M.CUST_TAX, M.CUST_ADDR, M.REC_ADDR,
        M.AC_ROW, M.AC_BOM, M.SORT, M.COM_DATE, M.AC_UNIT, M.IN_COUNTRY,
        M.AC_ADDR, M.AGENT_MAKE, M.CHG_TYPE, M.LICENSE,
        M.CONT_NO, TO_CHAR(M.LIC_DATE, 'DD/MM/YYYY') AS LIC_DATE, 
        M.OUT_DATE, M.OUT_PORT, M.CURR_NO, M.TRADE, M.CURR_RATE, M.PAYMENT,
        M.TAX, M.ADD_TAX, M.PEICE, M.SUM_QTY, M.SUM_MONEY,
        M.SUTTLE, M.GROSS, 
        D.SEQ, D.AC_ITEMNO, D.UNIT, D.PRICE, D.QTY, D.MONEY, D.IN_QTY, 
        Y.SHORTNM_E
      FROM "Customs".VW_CHG_EXP M
      INNER JOIN "Customs".AC_CHG_D D
        ON M.FACTORY_CODE = D.FACTORY_CODE
       AND M.AC_NO = D.AC_NO
      INNER JOIN "Customs".FACTORY Y
        ON M.FACTORY_CODE = Y.FACTORY_CODE
      WHERE M.FACTORY_CODE = :factory_code
        AND M.AC_NO = :ac_no
        AND ${permissionCondition}
      ORDER BY M.FACTORY_CODE, M.AC_NO, D.SEQ, D.AC_ITEMNO
      `,
      {
        replacements,
        type: pool.QueryTypes.SELECT,
      },
    );

    return mainResult;
  } catch (error) {
    console.error("ERROR in listAllReportChgD:", error);
    throw error;
  }
}
async function getByID(factory_code, ac_no) {
  const acImp = await AC_CHG_M.findOne({
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
  type = "1",
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
  };
  console.log("check type", type);

  try {
    const sql = `
      SELECT 
        TO_CHAR(NOW(), 'YYYYMM') || 
        TO_CHAR(
          COALESCE(
            MAX(
              TO_NUMBER(
                CASE 
                  WHEN SUBSTRING(AC_NO, 7, 5) = '' THEN '00000'
                  ELSE SUBSTRING(AC_NO, 7, 5)
                END, 
                '99999'
              )
            ), 
            0
          ) + 1, 
          'FM00000'
        ) AS new_ac_no
      FROM "Customs".AC_CHG_M
      WHERE ${permissionCondition}
        AND SUBSTRING(AC_NO, 1, 6) = TO_CHAR(NOW(), 'YYYYMM')
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const newAcno = rows[0]?.new_ac_no;
    return newAcno;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getPosition(ac_no, pageSize, t, permission = {}, type = "1") {
  try {
    const { whereClause, replacements: permReplacements } =
      checkPermission(permission);

    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT 
          m.ac_no,
          ROW_NUMBER() OVER (ORDER BY ${type === "1" ? "v.out_date DESC, m.ac_no" : "m.ac_no,v.out_date DESC"} ) - 1 as position
        FROM "Customs".ac_chg_m m
        INNER JOIN  ${type === "1" ? '"Customs".vw_chg_imp' : '"Customs".vw_chg_exp'} v 
          ON m.factory_code = v.factory_code 
          AND m.ac_no = v.ac_no
        WHERE m.ac_type::text = '${type}'
          ${whereClause}
      )
      SELECT position
      FROM ranked
      WHERE ac_no = :ac_no
      `,
      {
        replacements: {
          ac_no,
          ...permReplacements,
        },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      },
    );

    const position = parseInt(result[0]?.position || 0);
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
  acChgM,
  pageSize,
  t,
  type = "1",
) {
  try {
    const addItem = await AC_CHG_M.create(acChgM, {
      transaction: t,
    });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItem.ac_no,
      pageSize,
      t,
      permission,
      type,
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
  t,
  type,
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
      editItem.ac_no,
      pageSize,
      t,
      permission,
      type,
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
  limit,
  offset,
) {
  try {
    let permissionCondition = "TRUE";
    let replacements = {
      factory_code: factory_code,
      ac_no: query.ac_no || "",
      status:
        query.status !== undefined && query.status !== null
          ? query.status
          : null,
      s_issuedate: query.s_date_1 || null,
      e_issuedate: query.e_date_1 || null,
      s_expiredate: query.s_date_2 || null,
      e_expiredate: query.e_date_2 || null,
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
        factory_code,
        ac_no, 
        issued_date, 
        expire_date, 
        req_no, 
        commno, 
        note, 
        status,
        grt_dept,
        grt_user,
        grt_date,
        last_user,
        last_date,
        locked_information
      FROM "Customs"."AC_CHG_M"
      WHERE 
        factory_code = :factory_code
        AND ac_no ILIKE :ac_no || '%'
        AND (:status IS NULL OR status = :status)
        AND (:s_issuedate IS NULL OR issued_date::date >= :s_issuedate::date)
        AND (:e_issuedate IS NULL OR issued_date::date <= :e_issuedate::date)
        AND (:s_expiredate IS NULL OR expire_date::date >= :s_expiredate::date)
        AND (:e_expiredate IS NULL OR expire_date::date <= :e_expiredate::date)
        AND ${permissionCondition}
      ORDER BY ac_no
      LIMIT :limit
      OFFSET :offset
    `;
    const countQuery = `
      SELECT COUNT(*) as total FROM "Customs"."AC_CHG_M"
      WHERE 
        factory_code = :factory_code
        AND ac_no ILIKE :ac_no || '%'
        AND (:status IS NULL OR status = :status)
        AND (:s_issuedate IS NULL OR issued_date::date >= :s_issuedate::date)
        AND (:e_issuedate IS NULL OR issued_date::date <= :e_issuedate::date)
        AND (:s_expiredate IS NULL OR expire_date::date >= :s_expiredate::date)
        AND (:e_expiredate IS NULL OR expire_date::date <= :e_expiredate::date)
        AND ${permissionCondition}
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countQuery, {
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
async function activate(factory_code, user_code, ac_no, curr_rate, language) {
  const transaction = await pool.transaction();
  const charset = {
    vi: "L",
    en: "E",
    zh: "T",
  };
  try {
    // 1. Validate dữ liệu
    const validateSql = `
      SELECT COUNT(*) as invalid_count
      FROM "Customs".ac_chg_d
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND (ac_itemno IS NULL OR country IS NULL OR in_qty IS NULL)
    `;
    const validateResult = await pool.query(validateSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (validateResult[0].invalid_count > 0) {
      const message = await gf_mesgnm(540097, charset[language]);
      throw new Error(message);
    }

    // 2. Lấy COM_INVOICE và SORT
    const getInvoiceSql = `
      SELECT com_invoice, sort
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const invoiceResult = await pool.query(getInvoiceSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (invoiceResult.length === 0) {
      const message = await gf_mesgnm(500057, charset[language]);
      throw new Error(message);
    }

    const { com_invoice, sort } = invoiceResult[0];

    // 3. Kiểm tra trùng Invoice
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

      if (dupResult.length > 0 && dupResult[0].IS_AC === "Y") {
        throw new Error("Invoice Number đã được sử dụng (trùng)!");
      }
    }

    // 4. Cập nhật STATUS = 7 cho AC_CHG_M
    const updateStatusSql = `
      UPDATE "Customs".ac_chg_m
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

    // 5. Đánh dấu IS_AC = 'Y'
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

    // 6. Cập nhật tồn kho hợp đồng (AC_CONT_D)
    const getContQtySql = `
      SELECT 
        d.factory_code,
        d.cont_no,
        d.goods_code,
        c.in_qty,
        c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      JOIN "Customs".ac_cont_m t 
        ON h.factory_code = t.factory_code 
        AND h.cont_no = t.cont_no
      JOIN "Customs".ac_cont_d d 
        ON t.factory_code = d.factory_code 
        AND t.cont_no = d.cont_no 
        AND c.ac_itemno = d.goods_code
      WHERE t.cont_type::NUMERIC = 1
        AND t.status = 7
        AND h.factory_code = :factory_code
        AND h.ac_no = :ac_no
      ORDER BY d.cont_no
    `;
    const contQtyResult = await pool.query(getContQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of contQtyResult) {
      const updateContSql = `
        UPDATE "Customs".ac_cont_d
        SET used_qty = used_qty + :in_qty,
            stock_qty = stock_qty - :in_qty
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: row.cont_no,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 7. Cập nhật giấy phép (AC_INM_D)
    const getInmQtySql = `
      SELECT 
        d.factory_code,
        d.inm_no,
        d.item_no,
        c.in_qty,
        c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      JOIN "Customs".ac_inm_m m 
        ON h.factory_code = m.factory_code 
        AND h.license = m.inm_no
      JOIN "Customs".ac_inm_d d 
        ON m.factory_code = d.factory_code 
        AND m.inm_no = d.inm_no 
        AND c.ac_itemno = d.item_no
      WHERE h.ac_type::NUMERIC = 1
        AND m.status = 7
        AND h.factory_code = :factory_code
        AND h.ac_no = :ac_no
      ORDER BY d.inm_no
    `;
    const inmQtyResult = await pool.query(getInmQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of inmQtyResult) {
      const updateInmSql = `
        UPDATE "Customs".ac_inm_d
        SET hs_qty = hs_qty + :in_qty,
            n_qty = n_qty - :in_qty
        WHERE factory_code = :factory_code
          AND inm_no = :inm_no
          AND item_no = :ac_itemno
      `;
      await pool.query(updateInmSql, {
        replacements: {
          factory_code: row.factory_code,
          inm_no: row.inm_no,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 8. Cập nhật OVER_QTY = IN_QTY
    const updateOverQtySql = `
      UPDATE "Customs".ac_chg_d
      SET over_qty = in_qty
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateOverQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 9. Tính tổng SUM_QTY và SUM_MONEY
    const sumSql = `
      SELECT 
        COALESCE(SUM(qty), 0) as total_qty,
        COALESCE(SUM(money), 0) as total_money
      FROM "Customs".ac_chg_d
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const sumResult = await pool.query(sumSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const updateSumSql = `
      UPDATE "Customs".ac_chg_m
      SET sum_qty = :total_qty,
          sum_money = :total_money
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    await pool.query(updateSumSql, {
      replacements: {
        factory_code,
        ac_no,
        total_qty: sumResult[0].total_qty,
        total_money: sumResult[0].total_money,
      },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 10. Tính lại CMONEY và TAX
    const getMoneySql = `
      SELECT seq, money, tax_rate
      FROM "Customs".ac_chg_d
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const moneyResult = await pool.query(getMoneySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of moneyResult) {
      const updateMoneySql = `
        UPDATE "Customs".ac_chg_d
        SET cmoney = ROUND(COALESCE(:curr_rate, 1) * COALESCE(:money, 0), 0),
            tax = ROUND(COALESCE(:curr_rate, 1) * COALESCE(:money, 0) * COALESCE(:tax_rate, 1) / 100)
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND seq = :seq
      `;
      await pool.query(updateMoneySql, {
        replacements: {
          factory_code,
          ac_no,
          seq: row.seq,
          curr_rate: parseFloat(curr_rate) || 1,
          money: parseFloat(row.money) || 0,
          tax_rate: parseFloat(row.tax_rate) || 0,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 11. Cập nhật AC_REQ_ORDER
    const updateReqOrderSql = `
      UPDATE "Customs".ac_req_order
      SET chge_qty = req_acqty
      WHERE factory_code = :factory_code
        AND req_no = (
          SELECT req_no
          FROM "Customs".ac_req_m
          WHERE factory_code = :factory_code
            AND invoice_no = :com_invoice
        )
    `;
    await pool.query(updateReqOrderSql, {
      replacements: { factory_code, com_invoice },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 12. Cập nhật AC_REQ_M
    const updateReqMSql = `
      UPDATE "Customs".ac_req_m
      SET ac_no = :ac_no
      WHERE factory_code = :factory_code
        AND invoice_no = :com_invoice
    `;
    await pool.query(updateReqMSql, {
      replacements: { factory_code, com_invoice, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    //13. Cập nhật total_money
    const updateTotalMoneySql = `
    UPDATE "Customs".ac_chg_m
SET 
  sum_money = sub.total_money,
  add_tax     = sub.add_tax,
  tax         = sub.tax
FROM (
  SELECT 
    SUM(COALESCE(money,   0)) AS total_money,
    SUM(COALESCE(add_tax, 0)) AS add_tax,
    SUM(COALESCE(tax,     0)) AS tax
  FROM "Customs".ac_chg_d
  WHERE factory_code = :factory_code
    AND ac_no        = :ac_no
    AND status > 0
) sub
WHERE "Customs".ac_chg_m.factory_code = :factory_code
  AND "Customs".ac_chg_m.ac_no        = :ac_no
    `;
    await pool.query(updateTotalMoneySql, {
      replacements: {
        factory_code,
        ac_no,
        total_money: sumResult[0].total_money,
      },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    await transaction.commit();

    return { success: true, message: "Kích hoạt thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in activateAcChg:", error);
    throw error;
  }
}
// ============================================
// F3: ACTIVATE (生效) - EXPORT
// ============================================
async function activateExp(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  try {
    // 1. Kiểm tra明細 detail có dữ liệu không
    const countDetailSql = `
      SELECT COUNT(1) AS cnt
      FROM "Customs".AC_CHG_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const countDetailResult = await pool.query(countDetailSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    if (parseInt(countDetailResult[0].cnt) === 0) {
      throw new Error("Chưa có dữ liệu明細!");
    }

    // // 2. Kiểm tra QTY / PRICE không được = 0
    // const checkQtySql = `
    //   SELECT COUNT(1) AS cnt
    //   FROM "Customs".AC_CHG_D
    //   WHERE factory_code = :factory_code
    //     AND ac_no = :ac_no
    //     AND (COALESCE(qty, 0) = 0 OR COALESCE(price, 0) = 0)
    // `;
    // const checkQtyResult = await pool.query(checkQtySql, {
    //   replacements: { factory_code, ac_no },
    //   type: pool.QueryTypes.SELECT,
    //   transaction,
    // });
    // console.log("check the result[0]", checkQtyResult[0]?.cnt);

    // if (parseInt(checkQtyResult[0].cnt) > 0) {
    //   const message = await gf_mesgnm(500044, charset[language]);
    //   throw new Error(message);
    // }

    // 3. Tổng hợp SUM_QTY, SUM_MONEY, TAX từ detail
    const sumSql = `
      SELECT
        COALESCE(SUM(qty), 0)   AS sum_qty,
        COALESCE(SUM(money), 0) AS sum_money,
        COALESCE(SUM(tax), 0)   AS sum_tax
      FROM "Customs".AC_CHG_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const sumResult = await pool.query(sumSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    const { sum_qty, sum_money, sum_tax } = sumResult[0];

    // 4. Update SUM lên header
    await pool.query(
      `UPDATE "Customs".AC_CHG_M
       SET sum_qty   = :sum_qty,
           sum_money = :sum_money,
           tax       = :sum_tax
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no, sum_qty, sum_money, sum_tax },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    // 5. Trừ tồn kho hợp đồng (AC_CONT_D) theo SEQ ASC
    const getTotalQtySql = `
      SELECT COALESCE(SUM(d.qty), 0) AS total_qty,
             m.cont_no
      FROM "Customs".AC_CHG_D d
      JOIN "Customs".AC_CHG_M m
        ON m.factory_code = d.factory_code AND m.ac_no = d.ac_no
      WHERE d.factory_code = :factory_code
        AND d.ac_no = :ac_no
      GROUP BY m.cont_no
    `;
    const totalQtyResult = await pool.query(getTotalQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (totalQtyResult.length > 0) {
      let remainQty = parseFloat(totalQtyResult[0].total_qty);
      const cont_no = totalQtyResult[0].cont_no;

      const contRowsSql = `
        SELECT factory_code, cont_no, seq,
               COALESCE(stock_qty, 0) AS stock_qty
        FROM "Customs".AC_CONT_D
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND COALESCE(stock_qty, 0) > 0
        ORDER BY seq ASC
      `;
      const contRows = await pool.query(contRowsSql, {
        replacements: { factory_code, cont_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      for (const row of contRows) {
        if (remainQty <= 0) break;
        const use = Math.min(remainQty, parseFloat(row.stock_qty));
        remainQty -= use;
        await pool.query(
          `UPDATE "Customs".AC_CONT_D
           SET used_qty  = COALESCE(used_qty, 0)  + :use,
               stock_qty = COALESCE(stock_qty, 0) - :use
           WHERE factory_code = :factory_code
             AND cont_no = :cont_no
             AND seq = :seq`,
          {
            replacements: {
              factory_code,
              cont_no: row.cont_no,
              seq: row.seq,
              use,
            },
            type: pool.QueryTypes.UPDATE,
            transaction,
          },
        );
      }
    }

    // 6. Tính vật liệu báo quan xuất khẩu
    await pool.query(
      `SELECT "Customs".GF_CAL_CHGE_MATD(:factory_code, :ac_no, :user_code, :user_code)`,
      {
        replacements: { factory_code, ac_no, user_code },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    // 7. Update STATUS = 7
    await pool.query(
      `UPDATE "Customs".AC_CHG_M
       SET status    = 7,
           last_user = :user_code,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no, user_code },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );
    await transaction.commit();
    return { success: true, message: "生效 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in activateExp:", error);
    throw error;
  }
}

// ============================================
// F4: CANCEL ACTIVATION (取消生效)
// ============================================
async function cancelActivate(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();

  try {
    // 1. Lấy COM_INVOICE, SORT và LICENSE
    const getInfoSql = `
      SELECT com_invoice, sort, license
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const infoResult = await pool.query(getInfoSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (infoResult.length === 0) {
      const message = await gf_mesgnm(500057, language);
      throw new Error(message);
    }

    const { com_invoice, sort, license } = infoResult[0];

    // 2. Cập nhật STATUS = 1
    const updateStatusSql = `
      UPDATE "Customs".ac_chg_m
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

    // 3. Cập nhật IS_AC = 'N'
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

    // 4. Hoàn nguyên tồn kho hợp đồng (GET_QTY)
    const getContQtySql = `
      SELECT 
        d.factory_code,
        d.cont_no,
        d.goods_code,
        c.in_qty,
        c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      JOIN "Customs".ac_cont_m t 
        ON h.factory_code = t.factory_code 
        AND h.cont_no = t.cont_no
      JOIN "Customs".ac_cont_d d 
        ON t.factory_code = d.factory_code 
        AND t.cont_no = d.cont_no 
        AND c.ac_itemno = d.goods_code
      WHERE t.cont_type::NUMERIC = 1
        AND t.status = 7
        AND h.factory_code = :factory_code
        AND h.ac_no = :ac_no
      ORDER BY d.cont_no
    `;
    const contResult = await pool.query(getContQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of contResult) {
      const updateContSql = `
        UPDATE "Customs".ac_cont_d
        SET used_qty = used_qty - :in_qty,
            stock_qty = stock_qty + :in_qty
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: row.cont_no,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 5. Hoàn nguyên giấy phép (GET_INQTY)
    const getInmQtySql = `
      SELECT 
        d.factory_code,
        d.item_no,
        d.inm_no,
        c.in_qty,
        c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      JOIN "Customs".ac_inm_m m 
        ON h.factory_code = m.factory_code 
        AND h.license = m.inm_no
      JOIN "Customs".ac_inm_d d 
        ON m.factory_code = d.factory_code 
        AND m.inm_no = d.inm_no 
        AND c.ac_itemno = d.item_no
      WHERE h.ac_type::NUMERIC = 1
        AND m.status = 7
        AND h.factory_code = :factory_code
        AND h.ac_no = :ac_no
      ORDER BY d.inm_no
    `;
    const inmResult = await pool.query(getInmQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of inmResult) {
      const updateInmSql = `
        UPDATE "Customs".ac_inm_d
        SET hs_qty = hs_qty - :in_qty,
            n_qty = n_qty + :in_qty
        WHERE factory_code = :factory_code
          AND inm_no = :license
          AND item_no = :ac_itemno
      `;
      await pool.query(updateInmSql, {
        replacements: {
          factory_code: factory_code,
          license: license,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 6. Xóa AC_NO trong AC_REQ_M
    const updateReqMSql = `
      UPDATE "Customs".ac_req_m
      SET ac_no = NULL
      WHERE factory_code = :factory_code
        AND invoice_no = :com_invoice
    `;
    await pool.query(updateReqMSql, {
      replacements: { factory_code, com_invoice },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 7. Xóa CHGE_QTY
    const updateReqOrderSql = `
      UPDATE "Customs".ac_req_order
      SET chge_qty = NULL
      WHERE factory_code = :factory_code
        AND req_no = (
          SELECT req_no
          FROM "Customs".ac_req_m
          WHERE factory_code = :factory_code
            AND invoice_no = :com_invoice
        )
    `;
    await pool.query(updateReqOrderSql, {
      replacements: { factory_code, com_invoice },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    await transaction.commit();

    return { success: true, message: "Hủy kích hoạt thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in cancelActivateAcChg:", error);
    throw error;
  }
}
async function cancelActivateExp(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  try {
    // 1. Kiểm tra không có issue đã status = 9
    const checkIssueSql = `
      SELECT COUNT(1) AS cnt
      FROM "Customs".AC_ISSUE_M_T
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND status = 9
    `;
    const checkIssueResult = await pool.query(checkIssueSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    if (parseInt(checkIssueResult[0].cnt) > 0) {
      const message = await gf_mesgnm("500067", charset[language]);
      throw new Error(message);
    }

    // 2. Hoàn tồn kho hợp đồng (AC_CONT_D) theo SEQ DESC
    const getTotalQtySql = `
      SELECT COALESCE(SUM(d.qty), 0) AS total_qty,
             m.cont_no
      FROM "Customs".AC_CHG_D d
      JOIN "Customs".AC_CHG_M m
        ON m.factory_code = d.factory_code AND m.ac_no = d.ac_no
      WHERE d.factory_code = :factory_code
        AND d.ac_no = :ac_no
      GROUP BY m.cont_no
    `;
    const totalQtyResult = await pool.query(getTotalQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (totalQtyResult.length > 0) {
      let remainQty = parseFloat(totalQtyResult[0].total_qty);
      const cont_no = totalQtyResult[0].cont_no;

      const contRowsSql = `
        SELECT factory_code, cont_no, seq,
               COALESCE(used_qty, 0) AS used_qty
        FROM "Customs".AC_CONT_D
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND COALESCE(used_qty, 0) > 0
        ORDER BY seq DESC
      `;
      const contRows = await pool.query(contRowsSql, {
        replacements: { factory_code, cont_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      for (const row of contRows) {
        if (remainQty <= 0) break;
        const restore = Math.min(remainQty, parseFloat(row.used_qty));
        remainQty -= restore;
        await pool.query(
          `UPDATE "Customs".AC_CONT_D
           SET used_qty  = COALESCE(used_qty, 0)  - :restore,
               stock_qty = COALESCE(stock_qty, 0) + :restore
           WHERE factory_code = :factory_code
             AND cont_no = :cont_no
             AND seq = :seq`,
          {
            replacements: {
              factory_code,
              cont_no: row.cont_no,
              seq: row.seq,
              restore,
            },
            type: pool.QueryTypes.UPDATE,
            transaction,
          },
        );
      }
    }

    // 3. Xóa các bản ghi liên quan
    await pool.query(
      `DELETE FROM "Customs".AC_CHK_T
       WHERE factory_code = :factory_code
         AND out_acno = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      },
    );

    await pool.query(
      `DELETE FROM "Customs".AC_ISSUE_MATD_T
       WHERE factory_code = :factory_code
         AND conf_seq IN (
           SELECT conf_seq FROM "Customs".AC_ISSUE_M_T
           WHERE factory_code = :factory_code
             AND ac_no = :ac_no
         )`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      },
    );

    await pool.query(
      `DELETE FROM "Customs".AC_ISSUE_M_T
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      },
    );

    // 4. Update STATUS = 1
    await pool.query(
      `UPDATE "Customs".AC_CHG_M
       SET status    = 1,
           last_user = :user_code,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no, user_code },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    await transaction.commit();
    return { success: true, message: "取消生效 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in cancelActivateExp:", error);
    throw error;
  }
}
// ============================================
// CLOSE CASE (結案)
// ============================================
async function close(factory_code, ac_no, user_code) {
  try {
    const sql = `
      UPDATE "Customs".ac_chg_m
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

    return { success: true, message: "Kết thúc chứng từ thành công" };
  } catch (error) {
    console.error("Error in closeAcChg:", error);
    throw error;
  }
}
async function refreshGrossWeight(factory_code, ac_no) {
  const transaction = await pool.transaction();
  try {
    const sql = `
      UPDATE "Customs".VW_CHG_EXP
      SET (peice, gross) = (
        SELECT
          SUM(COALESCE(C.ctns, 0)),
          SUM(COALESCE(A.nw, 0) + COALESCE(C.ctns, 0) * ROUND(COALESCE(B.sap_nw, 0), 2)) AS gw
        FROM "pac".SD_PACK_M A
        LEFT JOIN "public".MM_ITEM B
          ON A.org_id = B.org_id AND A.item_no = B.item_no
        LEFT JOIN (
          SELECT
            S.factory_code, S.se_id, S.se_seq, S.pk_seq,
            SUM(COALESCE(S.ctns, 0)) AS ctns
          FROM "Customs".AC_PLAN_ORD M
          JOIN "Customs".SE_PLAN_SIZE S
            ON M.factory_code = S.factory_code
            AND M.se_id       = S.se_id
            AND M.se_seq      = S.se_seq
            AND M.pack_gu     = S.pack_gu
            AND M.ship_seq    = S.ship_seq
          WHERE COALESCE(S.ctns, 0) <> 0
            AND M.factory_code = :factory_code
            AND M.ac_no        = :ac_no
          GROUP BY S.factory_code, S.se_id, S.se_seq, S.pk_seq
        ) C
          ON A.org_id        = C.factory_code
          AND A.se_id        = C.se_id
          AND A.se_seq::TEXT = C.se_seq
          AND A.pk_seq       = C.pk_seq
      )
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;

    await pool.query(sql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    await transaction.commit();
    return { success: true, message: "刷新毛重/件數 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in refreshGrossWeight:", error);
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
    // 1. Validate LATION (số công văn hủy)
    const checkLationSql = `
      SELECT lation
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const lationResult = await pool.query(checkLationSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (lationResult.length === 0 || !lationResult[0].lation) {
      const message = await gf_mesgnm(500058, charset[language]);
      const error = new Error(message);
      error.code = 500058;
      throw error;
    }

    // 2. Lấy thông tin cần thiết
    const getInfoSql = `
      SELECT com_invoice, sort, license
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const infoResult = await pool.query(getInfoSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const { com_invoice, sort, license } = infoResult[0];

    // 3. Cập nhật IS_AC = 'N'
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

    // 4. Cập nhật STATUS = 0 (đã hủy)
    const updateStatusSql = `
      UPDATE "Customs".ac_chg_m
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

    // 5. Hoàn nguyên tồn kho hợp đồng
    const getContQtySql = `
      SELECT 
        d.factory_code,
        d.cont_no,
        d.goods_code,
        c.in_qty,
        c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      JOIN "Customs".ac_cont_m t 
        ON h.factory_code = t.factory_code 
        AND h.cont_no = t.cont_no
      JOIN "Customs".ac_cont_d d 
        ON t.factory_code = d.factory_code 
        AND t.cont_no = d.cont_no 
        AND c.ac_itemno = d.goods_code
      WHERE t.cont_type::NUMERIC = 1
        AND t.status = 7
        AND h.factory_code = :factory_code
        AND h.ac_no = :ac_no
    `;
    const contResult = await pool.query(getContQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of contResult) {
      const updateContSql = `
        UPDATE "Customs".ac_cont_d
        SET used_qty = used_qty - :in_qty,
            stock_qty = stock_qty + :in_qty
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND goods_code = :ac_itemno
      `;
      await pool.query(updateContSql, {
        replacements: {
          factory_code: row.factory_code,
          cont_no: row.cont_no,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    // 6. Hoàn nguyên giấy phép
    const getInmQtySql = `
      SELECT c.in_qty, c.ac_itemno
      FROM "Customs".ac_chg_d c
      JOIN "Customs".ac_chg_m h 
        ON h.factory_code = c.factory_code 
        AND h.ac_no = c.ac_no
      WHERE h.factory_code = :factory_code 
        AND h.ac_no = :ac_no
    `;
    const inmResult = await pool.query(getInmQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of inmResult) {
      const updateInmSql = `
        UPDATE "Customs".ac_inm_d
        SET hs_qty = hs_qty - :in_qty,
            n_qty = n_qty + :in_qty
        WHERE factory_code = :factory_code
          AND inm_no = :license
          AND item_no = :ac_itemno
      `;
      await pool.query(updateInmSql, {
        replacements: {
          factory_code,
          license,
          ac_itemno: row.ac_itemno,
          in_qty: row.in_qty,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
    }

    await transaction.commit();

    return { success: true, message: "Hủy bỏ chứng từ thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in voidAcChg:", error);
    throw error;
  }
}
async function voidAllExp(factory_code, ac_no, user_code, language) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  console.log("lang", charset[language]);

  try {
    // 1. Validate LATION (số công văn hủy)
    const checkOldNoSql = `
      SELECT old_no
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const oldNoResult = await pool.query(checkOldNoSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (oldNoResult.length === 0 || !oldNoResult[0].old_no) {
      const message = await gf_mesgnm(500107, charset[language]);
      const error = new Error(message);
      error.code = 500107;
      throw error;
    }

    // 2. Hoàn tồn kho hợp đồng (AC_CONT_D) theo SEQ DESC
    const getTotalQtySql = `
      SELECT COALESCE(SUM(d.qty), 0) AS total_qty,
             m.cont_no
      FROM "Customs".AC_CHG_D d
      JOIN "Customs".AC_CHG_M m
        ON m.factory_code = d.factory_code AND m.ac_no = d.ac_no
      WHERE d.factory_code = :factory_code
        AND d.ac_no = :ac_no
      GROUP BY m.cont_no
    `;
    const totalQtyResult = await pool.query(getTotalQtySql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (totalQtyResult.length > 0) {
      let remainQty = parseFloat(totalQtyResult[0].total_qty);
      const cont_no = totalQtyResult[0].cont_no;

      const contRowsSql = `
        SELECT factory_code, cont_no, seq,
               COALESCE(used_qty, 0) AS used_qty
        FROM "Customs".AC_CONT_D
        WHERE factory_code = :factory_code
          AND cont_no = :cont_no
          AND COALESCE(used_qty, 0) > 0
        ORDER BY seq DESC
      `;
      const contRows = await pool.query(contRowsSql, {
        replacements: { factory_code, cont_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      for (const row of contRows) {
        if (remainQty <= 0) break;
        const restore = Math.min(remainQty, parseFloat(row.used_qty));
        remainQty -= restore;
        await pool.query(
          `UPDATE "Customs".AC_CONT_D
           SET used_qty  = COALESCE(used_qty, 0)  - :restore,
               stock_qty = COALESCE(stock_qty, 0) + :restore
           WHERE factory_code = :factory_code
             AND cont_no = :cont_no
             AND seq = :seq`,
          {
            replacements: {
              factory_code,
              cont_no: row.cont_no,
              seq: row.seq,
              restore,
            },
            type: pool.QueryTypes.UPDATE,
            transaction,
          },
        );
      }
    }

    // 3. Gọi GF_ISSUE_CANCEL cho từng CONF_SEQ trong AC_ISSUE_M_T
    const getIssuesSql = `
      SELECT factory_code, conf_seq
      FROM "Customs".AC_ISSUE_M_T
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const issuesResult = await pool.query(getIssuesSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of issuesResult) {
      await pool.query(
        `SELECT "Customs".GF_ISSUE_CANCEL(:factory_code, :conf_seq, :ac_chgs, :old_no, :user_code)`,
        {
          replacements: {
            factory_code: row.factory_code,
            conf_seq: row.conf_seq,
            ac_chgs,
            old_no,
            user_code,
          },
          type: pool.QueryTypes.SELECT,
          transaction,
        },
      );
    }

    // 4. Khôi phục status báo quan nhập/chuyển xưởng liên quan
    const getChkSql = `
      SELECT DISTINCT t.factory_code, u.in_acno, u.src
      FROM "Customs".AC_ISSUE_M_T t
      JOIN "Customs".AC_CHK_T u
        ON u.factory_code = t.factory_code
        AND u.conf_seq = t.conf_seq
      WHERE t.factory_code = :factory_code
        AND t.ac_no = :ac_no
    `;
    const chkResult = await pool.query(getChkSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of chkResult) {
      if (parseInt(row.src) === 1) {
        // Import: kiểm tra AC_CHG_D còn over_qty > 0 thì trả về status 7
        const checkSql = `
          SELECT COUNT(1) AS cnt
          FROM "Customs".AC_CHG_D
          WHERE factory_code = :factory_code
            AND ac_no = :in_acno
            AND COALESCE(over_qty, 0) > 0
        `;
        const checkResult = await pool.query(checkSql, {
          replacements: {
            factory_code: row.factory_code,
            in_acno: row.in_acno,
          },
          type: pool.QueryTypes.SELECT,
          transaction,
        });
        if (parseInt(checkResult[0].cnt) > 0) {
          await pool.query(
            `UPDATE "Customs".AC_CHG_M
             SET status        = 7,
                 complete_type = NULL
             WHERE factory_code = :factory_code
               AND ac_no = :in_acno
               AND status = 9`,
            {
              replacements: {
                factory_code: row.factory_code,
                in_acno: row.in_acno,
              },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      } else if (parseInt(row.src) === 9) {
        // Transfer: kiểm tra AC_PROC_D còn over_qty > 0 thì trả về status 7
        const checkSql = `
          SELECT COUNT(1) AS cnt
          FROM "Customs".AC_PROC_D
          WHERE factory_code = :factory_code
            AND ac_no = :in_acno
            AND COALESCE(over_qty, 0) > 0
        `;
        const checkResult = await pool.query(checkSql, {
          replacements: {
            factory_code: row.factory_code,
            in_acno: row.in_acno,
          },
          type: pool.QueryTypes.SELECT,
          transaction,
        });
        if (parseInt(checkResult[0].cnt) > 0) {
          await pool.query(
            `UPDATE "Customs".AC_PROC_M
             SET status        = 7,
                 complete_type = NULL
             WHERE factory_code = :factory_code
               AND ac_no = :in_acno
               AND status = 9`,
            {
              replacements: {
                factory_code: row.factory_code,
                in_acno: row.in_acno,
              },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      }
    }

    // 5. Khôi phục SE_PLAN_ORD từ 12 về 7
    await pool.query(
      `UPDATE "Customs".SE_PLAN_ORD AS A
       SET col7 = '7'
       WHERE A.factory_code = :factory_code
         AND A.col7 = '12'
         AND (A.se_id, A.se_ver, A.se_seq, A.pack_gu, A.ship_seq) IN (
           SELECT se_id, se_ver, se_seq, pack_gu, ship_seq
           FROM "Customs".AC_PLAN_SE
           WHERE factory_code = :factory_code
             AND ac_no = :ac_no
         )`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    // 6. Xóa AC_PLAN_SE
    await pool.query(
      `DELETE FROM "Customs".AC_PLAN_SE
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      },
    );
    // 7. Update STATUS = 0
    await pool.query(
      `UPDATE "Customs".AC_CHG_M
       SET status    = 0,
           last_user = :user_code,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no, user_code },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    await transaction.commit();
    return { success: true, message: "作廢 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in voidExp:", error);
    throw error;
  }
}
async function confirmPassDate(factory_code, ac_no, out_date) {
  const transaction = await pool.transaction();
  try {
    await pool.query(
      `UPDATE "Customs".VW_CHG_EXP
       SET pass_date = :out_date
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no, out_date },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );
    await transaction.commit();
    return { success: true, message: "確定 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in confirmPassDate:", error);
    throw error;
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
      SELECT DISTINCT ON (${field}) ${field}, ac_no
      FROM "Customs".AC_CHG_M
      WHERE AC_TYPE = '2'
        AND STATUS = 7
        AND ${permissionCondition}
        ${searchCondition}
      ORDER BY ${field}, AC_CHGNO
      LIMIT :limit
      OFFSET :offset
      `;
    countSql = `
SELECT COUNT(*) AS total
FROM (
  SELECT DISTINCT ${field}
  FROM "Customs".AC_CHG_M
  WHERE AC_TYPE = '2'
    AND STATUS = 7
    AND ${permissionCondition}
    ${searchCondition}
) t
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
async function checkDuplicateAcChgno(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgno,
  out_date,
  ac_no = null,
  type = "1",
) {
  if (!ac_chgno || !out_date)
    return {
      success: false,
      message: "Missing Custom Declaration Date or Custom Declaration No!",
    };
  if (type === "2") {
    return { success: true, count: 0 };
  }
  const year = new Date(out_date).getFullYear();

  let permissionCondition = "1=1";
  let replacements = {
    factory_code,
    ac_chgno,
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
      FROM "Customs".AC_CHG_M
      WHERE ${permissionCondition}
        AND ac_chgno = :ac_chgno
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
        message: `Code already exists`,
      }),
    };
  } catch (error) {
    console.error("Error in checkDuplicateAcChgno:", error);
    throw error;
  }
}
module.exports = {
  listAllAcInmM,
  listAllAcChgMWithDetails,
  listAllAcChgMToExcel,
  getByID,
  createAcno,
  add,
  edit,
  deleteImp,
  search,
  activate,
  cancelActivate,
  close,
  voidAll,
  activateExp,
  cancelActivateExp,
  refreshGrossWeight,
  voidAllExp,
  confirmPassDate,
  listAllReportDescProc,
  listAllReportChgD,
  listAllReportChgDWithName,
  fetchFieldDropdown,
  confirm,
  checkDuplicateAcChgno,
};
