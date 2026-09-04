const { Op, literal, fn, col } = require("sequelize");
const BASIC_DATA = require("./basic_data.model");
const FACTORY = require("../factories/factory.model");
const QueryHelper = require("../../utils/queryHelper");
const BASIC_DATA_CATEGORY = require("../basic_data_category/basic_data_category.model");

const getNumericSort = () => {
  return literal(`
    CASE 
      WHEN REGEXP_REPLACE(code_no, '[^0-9]', '', 'g') = '' THEN 0
      ELSE CAST(REGEXP_REPLACE(code_no, '[^0-9]', '', 'g') AS BIGINT)
    END
  `);
};
async function listAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  console.log(
    "all things ",
    factory_code,
    department_code,
    user_code,
    query_level,
  );

  if (user_code === "admin") {
    return await BASIC_DATA.findAll({
      order: [
        ["factory_code", "ASC"],
        ["category_code", "ASC"],
        [getNumericSort(), "ASC"],
        ["code_no", "ASC"],
      ],
      limit: limit + 1,
      offset: offset,
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

  const rows = await BASIC_DATA.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["category_code", "ASC"],
      [getNumericSort(), "ASC"],
      ["code_no", "ASC"],
    ],
    limit: limit + 1,
    offset: offset,
  });
  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;

  let total = null;

  if (parseInt(offset) === 0) {
    try {
      // Build WHERE clause cho raw query
      total = await BASIC_DATA.count({
        where: whereClause,
      });
    } catch (countError) {
      try {
        const sequelizeCount = await BASIC_DATA.count({
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
async function listAllWithCategory(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit = 10,
  offset = 0,
) {
  console.log(
    "listAll with category join",
    factory_code,
    department_code,
    user_code,
    query_level,
  );

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

  const rows = await BASIC_DATA.findAll({
    where: whereClause,
    include: [
      {
        model: BASIC_DATA_CATEGORY,
        as: "CATEGORY",
        attributes: [
          "category_name_t",
          "category_name_e",
          "category_name_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal('"BASIC_DATA"."factory_code" = "CATEGORY"."factory_code"'),
            literal(
              '"BASIC_DATA"."category_code" = "CATEGORY"."category_code"',
            ),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [
      ["factory_code", "ASC"],
      ["category_code", "ASC"],
      [getNumericSort(), "ASC"],
      ["code_no", "ASC"],
    ],
  });
  const hasMore = rows.length > parseInt(limit);
  const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
 
  let total = null;
 
  return {
    rows: rows,
    count: total,
    hasMore: hasMore,
  };
}
async function getByID(factory_code, category_code, code_no) {
  try {
    const basicData = await BASIC_DATA.findOne({
      where: {
        factory_code: factory_code,
        category_code: category_code,
        code_no: code_no,
      },
      include: [
        {
          model: FACTORY,
          required: false,
        },
        //  Include BASIC_DATA_CATEGORY - Composite key với literal
        {
          model: BASIC_DATA_CATEGORY,
          as: "CATEGORY",
          attributes: [
            "category_name_t",
            "category_name_e",
            "category_name_l",
            "status",
          ],
          required: false,
          on: {
            // ✅ PostgreSQL: Dùng double quotes "
            [Op.and]: [
              literal(
                '"BASIC_DATA"."factory_code" = "CATEGORY"."factory_code"',
              ),
              literal(
                '"BASIC_DATA"."category_code" = "CATEGORY"."category_code"',
              ),
            ],
          },
        },
      ],
    });

    return basicData;
  } catch (error) {
    console.log("Error from getByID_WithLiteral: ", error);
    throw error;
  }
}
async function updateStatus(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await BASIC_DATA.findAll({
      order: [
        ["factory_code", "ASC"],
        ["category_code", "ASC"],
        [getNumericSort(), "ASC"],
        ["code_no", "ASC"],
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
    const codeNos = data.map((item) => item.code_no);

    return await BASIC_DATA.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          category_code: category_code,
          status: 1,
          code_no: {
            [Op.in]: codeNos,
          },
        },
      },
    );
  }
  return await BASIC_DATA.update(
    { status: 7 },
    {
      where: {
        ...whereClause,
        category_code: category_code,
        status: 1,
      },
    },
  );
}
async function fetchDetailsForMaster(
  factory_code,
  category_code,
  whereClauseBasicData,
  factoryWhere = {},
) {
  const details = await BASIC_DATA.findAll({
    where: {
      ...whereClauseBasicData,
      factory_code: factory_code,
      category_code: category_code,
    },
    include: [
      {
        model: FACTORY,
        where: factoryWhere,
        required: true,
      },
      {
        model: BASIC_DATA_CATEGORY,
        as: "CATEGORY",
        attributes: [
          "category_name_e",
          "category_name_t",
          "category_name_l",
          "status",
        ],
        required: false,
      },
    ],
    order: [
      ["factory_code", "ASC"],
      ["category_code", "ASC"],
      ["code_no", "ASC"],
    ],
  });

  return details;
}
async function getByFac(factory_code) {
  try {
    const department = await BASIC_DATA.findAll({
      where: {
        factory_code: factory_code,
      },
      order: [["code_no", "ASC"]],
    });
    return department;
  } catch (error) {
    console.log("Error from department Db: ", error);
  }
}
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "code_no") {
        orderClause.push([getNumericSort(), "ASC"]);
        orderClause.push(["code_no", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        category_code: keys.category_code,
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
async function getByCate(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      category_code: category_code,
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
    const rows = await BASIC_DATA.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["category_code", "ASC"],
        [getNumericSort(), "ASC"],
        ["code_no", "ASC"],
      ],
      limit: limit + 1,
      offset: offset,
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
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}
async function getDropdownByCate(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search = "",
  isStatus = true,
  language = "en",
) {
  try {
    const charset = {
      vi: "L",
      en: "E",
      zh: "T",
    };
    let nameField;
    switch (language) {
      case "vi":
        nameField = "name_l";
        break;
      case "zh":
        nameField = "name_t";
        break;
      case "en":
      default:
        nameField = "name_e";
        break;
    }

    const whereClause = {
      factory_code: factory_code,
      category_code: category_code,
    };
    const isStatusBool = String(isStatus).toLowerCase() === "true";

    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        { code_no: { [Op.like]: `%${search}%` } },
        { name_e: { [Op.like]: `%${search}%` } },
        { name_l: { [Op.like]: `%${search}%` } },
        { name_t: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isStatusBool) {
      whereClause.status = 7;
    }

    const total = await BASIC_DATA.count({ where: whereClause });
    const result = await BASIC_DATA.findAll({
      where: whereClause,
      attributes: [
        "code_no",
        "name_e",
        "name_l",
        "name_t",
        [nameField, "name"],
      ],
      order: [
        ["factory_code", "ASC"],
        ["category_code", "ASC"],
        [getNumericSort(), "ASC"],
        ["code_no", "ASC"],
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return {
      data: result,
      total: total,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error from basic data dropdown:", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  basicData,
  pageSize,
  t,
) {
  try {
    const addItem = await BASIC_DATA.create(basicData, {
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
        factory_code: addItem.factory_code,
        category_code: addItem.category_code,
        code_no: addItem.code_no,
      },
      pageSize,
      BASIC_DATA,
      ["factory_code", "category_code", "code_no"],
      t,
      permission,
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
  existBD,
  basicData,
  pageSize,
  t,
) {
  const editItem = await existBD.update(basicData, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: editItem.factory_code,
      category_code: editItem.category_code,
      code_no: editItem.code_no,
    },
    pageSize,
    BASIC_DATA,
    ["factory_code", "category_code", "code_no"],
    t,
    permission,
  );
  return {
    data: editItem,
    ...positionInfo,
  };
}
async function deleteBasicData(existDepartment, t) {
  try {
    await existDepartment.destroy({ transaction: t });
    return 1;
  } catch (error) {
    console.log("Cannot delete factory from db");
  }
}
async function deleteAllDepartments(existBasicData) {
  try {
    const deleteCount = await BASIC_DATA.destroy({
      where: {
        [Op.or]: existBasicData.map((d) => ({
          factory_code: d.factory_code,
          category_code: d.category_code,
          code_no: d.code_no,
        })),
      },
    });
    return deleteCount;
  } catch (error) {
    console.log("Database can not delete all the data", error);
  }
}
async function searchBasicData(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  loadDetails = true,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      BASIC_DATA: ["code_no", "category_code", "name", "status"],
      BASIC_DATA_CATEGORY: [
        "category_code",
        "category_name_e",
        "category_name_t",
        "category_name_l",
        "status",
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.BASIC_DATA || {};
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

    // BƯỚC 1: Đếm tổng số masters (factory_code + category_code)
    const totalMastersResult = await BASIC_DATA.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      attributes: ["factory_code", "category_code"],
      group: ["BASIC_DATA.factory_code", "BASIC_DATA.category_code"],
      raw: true,
    });

    const totalMasters = totalMastersResult.length;
    //  BƯỚC 2: Lấy danh sách master keys của page hiện tại
    const paginatedMasterKeys = await BASIC_DATA.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      attributes: ["factory_code", "category_code"],
      group: ["BASIC_DATA.factory_code", "BASIC_DATA.category_code"],
      order: [
        [col("BASIC_DATA.factory_code"), "ASC"],
        [col("BASIC_DATA.category_code"), "ASC"],
      ],
      limit: limit,
      offset: offset,
      raw: true,
    });

    if (paginatedMasterKeys.length === 0) {
      return {
        rows: [],
        totalMasters: totalMasters,
        totalDetails: 0,
        mastersInPage: 0,
        masterKeys: [],
        masterInfo: [],
      };
    }

    //  BƯỚC 3: Lấy FULL master info từ BASIC_DATA_CATEGORY
    const masterConditions = paginatedMasterKeys.map((m) => ({
      factory_code: m.factory_code,
      category_code: m.category_code,
    }));

    const masterInfoRecords = await BASIC_DATA_CATEGORY.findAll({
      where: {
        [Op.or]: masterConditions,
      },
      attributes: [
        "factory_code",
        "category_code",
        "category_name_e",
        "category_name_t",
        "category_name_l",
        "locked_information",
        "status",
        "grt_dept",
        "grt_user",
        "grt_date",
        "last_user",
        "last_date",
      ],
      order: [
        ["factory_code", "ASC"],
        ["category_code", "ASC"],
      ],
      raw: true,
    });

    //  KIỂM TRA: Có master nào không có data trong BASIC_DATA_CATEGORY không?
    const missingMasters = paginatedMasterKeys.filter(
      (key) =>
        !masterInfoRecords.find(
          (m) =>
            m.factory_code === key.factory_code &&
            m.category_code === key.category_code,
        ),
    );

    if (missingMasters.length > 0) {
      //  Thêm placeholder cho masters thiếu
      missingMasters.forEach((key) => {
        masterInfoRecords.push({
          factory_code: key.factory_code,
          category_code: key.category_code,
          category_name_e: null,
          category_name_t: null,
          category_name_l: null,
          locked_information: null,
          status: null,
          grt_dept: null,
          grt_user: null,
          grt_date: null,
          last_user: null,
          last_date: null,
        });
      });
    }

    //  BƯỚC 4: Đếm số lượng details cho mỗi master
    const detailCounts = await BASIC_DATA.findAll({
      where: {
        ...whereClause,
        [Op.or]: masterConditions,
      },
      attributes: [
        "factory_code",
        "category_code",
        [fn("COUNT", col("code_no")), "detailCount"],
      ],
      group: ["factory_code", "category_code"],
      raw: true,
    });

    //  Merge count vào master info
    const masterWithCounts = masterInfoRecords.map((master) => {
      const countInfo = detailCounts.find(
        (dc) =>
          dc.factory_code === master.factory_code &&
          dc.category_code === master.category_code,
      );

      return {
        ...master,
        detailCount: countInfo ? parseInt(countInfo.detailCount) : 0,
      };
    });

    //  BƯỚC 5: Lấy TẤT CẢ details của masters trong page (CHỈ khi loadDetails = true)
    let detailsForPage = [];

    if (loadDetails) {
      detailsForPage = await BASIC_DATA.findAll({
        where: {
          ...whereClause,
          [Op.or]: masterConditions,
        },
        include: [
          {
            model: FACTORY,
            where: queryHelper.whereMap.FACTORY || {},
            required: true,
          },
          {
            model: BASIC_DATA_CATEGORY,
            as: "CATEGORY",
            attributes: [
              "category_name_e",
              "category_name_t",
              "category_name_l",
              "status",
            ],
            required: false,
            on: {
              [Op.and]: [
                literal(
                  '"BASIC_DATA"."factory_code" = "CATEGORY"."factory_code"',
                ),
                literal(
                  '"BASIC_DATA"."category_code" = "CATEGORY"."category_code"',
                ),
              ],
            },
          },
        ],
        order: [
          ["factory_code", "ASC"],
          ["category_code", "ASC"],
          [getNumericSort(), "ASC"],
          ["code_no", "ASC"],
        ],
      });
    }

    //  BƯỚC 6: Tính tổng details (chỉ khi offset = 0)
    let totalDetails = null;
    if (offset === 0) {
      totalDetails = await BASIC_DATA.count({
        where: whereClause,
        include: [
          {
            model: FACTORY,
            where: queryHelper.whereMap.FACTORY || {},
            required: true,
            attributes: [],
          },
        ],
      });
    }

    return {
      rows: detailsForPage,
      totalMasters: totalMasters,
      totalDetails: totalDetails,
      mastersInPage: paginatedMasterKeys.length,
      masterKeys: masterConditions,
      masterInfo: masterWithCounts,
    };
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}

module.exports = {
  listAll,
  edit,
  add,
  getByID,
  getByFac,
  getByCate,
  getDropdownByCate,
  fetchDetailsForMaster,
  updateStatus,
  deleteBasicData,
  deleteAllDepartments,
  searchBasicData,
  listAllWithCategory,
};
