const QueryHelper = require("../../utils/queryHelper.js");
const fs = require("fs");
const AC_PLAN_PACK = require("./ac_plan_pack.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function getListOfAcPlanPack(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
  ac_no,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
) {
  try {
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
      ac_no: ac_no || null,
      se_id: se_id || null,
      se_seq: se_seq || null,
      se_ver: se_ver || null,
      pack_gu: pack_gu || null,
      ship_seq: ship_seq || null,
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

    const sql = `
     SELECT FACTORY_CODE,
     AC_NO,
     SE_ID,
    SE_VER,
    SE_SEQ,
    PACK_GU,
    SHIP_SEQ,
    PK_SEQ, SIZERUN, CTNS_PAIRS, CTNS, PAIRS
    FROM "Customs".AC_PLAN_PACK t 
    where FACTORY_CODE= :factory_code
    AND AC_NO = :ac_no 
    AND SE_ID = :se_id
    AND SE_SEQ = :se_seq 
    AND SE_VER = :se_ver
    AND PACK_GU = :pack_gu
    AND SHIP_SEQ = :ship_seq
    AND ${permissionCondition}
    ORDER BY SE_ID
    LIMIT :limit OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return {
      rows: actualRows,
      count: null,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error fetching AC_PLAN_PACK:", error);
    throw error;
  }
}
async function fetchHsCode(factory_code, ac_no, invoice_id, user_code) {
  try {
    // Lấy danh sách AC_PROD từ các bảng join
    const result = await pool.query(
      `SELECT DISTINCT c.customs_tariff
       FROM "Customs".ac_plan_ord a
       JOIN "pac".sd_ord_m_c b
         ON a.factory_code = b.org_id
        AND a.se_id = b.se_id
        AND a.se_seq = b.se_seq
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
      hs_code,
      message: "HS Code fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching HS Code:", error);
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
  const acBomM = await AC_PLAN_PACK.findOne({
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
  const addItem = await AC_PLAN_PACK.create(acBomM, { transaction: t });
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
    AC_PLAN_PACK,
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
      AC_PLAN_PACK,
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
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      AC_PLAN_PACK: ["prod_acno", "item_acno", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_PLAN_PACK || {};
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        whereClause.factory_code = factory_code;
      } else if (query_level === "2" && department_code) {
        whereClause.grt_dept = department_code;
        whereClause.factory_code = factory_code;
      } else if (query_level === "3" && user_code) {
        whereClause.grt_user = user_code;
      }
    }
    const rows = await AC_PLAN_PACK.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [
        ["factory_code", "ASC"],
        ["prod_acno", "ASC"],
        ["item_acno", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_PLAN_PACK.count({
        where: whereClause,
      });
    }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  getListOfAcPlanPack,
  getByID,
  add,
  edit,
  deleteABM,
  search,
  fetchHsCode,
};
