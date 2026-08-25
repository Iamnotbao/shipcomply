const QueryHelper = require("../../utils/queryHelper.js");
const AC_ITEM_M = require("./ac_item_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const { Op } = require("sequelize");

async function listAllIM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_ITEM_M.findAll({
      order: [["item_acno", "ASC"]],
    });
  }
  console.log(
    "all things",
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  let whereClause = {};
  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }
  const rows = await AC_ITEM_M.findAll({
    where: whereClause,
    order: [["item_acno", "ASC"]],
    limit: limit + 1,
    offset: offset,
    logging: console.log,
  });
  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;
  console.log("all in rows", whereClause);

  let total = null;

  return {
    rows: actualRows,
    count: total,
    hasMore: hasMore,
  };
}

async function getByID(factory_code, item_acno) {
  const acImp = await AC_ITEM_M.findOne({
    where: {
      factory_code: factory_code,
      item_acno: item_acno,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No ac_item_m found!");
    return null;
  }
  return acImp;
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
async function getAllACIMByIA(item_acno) {
  return await AC_ITEM_M.findAll({
    where: {
      item_acno: item_acno,
    },
  });
}
async function fetchGroupFieldDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_itemno,
  language,
  page,
  limit,
  search = "",
  isStatus = true,
) {
  const chartset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    ac_itemno: ac_itemno,
    language: chartset[language] || "E",
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
    searchCondition = `AND (ac_item ILIKE :search OR item_acno ILIKE :search)`;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  const sql = `
       SELECT ac_item,item_acno,"Customs".gf_ac_itemname(:factory_code,item_acno,:language) AS itemnm
        FROM "Customs".ac_item_m 
        WHERE ${permissionCondition}
        ${statusCondition}
        ${searchCondition}
        AND item_acno = :ac_itemno 
        GROUP BY ac_item,item_acno
      `;
  const countSql = `
     SELECT COUNT(*) as total
     FROM "Customs".ac_item_m 
        WHERE ${permissionCondition}
           ${statusCondition}
            ${searchCondition}
        AND item_acno = :ac_itemno 
        GROUP BY ac_item,item_acno

`;
  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in unit list by good codes:", error);
    throw error;
  }
}
async function fetchFieldWithFunction(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_itemno,
  type = "1",
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    ac_itemno: ac_itemno,
  };

  let sql;
  if (field === "tax_rate") {
    sql = `
     SELECT "Customs".gf_ac_itemtax_per(:factory_code, :ac_itemno) as tax_rate
     WHERE ${permissionCondition}
      `;
  } else if (field === "unit" && type === "1") {
    sql = `
     SELECT "Customs".gf_ac_itemunit(:factory_code, :ac_itemno) as unit 
      WHERE ${permissionCondition}
      `;
  } else if (field === "shoe_id") {
    sql = `SELECT "Customs".gf_ac_itemunit(:factory_code, :ac_itemno) as shoe_id`;
  } else {
    sql = `SELECT "Customs".gf_ac_itemunit(:factory_code, :ac_itemno) as unit`;
  }
  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return rows[0];
  } catch (error) {
    console.error("Error in unit list by good codes:", error);
    throw error;
  }
}
async function getPosition(item_acno, pageSize, t, permission) {
  try {
    console.log("apss", permission);

    const position = await AC_ITEM_M.count({
      where: {
        item_acno: {
          [Op.lt]: item_acno,
        },
        ...permission,
      },
      logging: console.log,
      transaction: t,
    });

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
  user_code,
  department_code,
  query_level,
  acIM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_ITEM_M.create(acIM, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItemM.item_acno,
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
  user_code,
  department_code,
  query_level,
  existAcIM,
  editAcIM,
  pageSize,
  t,
) {
  try {
    const editAIM = await existAcIM.update(editAcIM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      user_code,
      department_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editAIM.item_acno,
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

async function deleteIM(existAcIM, t) {
  try {
    const deleteIM = await existAcIM.destroy({ transaction: t });
    return deleteIM;
  } catch (error) {
    console.log("Cannot delete ac item m from db", error);
    throw error;
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
      AC_ITEM_M: ["item_acno", "item_acname", "ac_item", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_ITEM_M || {};
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
    const rows = await AC_ITEM_M.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["item_acno", "ASC"]],
      limit: limit,
      offset: offset,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_ITEM_M.count({
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
  listAllIM,
  getAllACIMByIA,
  fetchGroupFieldDropdown,
  fetchFieldWithFunction,
  getByID,
  add,
  edit,
  deleteIM,
  search,
  getPosition,
};
