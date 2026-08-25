const QueryHelper = require("../../utils/queryHelper.js");
const fs = require("fs");
const AC_BOM_M = require("./ac_bom_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");

async function listAllABM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  isAll = false,
) {
  if (user_code === "admin") {
    return await AC_BOM_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["prod_acno", "ASC"],
        ["item_acno", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
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

  // Build options trước, rồi mới truyền vào findAll
  const queryOptions = {
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["prod_acno", "ASC"],
      ["item_acno", "ASC"],
    ],
    ...(!isAll && {
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    }),
  };
  

  const rows = await AC_BOM_M.findAll(queryOptions);
  const hasMore = !isAll && rows.length > parseInt(limit);
  const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

  return {
    rows: actualRows,

    count: null,
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
async function getByID(factory_code, prod_acno, item_acno) {
  const acBomM = await AC_BOM_M.findOne({
    where: {
      factory_code: factory_code,
      prod_acno: prod_acno,
      item_acno: item_acno,
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
  const addItem = await AC_BOM_M.create(acBomM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      prod_acno: addItem.prod_acno,
      item_acno: addItem.item_acno,
    },
    pageSize,
    AC_BOM_M,
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
        prod_acno: editItem.prod_acno,
        item_acno: editItem.item_acno,
      },
      pageSize,
      AC_BOM_M,
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
      AC_BOM_M: ["prod_acno", "item_acno", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_BOM_M || {};
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
    const rows = await AC_BOM_M.findAll({
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
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_BOM_M.count({
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
  listAllABM,
  getByID,
  add,
  edit,
  deleteABM,
  search,
};
