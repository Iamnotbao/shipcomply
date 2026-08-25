const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_INV_M = require("./se_inv_m.model.js");

async function ListOfSeInvM(
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
        a.grt_date,
        a.grt_user,
        a.grt_dept,
        a.last_user,
        a.last_date,
        a.locked_information,
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
      ORDER BY a.invoice_id, a.invoice_no
      LIMIT :limit
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
    console.error("Error fetching SE_INV_M list:", error);
    throw error;
  }
}

async function fetchInvoiceDropdown(factory_code, page, limit, search) {
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
        invoice_no ILIKE :search OR
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  const sql = `
      SELECT DISTINCT invoice_no
      FROM "Customs".SE_INV_M
      WHERE factory_code = :factory_code
      AND ${permissionCondition} 
      ${searchCondition}
      ORDER BY invoice_no
    `;
  const countSql = `
         SELECT COUNT(DISTINCT invoice_no) AS total
         FROM "Customs".SE_INV_M
        WHERE 
        factory_code = :factory_code
        AND ${permissionCondition} 
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
async function getPackingSeidByInvoice(factory_code, invoice_no) {
  try {
    const sql = `
  SELECT COUNT(*) AS n, MIN(sub.ori_se_id) AS packing_seid
  FROM (
    SELECT DISTINCT sd.ori_se_id
    FROM "Customs".ac_plan_ord ac
    JOIN "pac".sd_ord_m_c sd
      ON ac.factory_code = sd.org_id
     AND ac.se_id        = sd.se_id
    JOIN "Customs".se_inv_m inv
      ON ac.factory_code = inv.factory_code
     AND ac.ac_no        = inv.ac_no
    WHERE inv.factory_code = :factory_code
      AND inv.invoice_no   = :invoice_no
  ) sub
`;
    const result = await pool.query(sql, {
      replacements: { factory_code, invoice_no },
      type: pool.QueryTypes.SELECT,
    });

    let packing_seid = result[0]?.packing_seid || "";
    const n = parseInt(result[0]?.n) || 0;

    // N > 1 → lấy 4 ký tự đầu của invoice_no (giống IF N>1 trong Oracle)
    if (n > 1) {
      packing_seid = invoice_no.substring(0, 4);
    }
    return packing_seid;
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
async function updateNwGw(factory_code, ac_no, invoice_id, user_code) {
  try {
    // 1. Lấy MAX pk_seq
    const seqResult = await pool.query(
      `SELECT MAX(pk_seq) AS v_seq
       FROM "Customs".se_inv_d
       WHERE factory_code = :factory_code
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );
    const v_seq = parseInt(seqResult?.[0]?.v_seq) || 0;
    if (v_seq === 0) return { success: false, message: "No data in SE_INV_D" };

    // 2. Loop AC_PLAN_ORD
    const planRows = await pool.query(
      `SELECT factory_code, se_id, se_seq, pack_gu
       FROM "Customs".ac_plan_ord
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    for (const w of planRows) {
      for (let x = 1; x <= v_seq; x++) {
        // 3. Lấy danh sách SD_PACK_D join SD_ORD_ITEM_C
        const packDRows = await pool.query(
          `SELECT m.se_id, k.prod_no, m.pk_seq, m.size_no, m.pairs,m.nw
           FROM "pac".sd_pack_d m
           JOIN "pac".sd_ord_m_c k
             ON m.org_id   = k.org_id
            AND m.se_id    = k.se_id
            AND m.se_seq   = k.se_seq
            AND m.pack_gu  = k.pack_gu
           WHERE m.org_id  = :org_id
             AND m.se_id   = :se_id
             AND m.pack_gu = :pack_gu
             AND m.se_seq  = :se_seq
             AND m.pk_seq  = :pk_seq`,
          {
            replacements: {
              org_id: w.factory_code,
              se_id: w.se_id,
              pack_gu: parseInt(w.pack_gu),
              se_seq: w.se_seq,
              pk_seq: x,
            },
            type: pool.QueryTypes.SELECT,
          },
        );

        // 4. Tính V_NWT = sum NW * pairs từ AC_CUST_SIZE
        let v_nwt = 0;
        for (const j of packDRows) {
          console.log("each row",j.nw);
          
          v_nwt += Math.round(parseFloat(j.nw) * 100) / 100;
        }

        // 5. Lấy V_GW từ SD_PACK_M join mm_item
        let v_gw = 0;
        const packMResult = await pool.query(
          `SELECT ROUND(COALESCE(b.sap_nw, 0), 2) AS v_gw
           FROM "pac".sd_pack_m a
           JOIN "public".mm_item b
             ON a.org_id   = b.org_id
            AND a.item_no  = b.item_no
           WHERE a.org_id  = :org_id
             AND a.se_id   = :se_id
             AND a.pack_gu = :pack_gu
             AND a.se_seq  = :se_seq
             AND a.pk_seq  = :pk_seq`,
          {
            replacements: {
              org_id: w.factory_code,
              se_id: w.se_id,
              pack_gu: parseInt(w.pack_gu),
              se_seq: w.se_seq,
              pk_seq: x,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_gw = parseFloat(packMResult?.[0]?.v_gw) || 0;

        // 6. Update SE_INV_D
        await pool.query(
          `UPDATE "Customs".se_inv_d
           SET net_weight   = ROUND(:v_nwt * ctns, 2),
               gross_weight = ROUND((:v_nwt + :v_gw) * ctns, 2)
           WHERE factory_code = :factory_code
             AND ac_no        = :ac_no
             AND invoice_id   = :invoice_id
             AND se_id        = :se_id
             AND se_seq       = :se_seq
             AND pk_seq       = :pk_seq`,
          {
            replacements: {
              factory_code,
              ac_no,
              invoice_id,
              se_id: w.se_id,
              se_seq: w.se_seq,
              pk_seq: x,
              v_nwt,
              v_gw,
            },
            type: pool.QueryTypes.UPDATE,
          },
        );
      }
    }

    // 7. Tính tổng NW/GW update lên SE_INV_M
    const totalResult = await pool.query(
      `SELECT ROUND(SUM(COALESCE(net_weight, 0)), 2)   AS m_nw,
              ROUND(SUM(COALESCE(gross_weight, 0)), 2) AS m_gw
       FROM "Customs".se_inv_d
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );

    const m_nw = totalResult?.[0]?.m_nw || 0;
    const m_gw = totalResult?.[0]?.m_gw || 0;

    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET nw        = :m_nw,
           gw        = :m_gw,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: {
          factory_code,
          ac_no,
          invoice_id,
          m_nw,
          m_gw,
          last_user: user_code,
        },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, m_nw, m_gw, message: "NW/GW updated successfully" };
  } catch (error) {
    console.error("Error updating NW/GW:", error);
    throw error;
  }
}
async function active(factory_code, ac_no, invoice_id, user_code) {
  try {
    const factory3xxx = [
      "3000",
      "3010",
      "3020",
      "3030",
      "3040",
      "3050",
      "3060",
      "3070",
      "3080",
      "3090",
    ];

    if (factory3xxx.includes(String(factory_code))) {
      const checkResult = await pool.query(
        `SELECT submission_date, shipment_no, hs_code, cdc_no, cdc_date
         FROM "Customs".se_inv_m
         WHERE factory_code = :factory_code
           AND ac_no        = :ac_no
           AND invoice_id   = :invoice_id`,
        {
          replacements: { factory_code, ac_no, invoice_id },
          type: pool.QueryTypes.SELECT,
        },
      );

      const row = checkResult?.[0];
      if (
        !row?.submission_date ||
        !row?.shipment_no ||
        !row?.hs_code ||
        !row?.cdc_no ||
        !row?.cdc_date
      ) {
        return {
          success: false,
          message:
            "Mark * field cannot be empty (submission_date, shipment_no, hs_code, cdc_no, cdc_date)",
        };
      }
    }

    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET status    = 7,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, message: "Invoice confirmed successfully" };
  } catch (error) {
    console.error("Error confirming SE_INV_M:", error);
    throw error;
  }
}
async function cancelActive(factory_code, ac_no, invoice_id, user_code) {
  try {
    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET status    = 1,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, message: "Invoice unconfirmed successfully" };
  } catch (error) {
    console.error("Error unconfirming SE_INV_M:", error);
    throw error;
  }
}
async function voidAll(factory_code, ac_no, invoice_id, user_code) {
  try {
    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET status    = 0,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, message: "Invoice cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling SE_INV_M:", error);
    throw error;
  }
}
async function close(factory_code, ac_no, invoice_id, user_code) {
  try {
    await pool.query(
      `UPDATE "Customs".se_inv_m
       SET status    = 9,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, message: "Invoice cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling SE_INV_M:", error);
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
async function getPosition(keys, pageSize, t, permission = {}) {
  try {
    const { whereClause, replacements: permReplacements } =
      checkPermission(permission);

    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT 
          a.invoice_id,
          a.invoice_no,
          a.ac_no,
          a.factory_code,
          ROW_NUMBER() OVER (ORDER BY a.invoice_id, a.invoice_no) - 1 as position
        FROM "Customs".se_inv_m a
        LEFT JOIN "Customs".SE_PAY v 
          ON a.trade = v.pay_no 

           ${whereClause}
      )
      SELECT position
      FROM ranked
       WHERE factory_code = :factory_code
           AND invoice_id = :invoice_id
           AND ac_no = :ac_no

      `,
      {
        replacements: {
          ...permReplacements,
          factory_code: keys.factory_code,
          invoice_id: keys.invoice_id,
          ac_no: keys.ac_no,
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
    const positionInfo = await getPosition(
      {
        invoice_id: addItemM.invoice_id,
        factory_code: addItemM.factory_code,
        ac_no: addItemM.ac_no,
      },
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
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        invoice_id: editAIM.invoice_id,
        factory_code: editAIM.factory_code,
        ac_no: editAIM.ac_no,
      },
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
      inv_date_s: filters.s_date_1 || null,
      inv_date_e: filters.e_date_1 || null,
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
  ListOfSeInvM,
  getByID,
  updateInvoiceDate,
  updateHsCode,
  updateNwGw,
  add,
  edit,
  deleteImp,
  search,
  active,
  close,
  cancelActive,
  voidAll,
  fetchInvoiceDropdown,
  getPackingSeidByInvoice,
};
