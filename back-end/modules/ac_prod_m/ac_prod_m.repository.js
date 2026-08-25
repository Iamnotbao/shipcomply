const QueryHelper = require("../../utils/queryHelper.js");
const AC_PROD_M = require("./ac_prod_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const AC_SHOE_M = require("../ac_shoe_m/ac_shoe_m.model.js");
const pool = require("../../config/db.js");
const { Op, literal } = require("sequelize");

const getNumericSort = () => {
  return literal(`
    CASE 
      WHEN REGEXP_REPLACE(prod_acno, '[^0-9]', '', 'g') = '' THEN 0
      ELSE CAST(REGEXP_REPLACE(prod_acno, '[^0-9]', '', 'g') AS BIGINT)
    END
  `);
};
async function listAllASR(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_PROD_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["customs_shoe_id", "ASC"],
        [getNumericSort(), "ASC"],
        ["prod_acno", "ASC"],
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
  const rows = await AC_PROD_M.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["customs_shoe_id", "ASC"],
      [getNumericSort(), "ASC"],
      ["prod_acno", "ASC"],
    ],
    limit: limit + 1,
    offset: offset,
  });

  
  const hasMore = rows.length > limit;
    console.log("dobada",hasMore);
  const actualRows = hasMore ? rows.slice(0, limit) : rows;

  let total = null;

  // if (parseInt(offset) === 0) {
  //   try {
  //     total = await AC_PROD_M.count({
  //       where: whereClause,
  //     });
  //   } catch (countError) {
  //     try {
  //       const sequelizeCount = await AC_PROD_M.count({
  //         where: whereClause,
  //       });
  //       total = parseInt(sequelizeCount) || 0;
  //     } catch (fallbackError) {
  //       total = 0;
  //     }
  //   }
  // }
  return {
    rows: actualRows,
    count: total,
    hasMore: hasMore,
  };
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
async function getByID(factory_code, customs_shoe_id, prod_acno) {
  const acProdM = await AC_PROD_M.findOne({
    where: {
      factory_code: factory_code,
      customs_shoe_id: customs_shoe_id,
      prod_acno: prod_acno,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
      {
        model: AC_SHOE_M,
        as: "SHOE",
        attributes: [
          "customs_shoe_id",
          "customs_shoe_name_l",
          "customs_shoe_name_t",
          "customs_shoe_name_e",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal('"AC_PROD_M"."factory_code" = "SHOE"."factory_code"'),
            literal('"AC_PROD_M"."customs_shoe_id" = "SHOE"."customs_shoe_id"'),
          ],
        },
      },
    ],
  });
  if (!acProdM) {
    console.log("No AC_PROD_M found!");
    return null;
  }
  return acProdM;
}

async function getByShoe(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      customs_shoe_id: customs_shoe_id,
    };
    if (user_code !== "admin") {
      switch (query_level) {
        case "1":
          break;
        case "2":
          if (department_code) {
            whereClause.grt_dept = department_code;
          }
          break;
        case "3":
          if (user_code) {
            whereClause.grt_user = user_code;
          }
          break;
      }
    }
    const rows = await AC_PROD_M.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["customs_shoe_id", "ASC"],
        [getNumericSort(), "ASC"],
        ["prod_acno", "ASC"],
      ],
      limit: limit+1,
      offset: offset,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    let total = null;

    // if (parseInt(offset) === 0) {
    //   try {
    //     total = await AC_PROD_M.count({
    //       where: whereClause,
    //     });
    //   } catch (countError) {
    //     try {
    //       const sequelizeCount = await AC_PROD_M.count({
    //         where: whereClause,
    //       });
    //       total = parseInt(sequelizeCount) || 0;
    //     } catch (fallbackError) {
    //       total = 0;
    //     }
    //   }
    // }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}

async function updateStatus(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await AC_PROD_M.findAll({
      order: [
        [getNumericSort(), "ASC"],
        ["prod_acno", "ASC"],
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
    const prodAcNos = data.map((item) => item.prod_acno);

    return await AC_PROD_M.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          customs_shoe_id: customs_shoe_id,
          status: 1,
          prod_acno: {
            [Op.in]: prodAcNos,
          },
        },
      },
    );
  }
  return await AC_PROD_M.update(
    { status: 7 },
    {
      where: {
        ...whereClause,
        customs_shoe_id: customs_shoe_id,
        status: 1,
      },
    },
  );
}

async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "prod_acno") {
        orderClause.push([getNumericSort(), "ASC"]);
        orderClause.push(["prod_acno", "ASC"]);
      } else {
        // Regular field sorting
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        customs_shoe_id: keys.customs_shoe_id,
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
  acProdM,
  pageSize,
  t,
) {
  const addItem = await AC_PROD_M.create(acProdM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      customs_shoe_id: addItem.customs_shoe_id,
      prod_acno: addItem.prod_acno,
    },
    pageSize,
    AC_PROD_M,
    ["factory_code", "customs_shoe_id", "prod_acno"],
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
  existacProdM,
  editacProdM,
  pageSize,
  t,
) {
  try {
    const editItem = await existacProdM.update(editacProdM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        customs_shoe_id: editItem.customs_shoe_id,
        prod_acno: editItem.prod_acno,
      },
      pageSize,
      AC_PROD_M,
      ["factory_code", "customs_shoe_id", "prod_acno"],
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac prod m from db", error);
    throw error;
  }
}

async function deleteASR(existacProdM, t) {
  try {
    const deleteAPM = await existacProdM.destroy({ transaction: t });
    return deleteAPM;
  } catch (error) {
    console.log("Cannot delete ac prod m from db", error);
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
      AC_PROD_M: ["prod_acno", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_PROD_M || {};
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
    const rows = await AC_PROD_M.findAll({
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
        ["customs_shoe_id", "ASC"],
        [getNumericSort(), "ASC"],
        ["prod_acno", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_PROD_M.count({
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
async function listAcProdMDropdown(factory_code, language, page, limit, search) {
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };

  let replacements = {
    factory_code: factory_code,
    language: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `AND PROD_ACNO ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }

  const sql = `
    SELECT
      PROD_ACNO,
      SUBSTR("Customs".GF_AC_PROD_NOTE(FACTORY_CODE, PROD_ACNO), 1, 200) AS NOTE
    FROM "Customs".AC_PROD_M
    WHERE FACTORY_CODE = :factory_code
      ${searchCondition}
    ORDER BY PROD_ACNO
    LIMIT :limit
    OFFSET :offset
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM "Customs".AC_PROD_M
    WHERE FACTORY_CODE = :factory_code
      ${searchCondition}
  `;

  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in AC_PROD_M dropdown list:", error);
    throw error;
  }
}
module.exports = {
  listAllASR,
  getByID,
  getByShoe,
  updateStatus,
  add,
  edit,
  deleteASR,
  search,
  listAcProdMDropdown
};
