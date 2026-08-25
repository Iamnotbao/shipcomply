const SE_PAY = require("./paking_list_d.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function listAllPakingListD(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  org_id,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  limit,
  offset,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      org_id: org_id || null,
      se_id: se_id || null,
      se_ver: parseFloat(se_ver) || null,
      se_seq: se_seq || null,
      pack_gu: parseFloat(pack_gu) || null,
      ship_seq: parseFloat(ship_seq) || null,
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.org_id = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.org_id = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
          *
      FROM "Customs".paking_list_d a
      WHERE a.org_id = :factory_code
        AND ${permissionCondition}
        AND (:org_id    IS NULL OR a.org_id    = :org_id)
        AND (:se_id     IS NULL OR a.se_id     = :se_id)
        AND (:se_ver    IS NULL OR a.se_ver    = :se_ver)
        AND (:se_seq    IS NULL OR a.se_seq    = :se_seq)
        AND (:pack_gu   IS NULL OR a.pack_gu   = :pack_gu)
        AND (:ship_seq  IS NULL OR a.ship_seq  = :ship_seq)
      ORDER BY a.pk_seq, a.size_seq
      LIMIT  :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    return { rows: actualRows, hasMore };
  } catch (error) {
    console.error("Error fetching PAKING_LIST_D:", error);
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
async function getByID(factory_code, pay_no) {
  const acBomM = await SE_PAY.findOne({
    where: {
      factory_code: factory_code,
      pay_no: pay_no,
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
  const addItem = await SE_PAY.create(acBomM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      pay_no: addItem.pay_no,
    },
    pageSize,
    SE_PAY,
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
        pay_no: editItem.pay_no,
      },
      pageSize,
      SE_PAY,
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
      inv_invoice: filters.invoice_no || null,
      packing_seid: filters.packing_seid || null,
      se_seq: filters.se_seq || null,
      pack_gu: filters.pack_gu || null,
      ship_seq: filters.ship_seq || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.org_id = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.org_id = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
       a.org_id,
        a.se_id,
         a.se_ver,
        a.se_seq,
        a.pack_gu,
        a.ship_seq,
        a.invoice_no,
        a.transportation,
        a.cust_no,
        a.cust_on,
        a.po_no,
        a.art_no,
        a.art_name,
        a.made_out,
        a.made_to,
        a.fcr_date,
        a.hs_code,
        a.com_name,
        a.com_add
      FROM "Customs".paking_list_m a
      WHERE a.org_id = :factory_code
        AND ${permissionCondition}
        AND (
          :inv_invoice IS NULL
          OR (a.se_id, a.se_seq) IN (
            SELECT y.ori_se_id, x.se_seq
            FROM "Customs".ac_plan_ord x
            JOIN "Customs".se_ord_m_c y ON x.factory_code = y.factory_code AND x.se_id = y.se_id
            JOIN "Customs".se_inv_m z   ON x.factory_code = z.factory_code AND x.ac_no = z.ac_no
            WHERE z.factory_code = :factory_code
              AND z.invoice_no = :inv_invoice
          )
        )
        AND (:packing_seid IS NULL OR a.se_id ILIKE :packing_seid || '%')
        AND (:se_seq       IS NULL OR a.se_seq   = :se_seq)
        AND (:pack_gu      IS NULL OR a.pack_gu  = :pack_gu)
        AND (:ship_seq     IS NULL OR a.ship_seq = :ship_seq)
      ORDER BY a.se_id, a.se_ver, a.se_seq, a.pack_gu, a.ship_seq
      LIMIT  :limit
      OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM "Customs".paking_list_m a
      WHERE a.org_id = :factory_code
        AND ${permissionCondition}
        AND (
          :inv_invoice IS NULL
          OR (a.se_id, a.se_seq) IN (
            SELECT y.ori_se_id, x.se_seq
            FROM "Customs".ac_plan_ord x
            JOIN "pac".sd_ord_m_c y ON x.factory_code = y.factory_code AND x.se_id = y.se_id
            JOIN "Customs".se_inv_m z   ON x.factory_code = z.factory_code AND x.ac_no = z.ac_no
            WHERE z.factory_code = :factory_code
              AND z.invoice_no = :inv_invoice
          )
        )
        AND (:packing_seid IS NULL OR a.se_id ILIKE :packing_seid || '%')
        AND (:se_seq       IS NULL OR a.se_seq   = :se_seq)
        AND (:pack_gu      IS NULL OR a.pack_gu  = :pack_gu)
        AND (:ship_seq     IS NULL OR a.ship_seq = :ship_seq)
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
    console.error("Error searching PAKING_LIST_M:", error);
    throw error;
  }
}
module.exports = {
  listAllPakingListD,
  getByID,
  add,
  edit,
  deleteABM,
  search,
};
