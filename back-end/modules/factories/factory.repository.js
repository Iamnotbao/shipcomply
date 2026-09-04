const QueryHelper = require("../../utils/queryHelper");
const DEPARTMENTS = require("../factory_departments/factory_deparments.model");
const FACTORY = require("./factory.model");
const pool = require("../../config/db.js");
const { Op } = require("sequelize"); 
const path = require("path");
const fs = require("fs");

async function test() {
  const [rows] = await pool.query('SELECT * FROM "Customs".get_all_users();');
  console.log("DB rows:", rows);
  return rows;
}

async function listAllFactories(limit, offset, search = "") {
  const parsedLimit = !Number.isNaN(Number.parseInt(limit, 10))
    ? Number.parseInt(limit, 10)
    : null;
  const parsedOffset = !Number.isNaN(Number.parseInt(offset, 10))
    ? Number.parseInt(offset, 10)
    : 0;
  const searchValue = typeof search === "string" ? search.trim() : "";

  const where = searchValue
    ? {
        [Op.or]: [
          { factory_code: { [Op.iLike]: `%${searchValue}%` } },
          { factory_name_e: { [Op.iLike]: `%${searchValue}%` } },
          { factory_name_l: { [Op.iLike]: `%${searchValue}%` } },
          { factory_name_t: { [Op.iLike]: `%${searchValue}%` } },
          { factory_abbreviation: { [Op.iLike]: `%${searchValue}%` } },
        ],
      }
    : {};

  const findOptions = {
    where,
    order: [["factory_code", "ASC"]],
    raw: true,
  };

  if (parsedLimit !== null) {
    findOptions.limit = Math.max(parsedLimit, 1);
    findOptions.offset = Math.max(parsedOffset, 0);
  }

  const [rows, count] = await Promise.all([
    FACTORY.findAll(findOptions),
    FACTORY.count({ where }),
  ]);

  return {
    rows,
    count,
    hasMore:
      parsedLimit !== null &&
      Math.max(parsedOffset, 0) + rows.length < count,
  };
}

async function getPosition(keys, pageSize, t) {
  try {
    const orderFields = Object.keys(keys);
    const orConditions = [];

    for (let i = 0; i < orderFields.length; i++) {
      const condition = {};
      for (let j = 0; j < i; j++) {
        condition[orderFields[j]] = keys[orderFields[j]];
      }
      condition[orderFields[i]] = { [Op.lt]: keys[orderFields[i]] };
      orConditions.push(condition);
    }

    const position = await FACTORY.count({
      where: { [Op.or]: orConditions },
      transaction: t,
    });

    const size   = parseInt(pageSize) || 10;
    const page   = Math.floor(position / size);
    const offset = page * size;

    return { position, size, page, offset };
  } catch (error) {
    console.log("Cannot calculate position", error);
    throw error;
  }
}

async function getByID(factory_code) {
  const factory = await FACTORY.findOne({
    where: { factory_code },
  });
  if (!factory) {
    console.log("No factory found!");
    return null;
  }
  return factory;
}

async function add(factory, pageSize, t) {
  try {
    const addFactory = await FACTORY.create(factory, {
      transaction: t,
      include: [{ model: DEPARTMENTS }],
    });

    const positionInfo = await getPosition(
      { factory_code: addFactory.factory_code },
      pageSize,
      t,
    );

    return { data: addFactory, ...positionInfo };
  } catch (error) {
    console.log("Cannot add factory from db", error);
    throw error;
  }
}

async function edit(existFactory, editFactory, pageSize, t) {
  try {
    const editF = await existFactory.update(editFactory, { transaction: t });

    const positionInfo = await getPosition(
      { factory_code: editF.factory_code },
      pageSize,
      t,
    );

    return { data: editF, ...positionInfo };
  } catch (error) {
    console.log("Cannot edit factory from db", error);
    throw error;
  }
}

async function deleteFac(existFactory, t) {
  try {
    return await existFactory.destroy({ transaction: t });
  } catch (error) {
    console.log("Cannot delete factory from db", error);
  }
}

async function search(keyword, limit, offset) {
  try {
    const fields = [
      "factory_code", "factory_name_e", "factory_name_l", "factory_name_t",
      "factory_address", "factory_abbreviation", "factory_tax_no",
      "status", "grt_dept", "grt_user", "grt_date", "last_user", "last_date",
    ];

    const queryHelper = new QueryHelper(keyword, { FACTORY: fields }).filter();
    const whereClause = queryHelper.whereMap.FACTORY || {};

    const parsedLimit  = !isNaN(parseInt(limit))  ? parseInt(limit)  : null;
    const parsedOffset = !isNaN(parseInt(offset)) ? parseInt(offset) : null;

    const findOptions = {
      where: whereClause,
      order: [["factory_code", "ASC"]],
    };

    if (parsedLimit !== null) {
      findOptions.limit  = parsedLimit + 1;
      findOptions.offset = parsedOffset ?? 0;
    }

    const rows = await FACTORY.findAll(findOptions);

    const hasMore   = parsedLimit !== null && rows.length > parsedLimit;
    const actualRows = hasMore ? rows.slice(0, parsedLimit) : rows;

    let total = null;
    if (parsedOffset === 0 || parsedOffset === null) {
      total = await FACTORY.count({ where: whereClause });
    }

    return {
      rows:    actualRows,
      count:   total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database cannot search the data", error);
    throw error;
  }
}

async function fetchFieldByFactory(
  factory_code,
  field = null,
  language,
  page,
  limit,
  search,
  isStatus = true,
) {
  const charset = {
    en: "E",
    zh: "T",
    vi: "L",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    language: charset[language] || "E",
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        factory_code ILIKE :search
      )
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
  sql = `
       select factory_code, 
       CASE :language 
       WHEN 'L' THEN factory_name_l
       WHEN 'T' THEN factory_name_t 
       ELSE factory_name_e
       END AS factory_name,
       factory_address
       from  "Customs".factory 
       where factory_code=:factory_code 
       ${statusCondition}
       ORDER BY factory_code
       LIMIT :limit OFFSET :offset
      `;
  countSql = `
        SELECT COUNT(DISTINCT factory_code) as total
       from  "Customs".factory  
       where factory_code=:factory_code 
          AND ${permissionCondition}
          ${statusCondition}
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
    console.error("Error in factory dropdown:", error);
    throw error;
  }
}

module.exports = {
  test,
  listAllFactories,
  getPosition,  
  getByID,
  add,
  edit,
  deleteFac,
  search,
  fetchFieldByFactory,
};