const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const RD_SIZE_D = require("./rd_size_d.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op, literal, QueryTypes } = require("sequelize");

async function listAllRSD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await RD_SIZE_D.findAll({
      order: [
        ["factory_code", "ASC"],
        ["size_type", "ASC"],
        ["size_no", "ASC"],
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
  return await RD_SIZE_D.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["size_type", "ASC"],
      ["size_no", "ASC"],
    ],
  });
}

async function getByID(factory_code, size_type, size_no) {
  try {
    const result = await RD_SIZE_D.findOne({
      where: {
        factory_code,
        size_type,
        size_no,
      },
      logging: console.log,
    });
    console.log("DB query result:", result);
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
  limit,
  offset,
) {
  try {
    const conditions = [`factory_code = :factory_code`, `size_type = :size_type`];
    const replacements = {
      factory_code,
      size_type,
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };

    if (user_code !== "admin") {
      switch (query_level) {
        case "1":
          break;
        case "2":
          if (department_code) {
            conditions.push(`grt_dept = :department_code`);
            replacements.department_code = department_code;
          }
          break;
        case "3":
          if (user_code) {
            conditions.push(`grt_user = :user_code`);
            replacements.user_code = user_code;
          }
          break;
      }
    }

    const whereSql = conditions.join(" AND ");

    const sql = `
      SELECT DISTINCT ON (size_no) *
      FROM "Customs"."rd_size_d"
      WHERE ${whereSql}
      ORDER BY size_no ASC, size_seq ASC
      LIMIT :limit OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
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
async function getDropdownBySize(
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search = "",
  isStatus = true,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      size_type: size_type,
    };
    // if (user_code !== "admin") {
    //   switch (query_level) {
    //     case "2":
    //       if (department_code) {
    //         whereClause.grt_dept = department_code;
    //       }
    //       break;
    //     case "3":
    //       if (user_code) {
    //         whereClause.grt_user = user_code;
    //       }
    //       break;
    //   }
    // }
    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        { size_no: { [Op.like]: `%${search}%` } },
        literal(`CAST("RD_SIZE_D"."size_seq" AS TEXT) LIKE '%${search}%'`),
        { size_shape: { [Op.like]: `%${search}%` } },
      ];
    }
    const total = await RD_SIZE_D.count({ where: whereClause });
    const result = await RD_SIZE_D.findAll({
      where: whereClause,
      attributes: [
        "factory_code",
        "size_type",
        "size_no",
        "size_seq",
        "size_shape",
      ],
      order: [
        ["factory_code", "ASC"],
        ["size_type", "ASC"],
        ["size_no", "ASC"],
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
async function getByRdSize(
  factory_code,
  customs_shoe_id,
  size_type,
  department_code,
  user_code,
  query_level,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      customs_shoe_id: customs_shoe_id,
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
async function add(rdSD, t) {
  try {
    const addImp = await RD_SIZE_D.create(rdSD, {
      transaction: t,
    });
    return addImp;
  } catch (error) {
    console.log("Cannot add rd Size D from db", error);
  }
}
async function edit(existrdSD, editrdSD, t) {
  try {
    const editrdSDort = await existrdSD.update(editrdSD, { transaction: t });
    return editrdSDort;
  } catch (error) {
    console.log("Cannot edit rd Size D from db", error);
  }
}
async function deleteRSD(existrdSD, t) {
  try {
    const deleteImp = await existrdSD.destroy({ transaction: t });
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
  limit,
  offset,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      RD_SIZE_D: ["size_no", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.RD_SIZE_D || {};
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

    const allRows = await RD_SIZE_D.findAll({
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
        ["size_type", "ASC"],
        ["size_no", "ASC"],
      ],
    });

    const seen = new Set();
    const distinctRows = [];
    for (const row of allRows) {
      if (!seen.has(row.size_no)) {
        seen.add(row.size_no);
        distinctRows.push(row);
      }
    }

    const total = distinctRows.length;
    const pageRows = distinctRows.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit) + 1
    );
    const hasMore = pageRows.length > parseInt(limit);
    const actualRows = hasMore ? pageRows.slice(0, limit) : pageRows;

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
  listAllRSD,
  getByID,
  getBySizeType,
  getByRdSize,
  getDropdownBySize,
  add,
  edit,
  deleteRSD,
  search,
};
