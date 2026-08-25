const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_DESC_PROC = require("./ac_desc_proc.model.js");
const FACTORY = require("../factories/factory.model.js");

async function listAllAcDescProc(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  ac_no,
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
    factory_code: factory_code,
    ac_no: ac_no || null,
    p_charset: charSet[language],
    limit: parseInt(limit) + 1 || 10,
    offset: parseInt(offset) || 0,
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

  try {
    const sql = `
      SELECT 
      factory_code,
      ac_no,
      seq, 
      desc_item, 
      "Customs".gf_code_name(factory_code,'5009',desc_item,:p_charset) AS desc_itemnm, 
      ORI, 
      ADDO,
      status,
      locked_information,
      grt_user,
      grt_date,
      grt_dept,
      last_user,
      last_date
      FROM "Customs".AC_DESC_PROC 
      where ${permissionCondition}
      AND ac_no=:ac_no
      order by factory_code,ac_no,seq
      limit :limit
      offset :offset
`;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in listAllAcContDWithView:", error);
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
async function fetchSumData(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) {
  // Validate field name để tránh SQL injection
  const allowedFields = [
    "qty",
    "money",
    "tax",
    "add_tax",
    "price",
    "breadth",
    "in_qty",
    "over_qty",
    "cmoney",
    "ref_price",
  ];

  if (!allowedFields.includes(field)) {
    throw new Error(`Invalid field name: ${field}`);
  }

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    ac_no: ac_no,
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
   FROM "Customs".AC_DESC_PROC 
   WHERE ${permissionCondition} 
   AND ac_no = :ac_no
  `;

  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    return rows[0]?.total || 0;
  } catch (error) {
    console.error("Error in fetchSumData:", error);
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
    searchCondition = `AND unit ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
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
async function getByID(factory_code, ac_no, seq) {
  const acImp = await AC_DESC_PROC.findOne({
    where: {
      factory_code: factory_code,
      ac_no: ac_no,
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
        ac_no: keys.ac_no,
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
    const offset = page * size;
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
        const maxSeq = await AC_DESC_PROC.max("seq", {
      where: {
        factory_code: acImp.factory_code,
        ac_no: acImp.ac_no,
      },
      transaction: t,
    });

    const nextSeq = (maxSeq || 0) + 1;
    const addItem = await AC_DESC_PROC.create({...acImp, seq: nextSeq}, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: addItem.factory_code,
        ac_no: addItem.ac_no,
        seq: addItem.seq,
      },
      pageSize,
      AC_DESC_PROC,
      ["factory_code", "ac_no", "seq"],
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
  existAcChgD,
  editAcChgD,
  pageSize,
  t,
) {
  const editItem = await existAcChgD.update(editAcChgD, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: editItem.factory_code,
      ac_no: editItem.ac_no,
      seq: editItem.seq,
    },
    pageSize,
    AC_DESC_PROC,
    ["factory_code", "ac_no", "seq"],
    t,
    permission,
  );
  return {
    data: editItem,
    ...positionInfo,
  };
}
async function deleteImp(existAcImp, t) {
  try {
    const deleteImp = await existAcImp.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete import material tracking from db", error);
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
      AC_DESC_PROC: [
        "ac_no",
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
    const whereClause = queryHelper.whereMap.AC_DESC_PROC || {};
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
    const impSearch = await AC_DESC_PROC.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["ac_no", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllAcDescProc,
  fetchSumData,
  fetchUnitByGoodsCode,
  getByID,
  add,
  edit,
  deleteImp,
  search,
};
