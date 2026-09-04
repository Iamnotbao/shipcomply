const QueryHelper = require("../../utils/queryHelper.js");
const AC_SHOE_REF = require("./ac_shoe_ref.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const { Op, literal } = require("sequelize");
const AC_SHOE_M = require("../ac_shoe_m/ac_shoe_m.model.js");

const getNumericSort = () => {
  return literal(`
    CASE 
      WHEN REGEXP_REPLACE(prod_no, '[^0-9]', '', 'g') = '' THEN 0
      ELSE CAST(REGEXP_REPLACE(prod_no, '[^0-9]', '', 'g') AS BIGINT)
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
    return await AC_SHOE_REF.findAll({
      order: [
        ["factory_code", "ASC"],
        ["customs_shoe_id", "ASC"],
        [getNumericSort(), "ASC"],
        ["prod_no", "ASC"],
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
  const rows = await AC_SHOE_REF.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["customs_shoe_id", "ASC"],
      [getNumericSort(), "ASC"],
      ["prod_no", "ASC"],
    ],
    ...(limit != null && {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    }),
  });
  const hasMore = rows.length > parseInt(limit);
  const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

  let total = null;

  // if (parseInt(offset) === 0) {
  //   try {
  //     total = await AC_SHOE_REF.count({
  //       where: whereClause,
  //     });
  //   } catch (countError) {
  //     try {
  //       const sequelizeCount = await AC_SHOE_REF.count({
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
async function updateStatus(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await AC_SHOE_REF.findAll({
      order: [
        [getNumericSort(), "ASC"],
        ["prod_no", "ASC"],
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
    const prodNos = data.map((item) => item.prod_no);

    return await AC_SHOE_REF.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          customs_shoe_id: customs_shoe_id,
          status: 1,
          prod_no: {
            [Op.in]: prodNos,
          },
        },
      },
    );
  }
  return await AC_SHOE_REF.update(
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
async function getByID(factory_code, customs_shoe_id, prod_no) {
  console.log("=== DEBUG Method 1: Enable logging ===");
  console.log("Params:", factory_code, customs_shoe_id, prod_no);

  try {
    const acProdM = await AC_SHOE_REF.findOne({
      where: {
        factory_code: factory_code,
        customs_shoe_id: customs_shoe_id,
        prod_no: prod_no,
      },
      include: [
        {
          model: FACTORY,
          required: false,
        },
        {
          model: AC_SHOE_M,
          as: "ACSHOEM",
          attributes: [
            "customs_shoe_name_l",
            "customs_shoe_name_t",
            "customs_shoe_name_e",
            "status",
          ],
          required: false,
          on: {
            [Op.and]: [
              literal(
                '"AC_SHOE_REF"."factory_code" = "ACSHOEM"."factory_code"',
              ),
              literal(
                '"AC_SHOE_REF"."customs_shoe_id" = "ACSHOEM"."customs_shoe_id"',
              ),
            ],
          },
        },
      ],
      logging: console.log, // ← BẬT LOGGING ĐỂ XEM SQL
      raw: false, // false để giữ nguyên Sequelize instance
      nest: true, // true để nest các include
    });

    if (!acProdM) {
      console.log("No AC_SHOE_REF found!");
      return null;
    }

    console.log("Result:", JSON.stringify(acProdM, null, 2));
    return acProdM;
  } catch (error) {
    console.error("ERROR in getByID:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
}
async function getByNoViewProdNo(prod_no) {
  const acImp = await AC_SHOE_REF.findAll({
    where: {
      prod_no: prod_no,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
      {
        model: AC_SHOE_M,
        as: "ACSHOEM",
        attributes: [
          "customs_shoe_name_l",
          "customs_shoe_name_t",
          "customs_shoe_name_e",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal('"AC_SHOE_REF"."factory_code" = "ACSHOEM"."factory_code"'),
            literal(
              '"AC_SHOE_REF"."customs_shoe_id" = "ACSHOEM"."customs_shoe_id"',
            ),
          ],
        },
      },
    ],
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
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
    const rows = await AC_SHOE_REF.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["customs_shoe_id", "ASC"],
        [getNumericSort(), "ASC"],
        ["prod_no", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    let total = null;

    // if (parseInt(offset) === 0) {
    //   try {
    //     total = await AC_SHOE_REF.count({
    //       where: whereClause,
    //     });
    //   } catch (countError) {
    //     try {
    //       const sequelizeCount = await AC_SHOE_REF.count({
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

    return department;
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
  1;
}
async function getListOfProdNo(page, limit, search = "") {
  try {
    const replacements = {};

    const whereClauses = [
      `NOT EXISTS (
        select 1 
          from "Customs".ac_shoe_ref  asr
          inner join "Customs".ac_shoe_m asm
          on asr.customs_shoe_id = asm.customs_shoe_id
          and asr.factory_code = asm.factory_code
          where
          asr.prod_no = vrp.prod_no
          and asm.status <> 0 
      )`,
    ];

    if (search && search.trim() !== "") {
      whereClauses.push("(vrp.prod_no ILIKE :search or( vrp.name_e ILIKE :search or vrp.name_t ILIKE :search or vrp.name_s ILIKE :search ))");
      replacements.search = `%${search}%`;
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

    //  Không cần JOIN nữa, chỉ từ view + WHERE NOT EXISTS
    const baseSql = `
      FROM "Customs".vw_rd_prod AS vrp
      ${whereSQL}
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const countResult = await pool.query(countSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0].total, 10);

    const dataSql = `
      SELECT
        vrp.prod_no,
        vrp.name_e,
        vrp.name_t,
        vrp.name_s,
        vrp.unit
      ${baseSql}
      ORDER BY vrp.prod_no
      LIMIT :limit OFFSET :offset
    `;
    replacements.limit = parseInt(limit);
    replacements.offset = (page - 1) * parseInt(limit);

    const rows = await pool.query(dataSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return {
      data: rows,
      total,
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
}
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "prod_no") {
        orderClause.push([getNumericSort(), "ASC"]);
        orderClause.push(["prod_no", "ASC"]);
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

    console.log("✅ Position calculated:", {
      prod_no: keys.prod_no,
      position,
      page,
      offset,
      size,
    });

    return { position, size, page, offset };
  } catch (error) {
    console.error("❌ Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acShoeRef,
  pageSize,
  t,
) {
  const addItem = await AC_SHOE_REF.create(acShoeRef, { transaction: t });
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
      prod_no: addItem.prod_no,
    },
    pageSize,
    AC_SHOE_REF,
    ["factory_code", "customs_shoe_id", "prod_no"],
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
  existAcShoeRef,
  editAcShoeRef,
  pageSize,
  t,
) {
  try {
    const editItem = await existAcShoeRef.update(editAcShoeRef, {
      transaction: t,
    });
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
        prod_no: editItem.prod_no,
      },
      pageSize,
      AC_SHOE_REF,
      ["factory_code", "customs_shoe_id", "prod_no"],
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac shoe ref from db", error);
  }
}
async function deleteASR(existAcShoeRef, t) {
  try {
    const deleteASR = await existAcShoeRef.destroy({ transaction: t });
    return deleteASR;
  } catch (error) {
    console.log("Cannot delete ac shoe ref from db", error);
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
      AC_SHOE_REF: [
        "invoice_no",
        "declaration_category",
        "actual_delivery_date",
        "actual_delivery_date",
        "estimated_delivery_date",
        "loading_way",
        "declaration_retrieve_date",
        "record_date",
        "sort",
        "status",
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_SHOE_REF || {};
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
    const impSearch = await AC_SHOE_REF.findAll({
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
        ["prod_no", "ASC"],
      ],
    });
    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllASR,
  getByID,
  getByShoe,
  getListOfProdNo,
  getByNoViewProdNo,
  updateStatus,
  add,
  edit,
  deleteASR,
  search,
};
