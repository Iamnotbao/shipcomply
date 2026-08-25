const QueryHelper = require("../../utils/queryHelper.js");
const AC_SRCORDER_M = require("./ac_srcorder_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db");
const { fn, col, Op, Sequelize } = require("sequelize");

async function listAllAcSOM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit = 10,
  offset = 0,
) {
  try {
    // Admin thì lấy hết
    if (user_code === "admin") {
      const rows = await AC_SRCORDER_M.findAll({
        order: [
          ["factory_code", "ASC"],
          ["id", "ASC"],
        ],
        limit: parseInt(limit) + 1,
        offset: parseInt(offset),
      });

      const hasMore = rows.length > limit;
      const actualRows = hasMore ? rows.slice(0, limit) : rows;
      return { rows: actualRows, count: null, hasMore };
    }

    // Filter theo quyền
    const whereClause = {};
    if (query_level === "1" && factory_code) {
      whereClause.factory_code = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      whereClause.factory_code = factory_code;
      whereClause.grt_dept = department_code;
    } else if (query_level === "3" && user_code) {
      whereClause.grt_user = user_code;
    }

    const rows = await AC_SRCORDER_M.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["id", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;

    return { rows: actualRows, count: null, hasMore };
  } catch (error) {
    console.error(" Fatal error:", error);
    throw error;
  }
}

async function getByID(factory_code, id) {
  const acSrcorderM = await AC_SRCORDER_M.findOne({
    where: {
      factory_code: factory_code,
      id: id,
    },
    include: [FACTORY],
  });
  if (!acSrcorderM) {
    console.log("No AC_SRCORDER_M found!");
    return null;
  }
  return acSrcorderM;
}
async function getAllACIMByIA(id) {
  return await AC_SRCORDER_M.findAll({
    where: {
      item_acno: item_acno,
    },
  });
}
async function getByField(factory_code, field) {
  const acVB = await AC_SRCORDER_M.findAll({
    where: {
      factory_code: factory_code,
    },
    attributes: [field],
    include: [FACTORY],
  });
  if (!acVB) {
    console.log("No AC_REQ_ORDER found!");
    return null;
  }
  return acVB;
}
async function getDropdownByF(factory_code, field, page, limit, search = "",isStatus=true) {
  try {
    const whereClause = {
      factory_code: factory_code,
    };

    if (search && search.trim() !== "") {
      const integerFields = ["order_seq"];
      const decimalFields = ["order_acqty", "price"];
      const dateFields = ["order_date"];

      if (integerFields.includes(field)) {
        whereClause[Op.and] = [
          Sequelize.where(
            Sequelize.cast(
              Sequelize.cast(Sequelize.col(field), "INTEGER"),
              "TEXT",
            ),
            { [Op.like]: `%${search}%` },
          ),
        ];
      } else if (decimalFields.includes(field)) {
        whereClause[Op.and] = [
          Sequelize.where(Sequelize.cast(Sequelize.col(field), "TEXT"), {
            [Op.like]: `%${search}%`,
          }),
        ];
      } else if (dateFields.includes(field)) {
        whereClause[Op.and] = [
          Sequelize.where(
            Sequelize.cast(
              Sequelize.cast(Sequelize.col(field), "DATE"),
              "TEXT",
            ),
            { [Op.like]: `%${search}%` },
          ),
        ];
      } else {
        whereClause[field] = { [Op.like]: `%${search}%` };
      }
    }
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      if (isStatusBool) {
         whereClause.status = 7;
      }
    // Đếm số giá trị DISTINCT
    const countResult = await AC_SRCORDER_M.count({
      where: whereClause,
      distinct: true,
      col: field,
      });

    const result = await AC_SRCORDER_M.findAll({
      where: whereClause,
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(field)), field]],
      order: [[field, "ASC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return {
      data: result,
      total: countResult,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(countResult / limit),
    };
  } catch (error) {
    console.error("Error from basic data dropdown:", error);
    throw error;
  }
}
async function add(acSOM, t) {
  try {
    const addAcSrcorderM = await AC_SRCORDER_M.create(acSOM, {
      transaction: t,
    });
    return addAcSrcorderM;
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
  }
}
async function edit(existAcSOM, editAcISOM, t) {
  try {
    const editASOM = await existAcSOM.update(editAcISOM, { transaction: t });
    return editASOM;
  } catch (error) {
    console.log("Cannot edit ac item m from db", error);
  }
}
async function deleteAcSOM(existAcSOM, t) {
  try {
    const deleteSOM = await existAcSOM.destroy({ transaction: t });
    return deleteSOM;
  } catch (error) {
    console.log("Cannot delete ac item m from db", error);
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
      AC_SRCORDER_M: ["vend_no", "order_no", "item_acno", "status"],
      FACTORY: ["factory_code"],
    }).filter();

    const whereClause = queryHelper.whereMap.AC_SRCORDER_M || {};

    // Date range cho order_date
    const { s_date_1, e_date_1, s_date_2, e_date_2 } = query.search || {};

    if (s_date_1 || e_date_1) {
      whereClause.order_date = {};
      if (s_date_1) whereClause.order_date[Op.gte] = new Date(s_date_1);
      if (e_date_1)
        whereClause.order_date[Op.lte] = new Date(e_date_1 + "T23:59:59");
    }

    // Date range cho vr_cfmday
    if (s_date_2 || e_date_2) {
      whereClause.vr_cfmday = {};
      if (s_date_2) whereClause.vr_cfmday[Op.gte] = new Date(s_date_2);
      if (e_date_2)
        whereClause.vr_cfmday[Op.lte] = new Date(e_date_2 + "T23:59:59");
    }

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        whereClause.factory_code = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        whereClause.factory_code = factory_code;
        whereClause.grt_dept = department_code;
      } else if (query_level === "3" && user_code) {
        whereClause.grt_user = user_code;
      }
    }

    const rows = await AC_SRCORDER_M.findAll({
      where: whereClause,
      order: [
        ["order_date", "DESC"],
        ["order_no", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    const total = await AC_SRCORDER_M.count({ where: whereClause });

    return { rows: actualRows, count: total, hasMore };
  } catch (error) {
    console.error("Fatal error:", error);
    throw error;
  }
}
module.exports = {
  listAllAcSOM,
  getAllACIMByIA,
  getByField,
  getDropdownByF,
  getByID,
  add,
  edit,
  deleteAcSOM,
  search,
};
