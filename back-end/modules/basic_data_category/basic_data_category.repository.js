const { Op } = require("sequelize");
const BASIC_DATA_CATEGORY = require("./basic_data_category.model");
const FACTORY = require("../factories/factory.model");
const QueryHelper = require("../../utils/queryHelper");

async function listAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {

  if (user_code === "admin") {
    return await BASIC_DATA_CATEGORY.findAll({
      order: [["category_code", "ASC"]],
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
  const rows = await BASIC_DATA_CATEGORY.findAll({
    where: whereClause,
    order: [["category_code", "ASC"]],
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
async function getByID(factory_code, category_code) {
  try {
    const department = await BASIC_DATA_CATEGORY.findOne({
      where: {
        factory_code: factory_code,
        category_code: category_code,
      },
      include: [FACTORY],
    });
    return department;
  } catch (error) {
    console.log("Error from department Db: ", error);
  }
}
async function getByDeclareCategory(factory_code, category_code, filter) {
  try {
    const department = await BASIC_DATA_CATEGORY.findAll({
      where: {
        factory_code: factory_code,
        category_code: category_code,
        loading_way: filter,
      },
      order: [["category_code", "ASC"]],
    });
    return department;
  } catch (error) {
    console.log("Error from basic data category Db: ", error);
  }
}
async function getByFac(factory_code) {
  try {
    const department = await BASIC_DATA_CATEGORY.findAll({
      where: {
        factory_code: factory_code,
      },
      order: [["factory_code", "ASC"]],
    });
    return department;
  } catch (error) {
    console.log("Error from basic data category Db: ", error);
  }
}
async function getPosition(category_code, pageSize, t, permission) {
  try {
    const position = await BASIC_DATA_CATEGORY.count({
      where: {
        category_code: {
          [Op.lt]: category_code,
        },
        ...permission,
      },
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
  department_code,
  user_code,
  query_level,
  basicDataCategory,
  pageSize,
  t,
) {
  try {
    const addItem = await BASIC_DATA_CATEGORY.create(basicDataCategory, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItem.category_code,
      pageSize,
      t,
      permission,
    );
    return {
      data: addItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
    throw error;
  }
}
async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existbasicDataCategory,
  basicDataCategory,
  pageSize,
  t,
) {
  try {
    const editItem = await existbasicDataCategory.update(basicDataCategory, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editItem.category_code,
      pageSize,
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
async function deleteBasicData(existDepartment, t) {
  try {
    await existDepartment.destroy({ transaction: t });
    return 1;
  } catch (error) {
    console.log("Cannot delete basic data category from db");
  }
}
async function deleteAllDepartments(existBasicData) {
  try {
    const deleteCount = await BASIC_DATA_CATEGORY.destroy({
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
async function searchBasicDataCate(
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
      BASIC_DATA_CATEGORY: ["category_code", "status"],
      FACTORY: ["factory_code"],
    }).filter();

    const whereClause = queryHelper.whereMap.BASIC_DATA_CATEGORY || {};

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

    const rows = await BASIC_DATA_CATEGORY.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["category_code", "ASC"]],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await BASIC_DATA_CATEGORY.count({
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
  listAll,
  edit,
  add,
  getByID,
  getByFac,
  getByDeclareCategory,
  deleteBasicData,
  deleteAllDepartments,
  searchBasicDataCate,
};
