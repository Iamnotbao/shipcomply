const QueryHelper = require("../../utils/queryHelper.js");
const AC_REQ_ORDER = require("./ac_req_order.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const { literal } = require("sequelize");

async function listAllARO(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await AC_REQ_ORDER.findAll({
      order: [
        ["factory_code", "ASC"],
        ["req_no", "ASC"],
        ["req_seq", "ASC"],
      ],
    });
  }
  console.log(
    "all things",
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const whereClause = {};
  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }
  return await AC_REQ_ORDER.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["req_no", "ASC"],
      ["req_seq", "ASC"],
    ],
  });
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
async function getByID(factory_code, req_no, req_seq) {
  const acVB = await AC_REQ_ORDER.findOne({
    where: {
      factory_code: factory_code,
      req_no: req_no,
      req_seq: req_seq,
    },
    include: [FACTORY],
  });
  if (!acVB) {
    console.log("No AC_REQ_ORDER found!");
    return null;
  }
  return acVB;
}

async function getByReqNo(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  limit,
  offset,
) {
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedOffset = parseInt(offset, 10) || 0;
  const whereClause = {
    factory_code: factory_code,
    req_no: req_no,
  };
  try {
    if (query_level === "1" && factory_code) {
      whereClause.factory_code = factory_code;
    } else if (query_level === "2" && department_code) {
      whereClause.grt_dept = department_code;
      whereClause.factory_code = factory_code;
    } else if (query_level === "3" && user_code) {
      whereClause.grt_user = user_code;
    }
    const rows = await AC_REQ_ORDER.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["req_no", "ASC"],
        ["req_seq", "ASC"],
      ],
      limit: parsedLimit + 1,
      offset: parsedOffset,
    });
    const hasMore = rows.length > parsedLimit;
    const actualRows = hasMore ? rows.slice(0, parsedLimit) : rows;

    let total = null;

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("loi loi ", error);
  }
}

async function getAllById(
  factory_code,
  department_code,
  user_code,
  query_level,
  id,
  limit,
  offset,
) {
  const whereClause = {
    factory_code: factory_code,
    src_id: id,
  };
  try {
    if (query_level === "1" && factory_code) {
      whereClause.factory_code = factory_code;
    } else if (query_level === "2" && department_code) {
      whereClause.grt_dept = department_code;
      whereClause.factory_code = factory_code;
    } else if (query_level === "3" && user_code) {
      whereClause.grt_user = user_code;
    }
    const rows = await AC_REQ_ORDER.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["req_no", "ASC"],
        ["req_seq", "ASC"],
      ],
      limit: limit,
      offset: offset,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    let total = null;

    if (parseInt(offset) === 0) {
      try {
        total = await AC_REQ_ORDER.count({
          where: whereClause,
        });
      } catch (countError) {
        try {
          const sequelizeCount = await AC_REQ_ORDER.count({
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
  } catch (error) {
    console.log("loi loi ", error);
  }
}
async function getAllAcSendByCate(
  factory_code,
  category_code,
  vend_no,
  user_code,
  department_code,
  query_level,
  charset = "E",
) {
  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });

      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        category: category_code,
        vend: vend_no,
        charset: charset,
      };

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      const rows = await pool.query(
        `SELECT 
          CODE_NO,
          CASE 
            WHEN :charset = 'T' THEN name_t
            WHEN :charset = 'E' THEN name_e
            ELSE name_l
          END AS NAME 
         FROM "Customs".basic_data
         WHERE factory_code = :factory 
           AND category_code = :category 
           AND code_no NOT IN (
             SELECT AC_SEND 
             FROM AC_REQ_ORDER 
             WHERE factory_code = :factory 
               AND VEND_NO = :vend
               ${additionalWhere}
           )
         ORDER BY CODE_NO`,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );

      return rows;
    });
  } catch (error) {
    console.error("Error in getAllAcSendByCate:", error);
    throw error;
  }
}
async function getAllVendNoByStatus(
  factory_code,
  user_code,
  department_code,
  query_level,
  charset = "E",
) {
  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });

      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        charset: charset,
      };

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      const rows = await pool.query(
        `SELECT 
          vend_no,
          CASE 
            WHEN :charset = 'T' THEN shortnm_t
            WHEN :charset = 'E' THEN shortnm_e
            ELSE shortnm_s
          END AS NAME 
         FROM "po".po_vender_m
         WHERE factory_code = :factory 
           AND status = '7' 
         ORDER BY vend_no`,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );

      return rows;
    });
  } catch (error) {
    console.error("Error in getAllAcSendByCate:", error);
    throw error;
  }
}
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "req_seq") {
        orderClause.push(["req_seq", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        req_no: keys.req_no,
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
async function add(acRO, pageSize, t) {
  try {
    const addItem = await AC_REQ_ORDER.create(acRO, {
      transaction: t,
    });
    const positionInfo = await getPosition(
      {
        factory_code: addItem.factory_code,
        req_no: addItem.req_no,
        req_seq: addItem.req_seq,
      },
      pageSize,
      AC_REQ_ORDER,
      ["factory_code", "req_no", "req_seq"],
      t,
    );
    return {
      data: addItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add ac item ref from db", error);
  }
}
async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existAcRO,
  editAcRO,
  pageSize,
  t,
) {
  const editItem = await existAcRO.update(editAcRO, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: editItem.factory_code,
      req_no: editItem.req_no,
      req_seq: editItem.req_seq,
    },
    pageSize,
    AC_REQ_ORDER,
    ["factory_code", "req_no", "req_seq"],
    t,
    permission,
  );
  return {
    data: editItem,
    ...positionInfo,
  };
}
async function deleteRO(existAcVB, t) {
  try {
    const deleteVB = await existAcVB.destroy({ transaction: t });
    return deleteVB;
  } catch (error) {
    console.log("Cannot delete ac req order from db", error);
  }
}
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      AC_REQ_ORDER: ["req_no", "req_seq", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_REQ_ORDER || {};
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
    const impSearch = await AC_REQ_ORDER.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["req_seq", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllARO,
  getByReqNo,
  getAllAcSendByCate,
  getAllVendNoByStatus,
  getAllById,
  getByID,
  add,
  edit,
  deleteRO,
  search,
};
