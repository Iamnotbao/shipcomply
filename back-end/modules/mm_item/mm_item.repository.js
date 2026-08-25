const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const FACTORY = require("../factories/factory.model.js");
const MM_ITEM = require("./mm_item.model.js");
const { Op, Sequelize } = require("sequelize");

async function listAllMMI(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await MM_ITEM.findAll({
      order: [["item_no", "ASC"]],
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
  try {
    const result = await MM_ITEM.findAll({
      where: whereClause,
      order: [["item_no", "ASC"]],
      logging: console.log,
    });
    return result;
  } catch (error) {
    console.error("Sequelize Error:", error.message);
    console.error("SQL:", error.sql);
    throw error;
  }
}

async function listAllItemNoMMI(page, limit, search = "") {
  const whereClause = {};

  if (search && search.trim() !== "") {
    whereClause.item_no = {
      [Op.like]: `%${search}%`,
    };
  }
  whereClause[Op.and] = [
    Sequelize.literal(`
      NOT EXISTS (
         SELECT 1
    FROM "Customs".AC_ITEM_REF air
    INNER JOIN "Customs".AC_ITEM_M aim
        ON air.item_acno    = aim.item_acno
        AND air.factory_code = aim.factory_code
    WHERE air.item_no = "MM_ITEM"."item_no" 
    and aim.status <> 0
      )
    `),
  ];
  try {
    const total = await MM_ITEM.count({ where: whereClause });
    const result = await MM_ITEM.findAll({
      where: whereClause,
      attributes: ["item_no", "name_e", "name_s", "name_t"],
      order: [["item_no", "ASC"]],
      ...(limit != null && {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      }),
    });

    return {
      data: result,
      total,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Sequelize Error:", error.message);
    throw error;
  }
}
async function getByID(item_no) {
  try {
    const result = await MM_ITEM.findOne({
      where: {
        item_no: item_no,
      },
      logging: console.log,
    });
    return result;
  } catch (error) {
    console.error("Repository error:", error);
    throw error;
  }
}
async function getBySizeType(
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      size_type: size_type,
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
    const rdSizeD = await MM_ITEM.findAll({
      where: whereClause,
      attributes: ["size_seq", "size_no"],
      order: [["size_seq", "ASC"]],
    });

    return rdSizeD;
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}
async function add(mMItem, t) {
  try {
    const addMMItem = await MM_ITEM.create(mMItem, {
      transaction: t,
    });
    return addMMItem;
  } catch (error) {
    console.log("Cannot add rd Size D from db", error);
  }
}
async function edit(existmMItem, editmMItem, t) {
  try {
    const editmMItemort = await existmMItem.update(editmMItem, {
      transaction: t,
    });
    return editmMItemort;
  } catch (error) {
    console.log("Cannot edit rd Size D from db", error);
  }
}
async function deleteRSD(existmMItem, t) {
  try {
    const deleteImp = await existmMItem.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete rd Size D from db", error);
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
      MM_ITEM: ["size_no", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.MM_ITEM || {};
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
    const impSearch = await MM_ITEM.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["size_no", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllMMI,
  listAllItemNoMMI,
  getByID,
  getBySizeType,
  add,
  edit,
  deleteRSD,
  search,
};
