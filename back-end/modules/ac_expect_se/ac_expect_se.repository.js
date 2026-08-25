const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_EXPECT_SE = require("./ac_expect_se.model.js");

async function listAllAcExpectSe(
  factory_code,
  expect_id,
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
      expect_id: parseInt(expect_id) || null,
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

    // Permission logic
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
      A.FACTORY_CODE,
      A.EXPECT_ID,
      A.SEQ,
      A.BOM_PROD,
      A.PROD_NO,
      CASE :p_charset WHEN 'T' THEN B.NAME_T WHEN 'S' THEN B.NAME_S ELSE B.NAME_T END AS PROD_NAME,
      A.SE_QTY, 
      A.AC_SHOE  
      FROM "Customs".AC_EXPECT_SE A, 
      "public".MM_ITEM B 
      WHERE A.PROD_NO=B.ITEM_NO 
      AND ${permissionCondition}
      AND A.EXPECT_ID =:expect_id
      ORDER BY A.expect_id ASC
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
    console.error("Error in fetchAllAcExpectM:", error);
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
    whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
    replacements: replacements,
  };
}
async function getByID(factory_code, expect_id) {
  const acImp = await AC_EXPECT_SE.findOne({
    where: {
      factory_code: factory_code,
      expect_id: expect_id,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function createExpectId(factory_code) {
  try {
    const sql = `
      SELECT COALESCE(MAX(expect_id), 0) + 1 AS next_id
      FROM "Customs".ac_expect_m
      WHERE factory_code = :factory_code
    `;
    const result = await pool.query(sql, {
      replacements: { factory_code },
      type: pool.QueryTypes.SELECT,
    });
    return result[0]?.next_id ?? 1;
  } catch (error) {
    console.error("Error in getNextExpectId:", error);
    throw error;
  }
}
async function getPosition(expect_id, pageSize, t, permission = {}) {
  try {
    const { whereClause, replacements: permReplacements } =
      checkPermission(permission);

    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT
          m.expect_id,
          ROW_NUMBER() OVER (ORDER BY m.expect_id ASC) - 1 AS position
        FROM "Customs".ac_expect_m m
        WHERE ${whereClause}
      )
      SELECT position
      FROM ranked
      WHERE expect_id = :expect_id
      `,
      {
        replacements: { expect_id, ...permReplacements },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      },
    );

    const position = parseInt(result[0]?.position || 0);
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
  t,
) {
  try {
    const addItem = await AC_EXPECT_SE.create(acChgM, {
      transaction: t,
    });
    const permission = {
      factory_code,
      department_code,
      user_code,
      query_level,
    };
    const positionInfo = await getPosition(
      addItem.expect_id,
      pageSize,
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
      editItem.expect_id,
      pageSize,
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
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  console.log("dadad", filters);

  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      expect_id: filters.expect_id || null,
      type: filters.type || null,
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

    // Permission logic
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
        T.expect_id,
        CASE T.type
          WHEN '1' THEN '1-核銷預估'
          WHEN '2' THEN '2-核領對比'
        END AS type,
        T.s_date1,
        T.e_date1,
        T.s_date2,
        T.e_date2,
        CASE T.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status,
        T.grt_dept,
        "Customs".GF_DEPTNM(T.factory_code, T.grt_dept, :p_charset) AS grt_deptname,
        T.grt_user,
        "Customs".GF_EMPNM(T.grt_user, :p_charset) AS grt_username,
        T.grt_date,
        T.last_user,
        "Customs".GF_EMPNM(T.last_user, :p_charset) AS last_username,
        T.last_date
      FROM "Customs".ac_expect_m T
      WHERE T.factory_code = :factory_code
        AND ${permissionCondition}
        AND (:expect_id IS NULL OR T.expect_id = :expect_id)
        AND (:type     IS NULL OR T.type      = :type)
      ORDER BY T.expect_id ASC
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
        SELECT COUNT(*) AS count
        FROM "Customs".ac_expect_m T
        WHERE T.factory_code = :factory_code
          AND ${permissionCondition}
          AND (:expect_id IS NULL OR T.expect_id = :expect_id)
          AND (:type     IS NULL OR T.type      = :type)
      `;
      const countResult = await pool.query(countQuery, {
        replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.count);
    }

    return {
      rows: actualRows,
      count: total,
      hasMore,
    };
  } catch (error) {
    console.error("Error in searchAcExpectM:", error);
    throw error;
  }
}
// ============================================
// F3: 訂單資料產生 (Generate Order Material)
// ============================================
async function generateOrderMaterial(factory_code, expect_id, user_code) {
  const transaction = await pool.transaction();
  try {
    // 1. Xóa dữ liệu cũ trong AC_EXPECT_SEATD
    await pool.query(
      `DELETE FROM "Customs".ac_expect_matd
       WHERE factory_code = :factory_code
         AND expect_id = :expect_id`,
      {
        replacements: { factory_code, expect_id },
        type: pool.QueryTypes.DELETE,
        transaction,
      },
    );

    // 2. Gọi hàm tổng hợp vật liệu GF_GET_SE
    await pool.query(`SELECT "Customs".GF_GET_SE(:factory_code, :expect_id)`, {
      replacements: { factory_code, expect_id },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 3. Cập nhật last_user / last_date
    await pool.query(
      `UPDATE "Customs".ac_expect_m
       SET last_user = :user_code,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND expect_id = :expect_id`,
      {
        replacements: { factory_code, expect_id, user_code },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    await transaction.commit();
    return { success: true, message: "訂單資料產生 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in generateOrderMaterial:", error);
    throw error;
  }
}

// ============================================
// F4: 核銷材料計算 (Calculate Write-off Material)
// ============================================
async function calculateWriteoffMaterial(factory_code, expect_id, user_code) {
  const transaction = await pool.transaction();
  try {
    // 1. Gọi hàm tính toán vật liệu GF_GET_SEITEM
    await pool.query(
      `SELECT "Customs".GF_GET_SEITEM(:factory_code, :expect_id)`,
      {
        replacements: { factory_code, expect_id },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    // 2. Cập nhật last_user / last_date
    await pool.query(
      `UPDATE "Customs".ac_expect_m
       SET last_user = :user_code,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND expect_id = :expect_id`,
      {
        replacements: { factory_code, expect_id, user_code },
        type: pool.QueryTypes.UPDATE,
        transaction,
      },
    );

    await transaction.commit();
    return { success: true, message: "核銷材料計算 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in calculateWriteoffMaterial:", error);
    throw error;
  }
}

// ============================================
// REPORT: 鞋型對照表列印 (Print Shoe Model Table)
// ============================================
async function reportShoeModel(
  factory_code,
  department_code,
  query_level,
  user_code,
  language,
  expect_id,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    const p_charset = charset[language] || "E";
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
    };

    // Permission logic
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
        A.prod_no,
        CASE :p_charset
          WHEN 'T' THEN B.name_t
          WHEN 'S' THEN B.name_s
          ELSE B.name_e
        END AS prod_nm,
        A.bom_prod,
        A.ac_shoe,
        COALESCE(A.se_qty, 0) AS se_qty
      FROM "Customs".ac_expect_se A
      JOIN "public".mm_item B
        ON A.prod_no = B.item_no
      WHERE A.factory_code = :factory_code
        AND A.expect_id = :expect_id
      ORDER BY A.ac_shoe, A.bom_prod, A.prod_no
    `;

    const rows = await pool.query(sql, {
      replacements: { factory_code, expect_id, p_charset },
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in reportShoeModel:", error);
    throw error;
  }
}

// ============================================
// REPORT: 預估核銷表列印 (Print Estimated Write-off Table)
// ============================================
async function reportExpectWriteoff(
  factory_code,
  department_code,
  query_level,
  user_code,
  language,
  expect_id,
) {
  try {
    const charset = { vi: "S", en: "E", zh: "T" };
    const p_charset = charset[language] || "E";
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
    };

    // Permission logic
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
        M.expect_id,
        D.seq,
        D.matd_no,
        "Customs".GF_AC_ITEMNAME(M.factory_code, D.matd_no, :p_charset) AS matd_name,
        "Customs".GF_CODE_NAME(
          M.factory_code,
          '1105',
          "Customs".GF_AC_ITEMUNIT(M.factory_code, D.matd_no),
          :p_charset
        ) AS matd_unitnm,
        D.loss_per,
        D.expect_qty,
        D.left_qty,
        D.issue_qty,
        D.draw_qty
      FROM "Customs".ac_expect_m M
      JOIN "Customs".ac_expect_matd D
        ON M.factory_code = D.factory_code
        AND M.expect_id   = D.expect_id
      WHERE M.factory_code = :factory_code
        AND M.expect_id    = :expect_id
      ORDER BY D.matd_no
    `;

    const rows = await pool.query(sql, {
      replacements: { factory_code, expect_id, p_charset },
      type: pool.QueryTypes.SELECT,
    });

    return rows;
  } catch (error) {
    console.error("Error in reportExpectWriteoff:", error);
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
     SELECT ${field}
     FROM "Customs".AC_EXPECT_SE
      WHERE ${permissionCondition}
      ${searchCondition}
     ORDER BY EXPECT_ID
        limit :limit
        offset :offset
      `;
    countSql = `
        SELECT COUNT(${field}) as total
             FROM "Customs".AC_EXPECT_SE
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
  listAllAcExpectSe,
  getByID,
  createExpectId,
  add,
  edit,
  deleteImp,
  search,
  generateOrderMaterial,
  calculateWriteoffMaterial,
  reportShoeModel,
  reportExpectWriteoff,
  fetchFieldDropdown,
};
