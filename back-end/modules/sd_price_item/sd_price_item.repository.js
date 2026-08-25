const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_SHIPING_D = require("./sd_price_item.model.js");
const SE_SHIPING_M = require("../se_shiping_m/se_shiping_m.model.js");
const { Op, literal, where } = require("sequelize");
const SE_SHIPPING_D = require("./sd_price_item.model.js");

async function listAllSPI(
  factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  se_ver,
  se_seq,
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
      org_id: factory_code || null,
      se_id: se_id || null,
      se_ver: se_ver || null,
      se_seq: se_seq || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
    };
    // Permission logic
    let permissionCondition = "1=1";
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.org_id = :permission_org";
        replacements.permission_org = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.org_id = :permission_org";
        replacements.permission_dept = department_code;
        replacements.permission_org = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT 
      a.org_id,
      a.se_ver,
      a.se_id,
        a.se_seq,
        b.prod_no,
        CASE :p_charset
        WHEN 'E' THEN NAME_E
        WHEN 'T' THEN NAME_T
        WHEN 'S' THEN NAME_S
       END AS p_charset,
       "Customs".GF_AC_PRODNAME(B.ORG_ID,B.PROD_NO,:p_charset) as PRODNM,
        b.nst,
        b.nlt,
        b.se_qty,
        "Customs".GF_CODE_NAME(a.org_id, '1105', a.curr_no, :p_charset) AS curr_name,
        a.std_price,
        a.adj_price,
        a.se_price,
        a.se_money,
        a.last_user,
        "Customs".GF_EMPNM(a.last_user, :p_charset) AS last_usernm,
        a.last_date,
        a.grt_dept,
        "Customs".GF_DEPTNM(a.org_id, a.grt_dept, :p_charset) AS grt_deptnm,
        a.grt_user,
        "Customs".GF_EMPNM(a.grt_user, :p_charset) AS grt_usernm,
        a.status 
      FROM "pac".SD_PRICE_ITEM a
      INNER JOIN "pac".SD_ORD_M b 
        ON a.org_id = b.org_id 
        AND a.se_id = b.se_id 
        AND a.se_ver = b.se_ver 
        AND a.se_seq = b.se_seq
      INNER JOIN "public".mm_item c
      ON b.prod_no = c.item_no
      WHERE 
       ${permissionCondition}
        AND a.se_id = :se_id
        AND a.se_ver = :se_ver
        AND a.se_seq = :se_seq
      LIMIT :limit 
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return { rows: actualRows, hasMore: hasMore, count: null };
  } catch (error) {
    console.error("Error fetching SD_PRICE_ITEM details:", error);
    throw error;
  }
}
async function listOfSPIForInvM(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  language,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };

    const replacements = {
      factory_code: factory_code || null,
      ac_no: ac_no || null,
      invoice_id: invoice_id || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };
    let permissionCondition = "1=1";
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
      DISTINCT ON (a.org_id, a.se_id, a.se_seq, a.se_ver)
      a.org_id as factory_code,
        a.se_id,
        a.se_seq,
        a.se_ver,
        b.prod_no,
        a.curr_no,
        "Customs".gf_code_name(:factory_code, '1105', a.curr_no, :p_charset) AS curr_name,
        a.adj_price,
        (
          SELECT SUM(COALESCE(x.ctns * x.ctn_pairs, 0))
          FROM "Customs".se_inv_d x
          JOIN "pac".sd_ord_m_c y
            ON x.factory_code = y.org_id
           AND x.se_id        = y.ori_se_id
           AND x.se_seq       = y.se_seq::TEXT
           AND x.pack_gu      = y.pack_gu
          WHERE x.factory_code = :factory_code
            AND x.ac_no        = :ac_no
            AND x.invoice_id   = :invoice_id
            AND x.se_seq       = a.se_seq::TEXT
            AND y.ori_se_id    = a.se_id
        ) AS se_qty,
        a.adj_price * (
          SELECT SUM(COALESCE(x.ctns * x.ctn_pairs, 0))
          FROM "Customs".se_inv_d x
          JOIN "pac".sd_ord_m_c y
            ON x.factory_code = y.org_id
           AND x.se_id        = y.ori_se_id
           AND x.se_seq       = y.se_seq::TEXT
           AND x.pack_gu      = y.pack_gu
          WHERE x.factory_code = :factory_code
            AND x.ac_no        = :ac_no
            AND x.invoice_id   = :invoice_id
            AND x.se_seq       = a.se_seq::TEXT
            AND y.ori_se_id    = a.se_id
        ) AS se_money,
        (
          SELECT ROUND(SUM(COALESCE(x.net_weight, 0)), 2)
          FROM "Customs".se_inv_d x
          JOIN "pac".sd_ord_m_c y
            ON x.factory_code = y.org_id
           AND x.se_id        = y.ori_se_id
           AND x.se_seq       = y.se_seq::TEXT
           AND x.pack_gu      = y.pack_gu
          WHERE x.factory_code = :factory_code
            AND x.ac_no        = :ac_no
            AND x.invoice_id   = :invoice_id
            AND x.se_seq       = a.se_seq::TEXT
            AND y.ori_se_id    = a.se_id
        ) AS total_nw,
        (
          SELECT SUM(COALESCE(x.ctns, 0))
          FROM "Customs".se_inv_d x
          JOIN "pac".sd_ord_m_c y
            ON x.factory_code = y.org_id
           AND x.se_id        = y.ori_se_id
           AND x.se_seq       = y.se_seq::TEXT
           AND x.pack_gu      = y.pack_gu
          WHERE x.factory_code = :factory_code
            AND x.ac_no        = :ac_no
            AND x.invoice_id   = :invoice_id
            AND x.se_seq       = a.se_seq::TEXT
            AND y.ori_se_id    = a.se_id
        ) AS total_ctns,
        (
          SELECT ROUND(SUM(COALESCE(x.gross_weight, 0)), 2)
          FROM "Customs".se_inv_d x
          JOIN "pac".sd_ord_m_c y
            ON x.factory_code = y.org_id
           AND x.se_id        = y.ori_se_id
           AND x.se_seq       = y.se_seq::TEXT
           AND x.pack_gu      = y.pack_gu
          WHERE x.factory_code = :factory_code
            AND x.ac_no        = :ac_no
            AND x.invoice_id   = :invoice_id
            AND x.se_seq       = a.se_seq::TEXT
            AND y.ori_se_id    = a.se_id
        ) AS total_gw
      FROM "pac".sd_price_item a
      JOIN "pac".sd_ord_m_c b
        ON a.org_id = b.org_id
       AND a.se_id        = b.ori_se_id
       AND a.se_seq       = b.se_seq
      JOIN "Customs".ac_plan_ord c
        ON b.org_id = c.factory_code
       AND b.se_id  = c.se_id
       AND b.se_seq = c.se_seq::NUMERIC
      WHERE c.factory_code = :factory_code
        AND c.ac_no        = :ac_no
        AND ${permissionCondition}
      ORDER BY a.org_id, a.se_id, a.se_seq, a.se_ver
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
    console.error("Error fetching SE_INV detail:", error);
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
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      orderClause.push([field, "ASC"]);
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        cust_id: keys.cust_id,
        si_seq: keys.si_seq,
        // ...permission,
      },
      attributes: Object.keys(keys),
      order: orderClause,
      raw: true,
      transaction: t,
    });
    const position = allRecords.findIndex((r) =>
      Object.keys(keys).every((key) => r[key] === keys[key]),
    );
    if (position === -1) {
      return {
        position: 0,
        size: parseInt(pageSize) || 10,
        page: 0,
        offset: 0,
      };
    }
    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;
    return { position, size, page, offset };
  } catch (error) {
    console.error(" Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function listAllWithCust({
  factory_code,
  cust_id,
  s_date_1,
  e_date_1,
  status,
  department_code,
  user_code,
  query_level,
} = {}) {
  const whereClause = {};
  // if (query_level === "1" && factory_code) {
  //   whereClause.factory_code = factory_code;
  // } else if (query_level === "2" && department_code) {
  //   whereClause.grt_dept = department_code;
  //   whereClause.factory_code = factory_code;
  // } else if (query_level === "3" && user_code) {
  //   whereClause.grt_user = user_code;
  // }
  const whereMasterClause = {};

  // Text fields dùng LIKE
  if (factory_code) {
    whereMasterClause.factory_code = {
      [Op.like]: `%${factory_code}%`,
    };
  }

  if (cust_id) {
    whereMasterClause.cust_id = {
      [Op.like]: `%${cust_id}%`,
    };
  }

  // Number field dùng exact match
  if (status) {
    whereMasterClause.status = status;
  }

  // Range cho start_date
  if (s_date_1 && e_date_1) {
    whereMasterClause.start_date = {
      [Op.between]: [s_date_1, e_date_1],
    };
  } else if (s_date_1) {
    whereMasterClause.start_date = {
      [Op.gte]: s_date_1,
    };
  } else if (e_date_1) {
    whereMasterClause.start_date = {
      [Op.lte]: e_date_1,
    };
  }

  return await SE_SHIPING_D.findAll({
    where: whereClause,
    include: [
      {
        model: SE_SHIPING_M,
        as: "SSM",
        attributes: ["start_date", "end_date", "cust_id", "si_seq", "status"],
        where:
          Object.keys(whereMasterClause).length > 0
            ? whereMasterClause
            : undefined,
        required: Object.keys(whereMasterClause).length > 0,
        on: {
          [Op.and]: [
            literal('"SE_SHIPING_D"."factory_code" = "SSM"."factory_code"'),
            literal('"SE_SHIPING_D"."cust_id" = "SSM"."cust_id"'),
            literal('"SE_SHIPING_D"."si_seq" = "SSM"."si_seq"'),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [
      ["factory_code", "ASC"],
      ["cust_id", "ASC"],
      ["si_seq", "ASC"],
    ],
  });
}
async function getByID(factory_code, cust_id, si_seq, si_type) {
  const acImp = await SE_SHIPING_D.findOne({
    where: {
      factory_code: factory_code,
      cust_id: cust_id,
      si_seq: si_seq,
      si_type: si_type,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}

async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "si_seq") {
        orderClause.push(["si_seq", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        inm_no: keys.inm_no,
        ...permission,
      },
      attributes: Object.keys(keys),
      order: orderClause,
      raw: true,
      transaction: t,
    });
    const position = allRecords.findIndex((r) =>
      Object.keys(keys).every((key) => r[key] === keys[key]),
    );
    if (position === -1) {
      return {
        position: 0,
        size: parseInt(pageSize) || 10,
        page: 0,
        offset: 0,
      };
    }
    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;
    return { position, size, page, offset };
  } catch (error) {
    console.error(" Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  seShippingD,
  pageSize,
  t,
) {
  try {
    const addItem = await SE_SHIPING_D.create(seShippingD, {
      transaction: t,
    });
    // const permission = await checkPermission(
    //   factory_code,
    //   department_code,
    //   user_code,
    //   query_level,
    // );
    const positionInfo = await getPosition(
      {
        factory_code: addItem.factory_code,
        cust_id: addItem.cust_id,
        si_seq: addItem.si_seq,
        si_type: addItem.si_type,
      },
      pageSize,
      SE_SHIPPING_D,
      ["factory_code", "cust_id", "si_seq", "si_type"],
      t,
      // permission,
    );
    return {
      data: addItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add SE_SHIPPING_D from db", error);
    throw error;
  }
}

async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existSeShippingD,
  editSeShippingD,
  pageSize,
  t,
) {
  try {
    const editItem = await existSeShippingD.update(editSeShippingD, {
      transaction: t,
    });
    // const permission = await checkPermission(
    //   factory_code,
    //   department_code,
    //   user_code,
    //   query_level,
    // );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        cust_id: editItem.cust_id,
        si_seq: editItem.si_seq,
        si_type: editItem.si_type,
      },
      pageSize,
      SE_SHIPPING_D,
      ["factory_code", "cust_id", "si_seq", "si_type"],
      t,
      // permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit SE_SHIPPING_D from db", error);
    throw error;
  }
}
async function updateStatus(
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await SE_SHIPING_D.findAll({
      order: [
        ["factory_code", "ASC"],
        ["inm_no", "ASC"],
        ["seq", "ASC"],
      ],
    });
  }
  const whereClause = {};
  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }
  if (data && data.length > 0) {
    const itemFounds = data.map((item) => item.seq);

    return await SE_SHIPING_D.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          inm_no: inm_no,
          status: 1,
          item_no: {
            [Op.in]: itemFounds,
          },
        },
      },
    );
  }
  return await SE_SHIPING_D.update(
    { status: 7 },
    {
      where: {
        ...whereClause,
        inm_no: inm_no,
        status: 1,
      },
    },
  );
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
  filters = {},
  limit,
  offset,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      inm_no: filters.inm_no || "",
      req_no: filters.req_no || null,
      commno: filters.commno || null,
      status: filters.status ?? null,
      s_issuedate: filters.s_issued_date || null,
      e_issuedate: filters.e_issued_date || null,
      s_expiredate: filters.s_expire_date || null,
      e_expiredate: filters.e_expire_date || null,
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
        factory_code,
        inm_no, 
        seq,
        issued_date, 
        expire_date, 
        req_no, 
        commno, 
        note, 
        status
      FROM "Customs".SE_SHIPING_D 
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        inm_no LIKE :inm_no || '%' AND
        (:status IS NULL OR status = :status) AND
        (:s_issuedate IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::date)) AND
        (:e_issuedate IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::date)) AND
        (:s_expiredate IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::date)) AND
        (:e_expiredate IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::date))
      ORDER BY seq,inm_no
      limit :limit 
      offset :offset

    `;
    const countSql = `
      SELECT COUNT(*) FROM "Customs".SE_SHIPING_D 
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        inm_no LIKE :inm_no || '%' AND
        (:status IS NULL OR status = :status) AND
        (:s_issuedate IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::date)) AND
        (:e_issuedate IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::date)) AND
        (:s_expiredate IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::date)) AND
        (:e_expiredate IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::date))
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      try {
        total = countResult[0].total || 0;
      } catch (countError) {
        total = 0;
      }
    }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error searching SE_SHIPING_D:", error);
    throw error;
  }
}
module.exports = {
  listAllSPI,
  listAllWithCust,
  listOfSPIForInvM,
  getByID,
  updateStatus,
  add,
  edit,
  deleteImp,
  search,
};
