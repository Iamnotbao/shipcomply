const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_CONT_D = require("./ac_cont_d.model.js");
const FACTORY = require("../factories/factory.model.js");

async function listAllAcContD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await AC_CONT_D.findAll({
      order: [["invoice_no", "ASC"]],
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
  return await AC_CONT_D.findAll({
    where: whereClause,
    order: [["invoice_no", "ASC"]],
  });
}

async function listAllAcContDWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = en,
  cont_no,
  limit,
  offset,
) {
  let charSet = {
    vi: "S",
    en: "E",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    cont_no: cont_no || null,
    p_charset: charSet[language],
    limit: parseInt(limit) + 1,
    offset: parseInt(offset),
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "d.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "m.grt_dept = :permission_dept AND d.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "m.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  try {
    const sql = `
        SELECT DISTINCT
          d.factory_code,
          d.seq,
          d.goods_code,
          d.cont_no,
          d.grt_dept,
          d.grt_user,
          d.grt_date,
          d.last_user,
          d.last_date,
          "Customs".GF_AC_ITEMNAME(d.factory_code, d.goods_code, :p_charset) AS goods_name,
          "Customs".gf_ac_itemunit(d.factory_code, d.goods_code) AS unit_code,
          "Customs".GF_CODE_NAME(
            d.factory_code,
            '1108',
            "Customs".gf_ac_itemunit(d.factory_code, d.goods_code),
            :p_charset
          ) AS unit_name,
          d.cont_qty,
          d.cont_price,
          d.used_qty,
          d.stock_qty,
          d.status,
          d.locked_information
        FROM "Customs".ac_cont_d d
        INNER JOIN "Customs".vw_cont_imp m
          ON d.factory_code = m.factory_code
          AND d.cont_no = :cont_no
        WHERE
          ${permissionCondition} AND
          m.cont_type = '1'
        ORDER BY d.cont_no, d.seq
        LIMIT :limit
        OFFSET :offset
`;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    let total = null;
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("error", error);
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
async function fetchDropdownGoodsCode(
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };
  console.log("cho do ", replacements);

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `AND item_acno ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  const sql = `
    SELECT DISTINCT item_acno
    FROM "Customs".ac_item_m
    WHERE factory_code = :factory_code
      AND ${permissionCondition}
      ${searchCondition}
      ${statusCondition}
    ORDER BY item_acno ASC
    LIMIT :limit
    OFFSET :offset
  `;
  const countSql = `
    SELECT COUNT(DISTINCT item_acno) as total
    FROM "Customs".ac_item_m
    WHERE factory_code = :factory_code
      AND ${permissionCondition}
      ${searchCondition}
      ${statusCondition}
  `;
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in good codes list:", error);
    throw error;
  }
}
async function fetchUnitByGoodsCode(
  factory_code,
  department_code,
  user_code,
  query_level,
  goods_code,
  page,
  limit,
  search,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    goods_code: goods_code,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `unit ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }
   const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  const sql = `
       Select "Customs".GF_AC_ITEMunit(:factory_code,:goods_code) as unit 
      `;
  const countSql = `
  SELECT COUNT(*) as total
  FROM (
    SELECT "Customs".GF_AC_ITEMunit(:factory_code, :goods_code) as unit
  ) as subquery
  ${searchCondition}
`;
  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in unit list by good codes:", error);
    throw error;
  }
}
async function fetchDropdownGoodsCodeWithFunction(
  factory_code,
  cont_no,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  mark = "A",
) {
  const chartset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cont_no: cont_no,
    language: chartset[language] || "E",
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
    searchCondition = `AND goods_code ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }
  let sql, countSql;
  if (mark === "A") {
    sql = `
   SELECT cont_no,seq,goods_code,"Customs".gf_ac_itemname(:factory_code,'goods_code',:language) as itemnm
    FROM "Customs".ac_cont_d 
    WHERE ${permissionCondition}
    AND cont_no =:cont_no
    ${searchCondition}
    order by goods_code
    LIMIT :limit
    OFFSET :offset
  `;
    countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".ac_cont_d 
    WHERE 
      ${permissionCondition}
      AND cont_no =:cont_no
      ${searchCondition}
  `;
  } else {
    sql = `
      SELECT 
        ITEM_ACNO,
        CASE :language 
          WHEN 'E' THEN NAME_E 
          WHEN 'T' THEN NAME_T 
          WHEN 'L' THEN NAME_S
          ELSE NAME_E 
        END AS itemnm,
        UNIT,
        AC_ITEM
      FROM "Customs".AC_ITEM_M
      WHERE 
        ${permissionCondition}
        ${searchCondition}
      ORDER BY ITEM_ACNO
      LIMIT :limit
      OFFSET :offset
`;
    countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".ac_cont_d 
    WHERE 
      ${permissionCondition}
      ${searchCondition}
  `;
  }

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in good codes list:", error);
    throw error;
  }
}
async function fetchContPriceDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  item_acno,
  min_cont,
  page,
  limit,
  search,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    item_acno: item_acno,
    min_cont: min_cont,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `AND cont_price = :search`;
    replacements.search = `${parseInt(search)}`;
  }
  const sql = `
      SELECT cont_no,seq,cont_price as price 
      FROM "Customs".ac_cont_d 
      WHERE  ${permissionCondition} 
      AND cont_no = :min_cont 
      AND goods_code = :item_acno 
      ${searchCondition}
      limit :limit 
      offset :offset
      `;
  const countSql = `
     SELECT COUNT(*) as total
      FROM "Customs".ac_cont_d 
      WHERE  ${permissionCondition} 
      AND cont_no = :min_cont 
      AND goods_code = :item_acno 
      ${searchCondition};
`;
  try {
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return {
      data: rows,
      total: total,
      pageSize: parseInt(limit) || 10,
      currentPage: parseInt(page) || 1,
    };
  } catch (error) {
    console.error("Error in unit list by good codes:", error);
    throw error;
  }
}
async function getByID(factory_code, cont_no, seq) {
  const acImp = await AC_CONT_D.findOne({
    where: {
      factory_code: factory_code,
      cont_no: cont_no,
      seq: seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "seq") {
        orderClause.push(["seq", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        cont_no: keys.cont_no,
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
    const offset = parseInt(page * size);
    return { position, size, page, offset };
  } catch (error) {
    console.error(" Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acImp,
  pageSize,
  t,
) {
  try {
    const maxSeq = await AC_CONT_D.max("seq", {
      where: {
        factory_code: acImp.factory_code,
        cont_no: acImp.cont_no,
      },
      transaction: t,
    });

    const nextSeq = (maxSeq || 0) + 1;
    const addItem = await AC_CONT_D.create(
      {
        ...acImp,
        seq: nextSeq,
      },
      { transaction: t },
    );
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: addItem.factory_code,
        cont_no: addItem.cont_no,
        seq: addItem.seq,
      },
      pageSize,
      AC_CONT_D,
      ["factory_code", "cont_no", "seq"],
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
  existAcContD,
  editAcContD,
  pageSize,
  t,
) {
  const editItem = await existAcContD.update(editAcContD, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: editItem.factory_code,
      cont_no: editItem.cont_no,
      seq: editItem.seq,
    },
    pageSize,
    AC_CONT_D,
    ["factory_code", "cont_no", "seq"],
    t,
    permission,
  );
  return {
    data: editItem,
    ...positionInfo,
  };
}
async function deleteItem(existAcImp, t) {
  try {
    const deleteImp = await existAcImp.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete import material tracking from db", error);
  }
}
async function fetchSumData(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
) {

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cont_no: cont_no,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "grt_dept = :permission_dept AND factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  // Inject field name trực tiếp vào SQL (đã validate ở trên)
  const sql = `
   SELECT SUM(COALESCE(${field}, 0)) as total
   FROM "Customs".ac_cont_d 
   WHERE ${permissionCondition} 
   AND cont_no = :cont_no
   AND status > 0
  `;

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    return parseFloat(rows[0]?.total || 0).toFixed(4);
  } catch (error) {
    console.error("Error in fetchSumData:", error);
    throw error;
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
      AC_CONT_D: [
        "invoice_no",
        "declaration_category",
        "actual_delivery_date",
        "actual_delivery_date",
        "estimated_delivery_date",
        "loading_way",
        "declaration_retrieve_date",
        "record_date",
        "sort",
        "status",
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_CONT_D || {};
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
    const impSearch = await AC_CONT_D.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["invoice_no", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllAcContD,
  listAllAcContDWithView,
  fetchDropdownGoodsCode,
  fetchDropdownGoodsCodeWithFunction,
  fetchUnitByGoodsCode,
  fetchContPriceDropdown,
  getByID,
  add,
  edit,
  deleteItem,
  search,
  fetchSumData
};
