const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_INV_M = require("./se_inv_d.model.js");

async function fetchListOfSeInvD(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  se_id,
  se_ver,
  se_seq,
  language,
  limit,
  offset,
) {
  try {
    const replacements = {
      factory_code: factory_code || null,
      ac_no: ac_no || null,
      invoice_id: invoice_id || null,
      se_id: se_id || null,
      se_ver: se_ver || null,
      se_seq: se_seq || null,
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
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
      a.factory_code,
      a.ac_no,
      a.invoice_id,
      a.se_id,
      a.se_ver,
      a.se_seq,
      a.pack_gu,
        a.ship_seq,
        a.pk_seq,
        a.size_run,
        a.ctn_pairs,
        a.ctns,
        a.s_no,
        a.e_no,
        a.length,
        a.width,
        a.high,
        a.cbm,
        a.net_weight,
        a.gross_weight
      FROM "Customs".se_inv_d a
      JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id        = b.se_id
       AND a.se_seq       = b.se_seq::TEXT
       AND a.pack_gu      = b.pack_gu
      WHERE a.factory_code = :factory_code
        AND a.ac_no        = :ac_no
        AND a.invoice_id   = :invoice_id
        AND b.ori_se_id    = :se_id
        AND b.se_ver       = :se_ver
        AND b.se_seq       = :se_seq
        AND ${permissionCondition}
      ORDER BY a.ship_seq, a.pk_seq
      LIMIT  :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    return { rows: actualRows, hasMore };
  } catch (error) {
    console.error("Error fetching SE_INV_D list:", error);
    throw error;
  }
}
async function updateInvoiceDate(factory_code, ac_no, invoice_id, user_code) {
  try {
    const sql = `
      UPDATE "Customs".se_inv_m m
      SET
        invoice_date = (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = m.factory_code
            AND ac_no = m.ac_no
        ),
        last_user = :last_user,
        last_date = NOW()
      WHERE factory_code = :factory_code
        AND ac_no        = :ac_no
        AND invoice_id   = :invoice_id
        AND status       = 1
        AND EXISTS (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = m.factory_code
            AND ac_no = m.ac_no
        )
    `;

    await pool.query(sql, {
      replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
      type: pool.QueryTypes.UPDATE,
    });

    const result = await pool.query(
      `SELECT invoice_date
       FROM "Customs".se_inv_m
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no
         AND invoice_id = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      message: "Invoice date synced successfully",
    };
  } catch (error) {
    console.error("Error syncing invoice date:", error);
    throw error;
  }
}
async function updateHsCode(factory_code, ac_no, invoice_id, user_code) {
  try {
    // Lấy danh sách AC_PROD từ các bảng join
    const result = await pool.query(
      `SELECT DISTINCT c.customs_shoe_id
       FROM "Customs".ac_plan_ord a
       JOIN "pac".sd_ord_m_c b
         ON a.factory_code = b.org_id
        AND a.se_id = b.se_id
        AND a.se_seq = b.se_seq::TEXT
       JOIN "Customs".ac_shoe_ref d
         ON d.factory_code = b.org_id
        AND d.prod_no = b.prod_no
       JOIN "Customs".ac_shoe_m c
         ON c.factory_code = d.factory_code
        AND c.customs_shoe_id = d.customs_shoe_id
       WHERE c.status <> 0
         AND a.factory_code = :factory_code
         AND a.ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    // Ghép ac_prod lại giống Oracle LOOP, tổng <= 200 ký tự
    let v = null;
    for (const row of result) {
      const prod = row.ac_prod;
      if (!v) {
        v = prod;
      } else {
        if ((v + "/" + prod).length <= 200) {
          v = v + "/" + prod;
        }
      }
    }

    const hs_code = v ? `"W" ${v}` : null;

    // Update hs_code vào SE_INV_M
    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET hs_code   = :hs_code,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id
         AND status       = 1`,
      {
        replacements: {
          factory_code,
          ac_no,
          invoice_id,
          hs_code,
          last_user: user_code,
        },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return {
      success: true,
      message: "HS Code fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching HS Code:", error);
    throw error;
  }
}
function checkPermission(permission, tableAlias = "a") {
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
async function getByID(factory_code, ac_no, invoice_id) {
  const acImp = await SE_INV_M.findOne({
    where: {
      factory_code: factory_code,
      ac_no: ac_no,
      invoice_id: invoice_id,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function getPosition(pageSize, t, permission = {}) {
  try {
    const { whereClause, replacements: permReplacements } =
      checkPermission(permission);

    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT 
          a.invoice_id,
          a.invoice_no,
          ROW_NUMBER() OVER (ORDER BY a.invoice_id, a.invoice_no) - 1 as position
        FROM "Customs".se_inv_m a
        LEFT JOIN "Customs".SE_PAY v 
          ON a.trade = v.pay_no 
          ${whereClause}
      )
      SELECT position
      FROM ranked
      `,
      {
        replacements: {
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
  seShipingM,
  pageSize,
  t,
) {
  try {
    const addItemM = await SE_INV_M.create(seShipingM, {
      transaction: t,
    });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(pageSize, t, permission);
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
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(pageSize, t, permission);
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
    const charset = { vi: "S", zh: "T", en: "E" };

    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      invoice_id: filters.invoice_id || null,
      inv_no_s: filters.inv_no_s || null,
      inv_no_e: filters.inv_no_e || null,
      ac_no: filters.ac_no || null,
      inv_date_s: filters.inv_date_s || null,
      inv_date_e: filters.inv_date_e || null,
      status: filters.status ?? null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

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
       a.factory_code,
        a.invoice_id,
        a.invoice_no,
        a.ac_no,
        a.invoice_date,
        a.fcr_date,
        a.cdc_no,
        a.cdc_date,
        a.hs_code,
        a.sailing_date,
        a.per,
        a.exp_port,
        "Customs".gf_code_name(a.factory_code, '2111', a.exp_port, :p_charset) AS exp_name,
        a.dest_port,
        "Customs".gf_code_name(a.factory_code, '2111', a.dest_port, :p_charset) AS dest_name,
        a.sort,
        "Customs".gf_code_name(a.factory_code, '5008', a.sort, :p_charset) AS sort_name,
        a.nw,
        a.gw,
        a.submission_date,
        a.shipment_no,
        a.via,
        a.trade,
        CASE :p_charset
          WHEN 'T' THEN b.name_t
          WHEN 'S' THEN b.name_s
          ELSE b.name_e
        END AS trade_name,
        a.payment,
        "Customs".gf_code_name(a.factory_code, '5001', a.payment, :p_charset) AS payment_name,
        a.bank_name,
        a.account_addr,
        a.goods_desc,
        a.status,
        CASE a.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name
      FROM "Customs".se_inv_m a
      LEFT JOIN "Customs".se_pay b ON a.trade = b.pay_no
      WHERE a.factory_code = :factory_code
        AND ${permissionCondition}
        AND (:invoice_id IS NULL OR a.invoice_id ILIKE '%' || :invoice_id || '%')
        AND (:inv_no_s   IS NULL OR a.invoice_no >= :inv_no_s)
        AND (:inv_no_e   IS NULL OR a.invoice_no <= :inv_no_e)
        AND (:ac_no      IS NULL OR a.ac_no = :ac_no)
        AND (:inv_date_s IS NULL OR DATE_TRUNC('day', a.invoice_date) >= DATE_TRUNC('day', :inv_date_s::timestamp))
        AND (:inv_date_e IS NULL OR DATE_TRUNC('day', a.invoice_date) <= DATE_TRUNC('day', :inv_date_e::timestamp))
        AND (:status     IS NULL OR a.status = :status)
      ORDER BY a.invoice_id, a.invoice_no
      LIMIT  :limit
      OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM "Customs".se_inv_m a
      LEFT JOIN "Customs".se_pay b ON a.trade = b.pay_no
      WHERE a.factory_code = :factory_code
        AND ${permissionCondition}
        AND (:invoice_id IS NULL OR a.invoice_id ILIKE '%' || :invoice_id || '%')
        AND (:inv_no_s   IS NULL OR a.invoice_no >= :inv_no_s)
        AND (:inv_no_e   IS NULL OR a.invoice_no <= :inv_no_e)
        AND (:ac_no      IS NULL OR a.ac_no = :ac_no)
        AND (:inv_date_s IS NULL OR DATE_TRUNC('day', a.invoice_date) >= DATE_TRUNC('day', :inv_date_s::timestamp))
        AND (:inv_date_e IS NULL OR DATE_TRUNC('day', a.invoice_date) <= DATE_TRUNC('day', :inv_date_e::timestamp))
        AND (:status     IS NULL OR a.status = :status)
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total) || 0;
    const hasMore = rows.length === parseInt(limit);
    return { rows, count: total, hasMore };
  } catch (error) {
    console.error("Error searching SE_INV_M:", error);
    throw error;
  }
}
module.exports = {
  fetchListOfSeInvD,
  getByID,
  updateInvoiceDate,
  updateHsCode,
  add,
  edit,
  deleteImp,
  search,
};
