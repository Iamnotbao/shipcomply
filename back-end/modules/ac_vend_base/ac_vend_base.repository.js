const QueryHelper = require("../../utils/queryHelper.js");
const AC_VEND_BASE = require("./ac_vend_base.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const { Op } = require("sequelize");

async function listAllVB(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_VEND_BASE.findAll({
      order: [
        ["factory_code", "ASC"],
        ["vend_no", "ASC"],
        ["ac_send", "ASC"],
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
  const rows = await AC_VEND_BASE.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["vend_no", "ASC"],
      ["ac_send", "ASC"],
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
async function getByID(factory_code, vend_no, ac_send) {
  const acVB = await AC_VEND_BASE.findOne({
    where: {
      factory_code: factory_code,
      vend_no: vend_no,
      ac_send: ac_send,
    },
    include: [FACTORY],
  });
  if (!acVB) {
    console.log("No AC_VEND_BASE found!");
    return null;
  }
  return acVB;
}
async function getAllAcSendByCate(
  factory_code,
  category_code,
  vend_no,
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
        vend: vend_no,
        charset: charset[language],
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit) || 0,
      };
      // if (user_code !== "admin") {
      //   if (query_level === "2" && department_code) {
      //     additionalWhere = " AND grt_dept = :dept";
      //     replacements.dept = department_code;
      //   } else if (query_level === "3" && user_code) {
      //     additionalWhere = " AND grt_user = :user";
      //     replacements.user = user_code;
      //   }
      // }
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
             FROM "Customs".ac_vend_base 
             WHERE factory_code = :factory 
               AND VEND_NO = :vend  
           )  ${additionalWhere}
               ${searchCondition}
                ${statusCondition}
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
             FROM "Customs".ac_vend_base 
             WHERE factory_code = :factory 
               AND VEND_NO = :vend
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
async function getAllVendNoByStatus(
  factory_code,
  user_code,
  department_code,
  query_level,
  charset = "E",
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
      const limitInt = parseInt(limit) || 10;
      const offsetInt = (parseInt(page) - 1) * parseInt(limit) || 0;

      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        charset: charset,
        limit: limitInt + 1,
        offset: offsetInt,
      };

      // if (user_code !== "admin") {
      //   if (query_level === "2" && department_code) {
      //     additionalWhere = " AND grt_dept = :dept";
      //     replacements.dept = department_code;
      //   } else if (query_level === "3" && user_code) {
      //     additionalWhere = " AND grt_user = :user";
      //     replacements.user = user_code;
      //   }
      // }
      let searchCondition = "";
      if (search && search.trim() !== "") {
        searchCondition = `AND (vend_no ILIKE :search)`;
        replacements.search = `%${search.trim()}%`;
      }
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
      const rows = await pool.query(
        `SELECT 
          vend_no,
          CASE 
            WHEN :charset = 'T' THEN shortnm_t
            WHEN :charset = 'E' THEN shortnm_e
            ELSE shortnm_s
          END AS NAME 
         FROM "Customs".po_vender_m
         WHERE factory_code = :factory 
           ${statusCondition} 
           ${additionalWhere}
           ${searchCondition}
         ORDER BY vend_no
         LIMIT :limit OFFSET :offset`,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );
      const hasMore = rows.length > limitInt;
      const actualRows = hasMore ? rows.slice(0, limitInt) : rows;

      let total = null;
      try {
        const countResult = await pool.query(
          `SELECT COUNT(*) as total 
             FROM "Customs".po_vender_m
             WHERE factory_code = :factory 
                ${statusCondition}  
                ${additionalWhere}
                ${searchCondition}
               `,
          {
            replacements: {
              factory: factory_code,
              dept: replacements.dept,
              user: replacements.user,
            },
            type: pool.QueryTypes.SELECT,
            transaction: t,
          },
        );
        total = parseInt(countResult[0]?.total) || 0;
      } catch (countError) {
        console.error("Error counting vendors:", countError);
        total = 0;
      }

      return {
        data: actualRows,
        total: total,
        pageSize: parseInt(limit) || 10,
        currentPage: parseInt(page) || 1,
      };
    });
  } catch (error) {
    console.error("Error in getAllVendNoByStatus:", error);
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
  acVB,
  pageSize,
  t,
) {
  const addItem = await AC_VEND_BASE.create(acVB, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      vend_no: addItem.vend_no,
      ac_send: addItem.ac_send,
    },
    pageSize,
    AC_VEND_BASE,
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
  existAcVB,
  editAcVB,
  pageSize,
  t,
) {
  try {
    const editItem = await existAcVB.update(editAcVB, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        vend_no: editItem.vend_no,
        ac_send: editItem.ac_send,
      },
      pageSize,
      AC_VEND_BASE,
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
async function deleteVB(existAcVB, t) {
  try {
    const deleteVB = await existAcVB.destroy({ transaction: t });
    return deleteVB;
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
      AC_VEND_BASE: ["vend_no", "ac_send", "status"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_VEND_BASE || {};
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
    const rows = await AC_VEND_BASE.findAll({
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
        ["vend_no", "ASC"],
        ["ac_send", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_VEND_BASE.count({
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
  listAllVB,
  getAllAcSendByCate,
  getAllVendNoByStatus,
  getByID,
  add,
  edit,
  deleteVB,
  search,
};
