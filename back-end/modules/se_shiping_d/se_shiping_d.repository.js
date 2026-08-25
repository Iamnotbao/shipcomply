const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const SE_SHIPING_D = require("./se_shiping_d.model.js");
const SE_SHIPING_M = require("../se_shiping_m/se_shiping_m.model.js");
const { Op, literal, where } = require("sequelize");
const SE_SHIPPING_D = require("./se_shiping_d.model.js");

async function listAllSeShippingD(
  factory_code,
  cust_id,
  si_seq,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      cust_id: cust_id || null,
      si_seq: si_seq || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
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
        cust_id,
        si_seq,
        si_type,
        CASE si_type
          WHEN '1' THEN '1-SEA'
          WHEN '2' THEN '2-AIR'
          WHEN '3' THEN '3-SEA-AIR'
          WHEN '4' THEN '4-RAIL'
          ELSE si_type
        END AS si_type_name,
        bl_adress,
        nb_adress,
        two_nb,
        co,
        agent,
        "Customs".GF_CODE_NAME(factory_code, 'AGENT', agent, :p_charset) AS ag_name,
        col1,
        "Customs".GF_CODE_NAME(factory_code, 'CHGCY', col1, :p_charset) AS countrynm,
        p_adress,
        "Customs".GF_CODE_NAME(factory_code, 'SHIPDEST', p_adress, :p_charset) AS ad_name,
        remark,
       status,
       locked_information,
        grt_dept,
        "Customs".GF_DEPTNM(factory_code, grt_dept, :p_charset) AS grt_deptname,
        grt_user,
        "Customs".GF_EMPNM(grt_user, :p_charset) AS grt_username,
       grt_date,
        last_user,
        "Customs".GF_EMPNM(last_user, :p_charset) AS last_username,
       last_date
      FROM "Customs".SE_SHIPING_D
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        cust_id = :cust_id AND
        si_seq = :si_seq
      ORDER BY si_seq,si_type
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error listing SE_SHIPPING_D:", error);
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
  listAllSeShippingD,
  listAllWithCust,
  getByID,
  updateStatus,
  add,
  edit,
  deleteImp,
  search,
};
