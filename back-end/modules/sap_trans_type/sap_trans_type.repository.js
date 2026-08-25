const QueryHelper = require("../../utils/queryHelper.js");
const fs = require("fs");
const SE_PAY = require("./sap_trans_type.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function getListTransType(
  factory_code, department_code, user_code, query_level,
  language, limit, offset,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code,
    limit:  parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition = "factory_code = :factory_code AND grt_dept = :department_code";
      replacements.department_code = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :user_code";
      replacements.user_code = user_code;
    }
  }
  const sql = `
    SELECT factory_code, type_no, type_name, material_out, ship_out,
           status, grt_dept, grt_user, grt_date, last_user, last_date, locked_information
    FROM "Customs".SAP_TRANS_TYPE
    WHERE ${permissionCondition}
    ORDER BY type_no
    LIMIT :limit OFFSET :offset
  `;
  const rows = await pool.query(sql, { replacements, type: pool.QueryTypes.SELECT });

  const hasMore    = rows.length > parseInt(limit);
  const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
  return { rows: actualRows, count: null, hasMore };
}
async function fetchFieldDropdown(
  factory_code,
  language,
  page,
  limit,
  search,
) {
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        pay_no ILIKE :search OR
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
  let sql;
  let countSql;

  sql = `
     SELECT 
     PAY_NO,
     CASE :p_charset
     WHEN 'L' THEN NAME_S
     WHEN 'E' THEN NAME_E 
     WHEN 'T' THEN NAME_T 
     END AS PAY_NAME  
     FROM "Customs".SE_PAY 
     WHERE FACTORY_CODE=:factory_code
      AND ${permissionCondition}
      ${searchCondition}
      limit :limit
      offset :offset
      `;
  countSql = `
        SELECT COUNT(PAY_NO) as total
      FROM "Customs".SE_PAY 
     WHERE FACTORY_CODE=:factory_code
      AND ${permissionCondition}
      ${searchCondition}
      `;

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
    console.error("Error in fetchFieldDropdown:", error);
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
async function getByID(factory_code, pay_no) {
  const acBomM = await SE_PAY.findOne({
    where: {
      factory_code: factory_code,
      pay_no: pay_no,
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
  const addItem = await SE_PAY.create(acBomM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      pay_no: addItem.pay_no,
    },
    pageSize,
    SE_PAY,
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
        pay_no: editItem.pay_no,
      },
      pageSize,
      SE_PAY,
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
  filters = {}, factory_code, department_code, user_code, query_level,
  language, limit, offset,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code,
    limit:        parseInt(limit) + 1 || 11,
    offset:       parseInt(offset) || 0,
    type_no:      filters.type_no   ? `%${filters.type_no}%`   : null,
    type_name:    filters.type_name ? `%${filters.type_name}%` : null,
    material_out: filters.material_out ?? null,
    ship_out:     filters.ship_out     ?? null,
    status:       filters.status       ?? null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition = "factory_code = :factory_code AND grt_dept = :department_code";
      replacements.department_code = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :user_code";
      replacements.user_code = user_code;
    }
  }

  const sql = `
    SELECT factory_code, type_no, type_name, material_out, ship_out,
           status, grt_dept, grt_user, grt_date, last_user, last_date, locked_information
    FROM "Customs".SAP_TRANS_TYPE
    WHERE ${permissionCondition}
      AND factory_code = :factory_code
      AND (type_no      ILIKE :type_no      OR :type_no      IS NULL)
      AND (type_name    ILIKE :type_name    OR :type_name    IS NULL)
      AND (material_out = :material_out     OR :material_out IS NULL)
      AND (ship_out     = :ship_out         OR :ship_out     IS NULL)
      AND (status       = :status           OR :status       IS NULL)
    ORDER BY type_no
    LIMIT :limit OFFSET :offset
  `;
  const countSql = `
    SELECT COUNT(*) AS total
    FROM "Customs".SAP_TRANS_TYPE
    WHERE ${permissionCondition}
      AND factory_code = :factory_code
      AND (type_no      ILIKE :type_no      OR :type_no      IS NULL)
      AND (type_name    ILIKE :type_name    OR :type_name    IS NULL)
      AND (material_out = :material_out     OR :material_out IS NULL)
      AND (ship_out     = :ship_out         OR :ship_out     IS NULL)
      AND (status       = :status           OR :status       IS NULL)
  `;

  const rows      = await pool.query(sql,      { replacements, type: pool.QueryTypes.SELECT });
  const countRows = await pool.query(countSql, { replacements, type: pool.QueryTypes.SELECT });

  const hasMore    = rows.length > parseInt(limit);
  const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
  const total      = parseInt(countRows[0]?.total);

  return { rows: actualRows, total, hasMore };
}

module.exports = {
  getListTransType,
  getByID,
  add,
  edit,
  deleteABM,
  search,
  fetchFieldDropdown
};
