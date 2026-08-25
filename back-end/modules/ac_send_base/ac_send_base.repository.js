const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_SEND_BASE = require("./ac_send_base.model.js");
const AC_VEND_BASE = require("../ac_vend_base/ac_vend_base.model.js");
const FACTORY = require("../factories/factory.model.js");
const AC_ITEM_M = require("../ac_item_m/ac_item_m.model.js");
const { Op, literal } = require("sequelize");



async function listAllSB(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  language,
) {
  try {
     const charset = {
      en: "E",
      zh: "T",
      vi: "L",
    };
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
      charset: charset[language] || "E",
    };
   
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "t.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "t.grt_dept = :permission_dept AND t.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "t.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
  SELECT
  t.*,
  CONCAT(t.ac_type, ' - ', COALESCE(
    CASE :charset WHEN 'E' THEN bd1.name_e WHEN 'T' THEN bd1.name_t WHEN 'L' THEN bd1.name_l ELSE bd1.name_e END, ''
  )) AS ac_type_name,
  CONCAT(t.stoc_type, ' - ', COALESCE(
    CASE :charset WHEN 'E' THEN bd2.name_e WHEN 'T' THEN bd2.name_t WHEN 'L' THEN bd2.name_l ELSE bd2.name_e END, ''
  )) AS stoc_type_name,
  CONCAT(t.sales_type, ' - ', COALESCE(
    CASE :charset WHEN 'E' THEN bd3.name_e WHEN 'T' THEN bd3.name_t WHEN 'L' THEN bd3.name_l ELSE bd3.name_e END, ''
  )) AS sales_type_name
FROM "Customs".ac_send_base t
LEFT JOIN "Customs".basic_data bd1
  ON bd1.factory_code = t.factory_code AND bd1.category_code = 'CDC' AND bd1.code_no = t.ac_type
LEFT JOIN "Customs".basic_data bd2
  ON bd2.factory_code = t.factory_code AND bd2.category_code = 'STOC_TYPE' AND bd2.code_no = t.stoc_type  
LEFT JOIN "Customs".basic_data bd3
  ON bd3.factory_code = t.factory_code AND bd3.category_code = 'SALES_TYPE' AND bd3.code_no = t.sales_type 
WHERE ${permissionCondition}
ORDER BY t.factory_code ASC, t.ac_send ASC
LIMIT :limit OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return { rows: actualRows, count: null, hasMore };
  } catch (error) {
    console.error("Error in listAllImp:", error);
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
async function listAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
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

  return await AC_SEND_BASE.findAll({
    where: whereClause,
    include: [
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_SEND_BASE"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_SEND_BASE"."item_acno" = "ITEM_ACNO"."item_acno"'),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [["ac_send", "ASC"]],
  });
}
async function getAllAcSendByCate(
  factory_code,
  category_code,
  user_code,
  department_code,
  query_level,
  language = "E",
  page,
  limit,
  search,
  isStatus = true,
) {
  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      let charset = {
        en: "E",
        zh: "T",
        vi: "L",
      };
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        category: category_code,
        charset: charset[language],
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit) || 0,
      };
      console.log("dawkjdaw", page, limit, search);

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      let searchCondition = "";
      if (search && search.trim() !== "") {
        searchCondition = `
      AND (
        code_no ILIKE :search
      )
    `;
        replacements.search = `%${search.trim()}%`;
      }
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
      const rows = await pool.query(
        `SELECT 
          CODE_NO,
          CASE 
            WHEN :charset = 'T' THEN name_t
            WHEN :charset = 'E' THEN name_e
            ELSE name_l
          END AS NAME 
         FROM "Customs".basic_data
         WHERE factory_code = :factory 
           AND category_code = :category 
           AND code_no NOT IN (
             SELECT AC_SEND 
             FROM "Customs".ac_send_base
             WHERE factory_code = :factory 
           )
          ${statusCondition}
          ${additionalWhere}
          ${searchCondition}
         ORDER BY CODE_NO
         limit :limit offset :offset
         `,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );
      let total = null;
      const countResult = await pool.query(
        `SELECT COUNT(*) as total 
         FROM "Customs".basic_data
         WHERE factory_code = :factory 
           AND category_code = :category 
           AND code_no NOT IN (
             SELECT AC_SEND 
             FROM "Customs".ac_send_base
             WHERE factory_code = :factory 
           )
              ${statusCondition}
               ${additionalWhere}
               ${searchCondition}
               `,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );
      total = parseInt(countResult[0]?.total) || 0;
      return {
        data: rows,
        total: total,
        pageSize: parseInt(limit) || 10,
        currentPage: parseInt(page) || 1,
      };
    });
  } catch (error) {
    console.error("Error in getAllAcSendByCate:", error);
    throw error;
  }
}
async function getAllTypeByCate(
  factory_code,
  category_code,
  user_code,
  department_code,
  query_level,
  language = "E",
  page,
  limit,
  search,
  isStatus = true,
) {
  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      let charset = {
        en: "E",
        zh: "T",
        vi: "L",
      };
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        category: category_code,
        charset: charset[language],
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit) || 0,
      };
      console.log("page and limit", page, limit);

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      let searchCondition = "";
      if (search && search.trim() !== "") {
        searchCondition = `
      AND (
        code_no ILIKE :search
      )
    `;
        replacements.search = `%${search.trim()}%`;
      }
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
      const rows = await pool.query(
        `SELECT 
          CODE_NO,
          CASE 
            WHEN :charset = 'T' THEN name_t
            WHEN :charset = 'E' THEN name_e
            ELSE name_l
          END AS NAME 
         FROM "Customs".basic_data
         WHERE factory_code = :factory 
           AND category_code = :category 
           ${statusCondition}
           ${additionalWhere}
           ${searchCondition}
         ORDER BY CODE_NO
         limit :limit offset :offset
         `,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );
      let total = null;
      const countResult = await pool.query(
        `SELECT COUNT(*) as total 
         FROM "Customs".basic_data
         WHERE factory_code = :factory 
           AND category_code = :category 
               ${statusCondition}
               ${additionalWhere}
               ${searchCondition}
               `,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );
      total = parseInt(countResult[0]?.total) || 0;
      return {
        data: rows,
        total: total,
        pageSize: parseInt(limit) || 10,
        currentPage: parseInt(page) || 1,
      };
    });
  } catch (error) {
    console.error("Error in getAllAcSendByCate:", error);
    throw error;
  }
}
async function getFieldDropDown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  d_type,
  page,
  limit,
  search,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    d_type: d_type,
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
    searchCondition = `
      AND (${field} ILIKE :search)
    `;
    replacements.search = `%${search.trim()}%`;
  }
   const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
  let sql;
  let countSql;
  if (field) {
    sql = `
      SELECT ${field} 
      FROM "Customs".ac_send_base 
      WHERE ${permissionCondition}
       ${searchCondition}
      AND ac_type=:d_type
      ${statusCondition}
      limit :limit
      offset :offset
      `;
    countSql = `
        SELECT COUNT(*) as total
        FROM "Customs".ac_send_base  
       WHERE ${permissionCondition}
       ${searchCondition}
      AND ac_type=:d_type
      `;
  }
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const totalResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const total = parseInt(totalResult[0]?.total || 0);
    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in fetchFieldDropDown:", error);
    throw error;
  }
}
async function getByID(factory_code, ac_send) {
  const acImp = await AC_SEND_BASE.findOne({
    where: {
      factory_code: factory_code,
      ac_send: ac_send,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
    ],
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}
async function getByItemNo(item_no) {
  const acImp = await AC_SEND_BASE.findAll({
    where: {
      item_no: item_no,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
      //  Include BASIC_DATA_CATEGORY - Composite key với literal
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_SEND_BASE"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_SEND_BASE"."item_acno" = "ITEM_ACNO"."item_acno"'),
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
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      item_acno: item_acno,
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
    const acItemRef = await AC_SEND_BASE.findAll({
      where: whereClause,
      order: [["item_no", "ASC"]],
    });

    return acItemRef;
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
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acSB,
  pageSize,
  t,
) {
  const addItem = await AC_SEND_BASE.create(acSB, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      ac_send: addItem.ac_send,
    },
    pageSize,
    AC_SEND_BASE,
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
  existAcSB,
  editAcSB,
  pageSize,
  t,
) {
  try {
    const editSB = await existAcSB.update(editAcSB, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editSB.factory_code,
        ac_send: editSB.ac_send,
      },
      pageSize,
      AC_SEND_BASE,
      t,
      permission,
    );
    return { data: editSB, ...positionInfo };
  } catch (error) {
    console.log("Cannot edit ac item ref from db", error);
  }
}
async function deleteSB(existAcSB, t) {
  try {
    const deleteAcSB = await existAcSB.destroy({ transaction: t });
    return deleteAcSB;
  } catch (error) {
    console.log("Cannot delete ac item ref from db", error);
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
      AC_SEND_BASE: ["item_no", "item_unit", "formula", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_SEND_BASE || {};
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
    const rows = await AC_SEND_BASE.findAll({
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
        ["ac_send", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_SEND_BASE.count({
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
  listAllSB,
  listAllWithItemAcno,
  getAllAcSendByCate,
  getAllTypeByCate,
  getFieldDropDown,
  getByID,
  getByItemAcno,
  getByItemNo,
  add,
  edit,
  deleteSB,
  search,
};
