const QueryHelper = require("../../utils/queryHelper.js");
const AC_SHOE_M = require("./ac_shoe_m.model.js");
const AC_SHOE_REF = require("../ac_shoe_ref/ac_shoe_ref.model.js");
const AC_PROD_M = require("../ac_prod_m/ac_prod_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const { Op, literal } = require("sequelize");

async function listAllSM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_SHOE_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["customs_shoe_id", "ASC"],
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
  const rows = await AC_SHOE_M.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["customs_shoe_id", "ASC"],
    ],
    limit: limit + 1,
    offset: offset,
  });
  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;

  let total = null;

  // if (parseInt(offset) === 0) {
  //   try {
  //     total = await AC_SHOE_M.count({
  //       where: whereClause,
  //     });
  //   } catch (countError) {
  //     try {
  //       const sequelizeCount = await AC_SHOE_M.count({
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
async function listAllSMWithProdRef(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const whereClause = {};
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

  return await AC_SHOE_M.findAll({
    where: whereClause,
    include: [
      {
        model: AC_PROD_M,
        as: "PROD",
        attributes: [
          "start_size",
          "s_seq",
          "end_size",
          "e_seq",
          "bang_ke_size",
          "pt_per",
          "note",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal('"AC_SHOE_M"."customs_shoe_id" = "PROD"."customs_shoe_id"'),
          ],
        },
      },
      {
        model: AC_SHOE_REF,
        as: "ACSHOEREF",
        attributes: [
          "prod_no",
          "prod_unit",
          "is_valid",
          "valid_date",
          "unval_date",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_SHOE_M"."customs_shoe_id" = "ACSHOEREF"."customs_shoe_id"',
            ),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [["customs_shoe_id", "ASC"]],
  });
}
async function listAcItemnoDropdown(
  factory_code,
  language,
  page,
  limit,
  search,
) {
  const chartset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    language: chartset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `AND A.PROD_ACNO ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }
  let sql, countSql;
    sql = `
    SELECT  
    A.PROD_ACNO,
    "Customs".GF_ACPROD_NAME(A.FACTORY_CODE,A.PROD_ACNO,:language)  PROD_NAME,
    B.UNIT,
    "Customs".GF_CODE_NAME(A.FACTORY_CODE,'1108',B.UNIT,:language) AS UNIT_NAME 
    FROM 
  "Customs".AC_PROD_M A, 
  "Customs".AC_SHOE_M B 
  WHERE A.FACTORY_CODE =:factory_code AND A.FACTORY_CODE=B.FACTORY_CODE 
   AND A.customs_shoe_id=B.customs_shoe_id
   AND B.STATUS=7 
  AND ${permissionCondition} 
    ${searchCondition}
    order by A.PROD_ACNO
    LIMIT :limit
    OFFSET :offset
  `;
    countSql = `
    SELECT COUNT(*) as total
     FROM 
  "Customs".AC_PROD_M A, 
  "Customs".AC_SHOE_M B 
  WHERE A.FACTORY_CODE =:factory_code AND A.FACTORY_CODE=B.FACTORY_CODE 
   AND A.customs_shoe_id=B.customs_shoe_id
   AND B.STATUS=7 
  AND ${permissionCondition} 
    ${searchCondition}
  `;
  
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
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
    console.error("Error in good codes list:", error);
    throw error;
  }
}
async function listShoeDropdown(
  factory_code,
  language,
  page,
  limit,
  search,
) {
  const chartset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    language: chartset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `AND A.PROD_ACNO ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }
  let sql, countSql;
    sql = `
    SELECT customs_shoe_id,
    CASE :language
    when 'E' THEN customs_shoe_name_e
    when 'T' THEN customs_shoe_name_t
    when 'L' THEN customs_shoe_name_l
    END AS SHOE_NAME
    FROM "Customs".AC_SHOE_M
    WHERE FACTORY_CODE = :factory_code
    AND   STATUS = 7
    ${searchCondition}
    ORDER BY customs_shoe_id
    LIMIT :limit
    OFFSET :offset
  `;
    countSql = `
    SELECT COUNT(*) as total
     FROM "Customs".AC_SHOE_M
    WHERE FACTORY_CODE = :factory_code
    AND  STATUS = 7
    ${searchCondition}
  `;
  
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
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
    console.error("Error in good codes list:", error);
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
async function getByID(factory_code, customs_shoe_id) {
  const acShoeM = await AC_SHOE_M.findOne({
    where: {
      factory_code: factory_code,
      customs_shoe_id: customs_shoe_id,
    },
    include: [FACTORY],
  });
  if (!acShoeM) {
    console.log("No AC_SHOE_M found!");
    return null;
  }
  return acShoeM;
}
async function getBySize(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
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

    const sizes = await AC_SHOE_M.findAll({
      wherehere: whereClause,
      attributes: ["size_type"],
      group: ["size_type"],
      order: [["size_type", "ASC"]],
      raw: true,
    });
    return sizes;
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}
async function getByRdSize(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
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

    const sizes = await AC_SHOE_M.findAll({
      wherehere: whereClause,
      attributes: ["size_type"],
      group: ["size_type"],
      order: [["size_type", "ASC"]],
      raw: true,
    });
    return sizes;
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
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
async function linkBom(
  factory_code,
  user_code,
  department_code,
  query_level,
  ip,
  customs_shoe_id,
  ac_code,
  prod_no,
  date_time,
) {
  if (user_code === "admin") {
    return await AC_SHOE_M.findAll({
      order: [["customs_shoe_id", "ASC"]],
    });
  }
  console.log(
    "all things",
    factory_code,
    user_code,
    department_code,
    query_level,
    ip,
    customs_shoe_id,
    ac_code,
    prod_no,
    date_time,
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
  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      try {
        const rows = await pool.query(
          `SELECT "Customs".gf_stdbom_acbom($1, $2, $3, $4, $5, $6, $7, $8) AS title;`,
          {
            bind: [
              factory_code,
              department_code,
              user_code,
              ip,
              date_time,
              customs_shoe_id,
              ac_code,
              prod_no,
            ],
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        return rows;
      } catch (error) {
        console.log("this error", error);

        console.error(`Error for control `, error.original?.message);
        return { title: null, type: "control" };
      }
    });
  } catch (error) {
    console.error("Error in getUIControls:", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acShoeM,
  pageSize,
  t,
) {
  const addItem = await AC_SHOE_M.create(acShoeM, { transaction: t });
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
    },
    pageSize,
    AC_SHOE_M,
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
  existacShoeM,
  editacShoeM,
  pageSize,
  t,
) {
  try {
    const editItem = await existacShoeM.update(editacShoeM, { transaction: t });
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
      },
      pageSize,
      AC_SHOE_M,
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac shoe m from db", error);
  }
}
async function deleteASM(existacShoeM, t) {
  try {
    const deleteASM = await existacShoeM.destroy({ transaction: t });
    return deleteASM;
  } catch (error) {
    console.log("Cannot delete ac shoe m from db", error);
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
      AC_SHOE_M: ["customs_shoe_id", "customs_tariff", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_SHOE_M || {};
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
    const rows = await AC_SHOE_M.findAll({
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
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_SHOE_M.count({
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
  listAllSM,
  listAllSMWithProdRef,
  listAcItemnoDropdown,
  listShoeDropdown,
  linkBom,
  getByID,
  getBySize,
  add,
  edit,
  deleteASM,
  search,
};
