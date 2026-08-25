const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_ISSUE_MATD_T = require("./ac_issue_matd_t.model.js");
const FACTORY = require("../factories/factory.model.js");

async function listOfAcIssueMatdT(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_no,
  language,
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code,
      conf_seq: conf_seq,
      matd_no: matd_no,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "grt_dept = :permission_dept AND factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        factory_code,
        conf_seq,
        matd_seq,
        matd_no,
        prod_no,
        "Customs".GF_ACPROD_NAME(factory_code, prod_no, :p_charset) AS prod_name,
        req_issue,
        unit_qty,
        req_qty,
        issue_qty,
        remark,
        grt_user,
        grt_date,
        grt_dept,
        last_user,
        last_date,
        status,
        locked_information
      FROM "Customs".ac_issue_matd_t
      WHERE
        ${permissionCondition}
        AND conf_seq = :conf_seq
        AND matd_no = :matd_no
      ORDER BY matd_seq ASC
      LIMIT :limit
      OFFSET :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return {
      rows: actualRows,
      count: null,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error fetching AC_ISSUE_MATD_T:", error);
    throw error;
  }
}
async function listAllAcProcDWithView(
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
      AC_ITEMNO,
      "Customs".GF_AC_ITEMNAME(FACTORY_CODE,AC_ITEMNO,:p_charset) AS ITEM_NAME,
      --"Customs".GF_AC_ITEM_M_AC_ITEM(FACTORY_CODE,AC_ITEMNO),
      REF_PRICE,
      PRICE,
      MONEY,
      BREADTH,
      AC_QTY,
      "Customs".GF_AC_ITEMUNIT(FACTORY_CODE,AC_ITEMNO) AS UNIT,
      "Customs".GF_CODE_NAME(FACTORY_CODE,'1108',"Customs".GF_AC_ITEMUNIT(FACTORY_CODE,AC_ITEMNO),:p_charset) AS unitnm,
      RB_MONEY, 
      TAX_RATE,
      TAX,
      grt_date,
      grt_user,
      grt_dept,
      last_date,
      last_user,
      status,
      locked_information
    FROM "Customs".AC_ISSUE_MATD_T 
    where 
    ${permissionCondition}
     AND AC_NO=:ac_no
    order by SEQ,AC_ITEMNO
      LIMIT :limit
      OFFSET :offset
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
    console.error("Error in listAllAcProcDWithView:", error);
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
async function listAllAcProcDWithViewMarkB(
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
    limit: parseInt(limit) || 10,
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
      SEQ,
      AC_ITEMNO,
     "Customs".GF_AC_ITEMNAME(factory_code, ac_itemno, :p_charset) AS ITEM_NAME,
      AC_ITEM,
      REF_PRICE,
      MONEY,
      AC_QTY,
      "Customs".GF_CODE_NAME(
         factory_code,
          '1105',
          "Customs".GF_AC_ITEMUNIT(factory_code,ac_itemno),
          :p_charset
      ) AS UNIT_NAME,
      PRICE,
      RB_MONEY,
      TAX_RATE,
      TAX,
      IN_CRATE,
      grt_dept,
      grt_date,
      grt_user,
      last_user,
      last_date,
      status,
      locked_information
      FROM "Customs".AC_ISSUE_MATD_T
      WHERE 
    ${permissionCondition}
    AND AC_NO=:ac_no
    order by SEQ,AC_ITEMNO
      LIMIT :limit
      OFFSET :offset
`;
    const countSql = `
      SELECT COUNT(*) as total
      FROM "Customs".AC_ISSUE_MATD_T 
    where 
    ${permissionCondition}
    AND AC_NO=:ac_no 
    `;

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
      rows: rows,
      count: total,
      hasMore: rows.length >= limit,
    };
  } catch (error) {
    console.error("Error in listAllAcProcDWithView:", error);
    throw error;
  }
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
   FROM "Customs".AC_ISSUE_MATD_T 
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
async function getByID(factory_code, conf_seq, matd_seq) {
  const acImp = await AC_ISSUE_MATD_T.findOne({
    where: {
      factory_code: factory_code,
      conf_seq: conf_seq,
      matd_seq: matd_seq,
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
      if (field === "matd_seq") {
        orderClause.push(["matd_seq", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        conf_seq: keys.conf_seq,
        ...permission,
      },
      attributes: Object.keys(keys),
      order: orderClause,
      raw: true,
      transaction: t,
    });
    const position = allRecords.findIndex((r) =>
      Object.keys(keys).every((key) => {
        const recordValue = r[key];
        const keyValue = keys[key];

        if (typeof recordValue === "string" && typeof keyValue === "string") {
          return (
            recordValue.trim().toLowerCase() === keyValue.trim().toLowerCase()
          );
        }

        if (typeof recordValue === "number" || typeof keyValue === "number") {
          return Number(recordValue) === Number(keyValue);
        }

        return recordValue === keyValue;
      }),
    );

    if (position === -1) {
      console.warn("⚠️ Position not found for keys:", keys);
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
    console.error("❌ Cannot calculate position:", error);
    return {
      position: 0,
      size: parseInt(pageSize) || 10,
      page: 0,
      offset: 0,
    };
  }
}

async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existAcProcD,
  editAcProcD,
  pageSize,
  t,
) {
  const editItem = await existAcProcD.update(editAcProcD, { transaction: t });
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
    AC_ISSUE_MATD_T,
    ["matd_seq"],
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
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
) {
  const replacements = {
    user_code,
    conf_seq,
    matd_seq,
    factory_code,
  };
  let permissionCondition = "1=1";
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition = "grt_dept = :permission_dept AND factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  try {
    const transaction = await pool.transaction();

    // Update ac_chg_d
    await pool.query(
      `UPDATE "Customs".ac_chk_t 
       SET status = 7, last_user = :user_code, last_date = NOW()
       WHERE factory_code = :factory_code 
       AND matd_seq = :matd_seq 
       AND conf_seq = :conf_seq 
       AND status = 1 
       AND ${permissionCondition}`,
      { replacements, type: pool.QueryTypes.UPDATE, transaction },
    );

    await transaction.commit();
    return { success: true, message: "Confirmed successfully" };
  } catch (error) {
    await transaction.rollback();
    console.log("Error when confirm", error);
    throw error;
  }
}
async function search(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
) {
  try {
    let permissionCondition = "1=1";
    const charset = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code || null,
      conf_seq: filters.conf_seq || null,
      matd_no: filters.matd_no || null,
      prod_no: filters.prod_no || null,
      req_issue: filters.req_issue || null,
      p_charset: charset[filters.language] || "E",
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "grt_dept = :permission_dept AND factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT 
        factory_code,
        conf_seq,
        matd_seq,
        prod_no,
        "Customs".GF_ACPROD_NAME(factory_code, prod_acno, :p_charset) AS prod_name,
        req_issue,
        unit_qty,
        req_qty,
        issue_qty,
        remark
      FROM "Customs".ac_issue_matd_t
      WHERE
        ${permissionCondition} AND
        factory_code = :factory_code AND
        (:conf_seq IS NULL OR conf_seq = :conf_seq) AND
        (:matd_no IS NULL OR matd_no LIKE '%' || :matd_no || '%') AND
        (:prod_no IS NULL OR prod_no LIKE '%' || :prod_no || '%') AND
        (:req_issue IS NULL OR req_issue = :req_issue)
      ORDER BY matd_seq ASC
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    return { rows };
  } catch (error) {
    console.error("Error searching AC_ISSUE_MATD_T:", error);
    throw error;
  }
}
module.exports = {
  listOfAcIssueMatdT,
  listAllAcProcDWithView,
  listAllAcProcDWithViewMarkB,
  fetchSumData,
  fetchUnitByGoodsCode,
  getByID,
  edit,
  deleteImp,
  search,
  confirm
};
