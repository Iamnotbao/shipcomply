const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_IMP_MATERIAL_TRACKING = require("./ac_imp_material_tracking.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");

async function listAllImp(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  language,
  isAll = false,
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
  CONCAT(
    t.declaration_category,
    ' - ',
    COALESCE(
      CASE :charset
        WHEN 'E' THEN bd.name_e
        WHEN 'T' THEN bd.name_t
        WHEN 'L' THEN bd.name_l
        ELSE bd.name_e
      END,
      ''
    )
  ) AS declaration_category_name
FROM "Customs".ac_imp_material_tracking t
LEFT JOIN "Customs".basic_data bd
  ON bd.factory_code = t.factory_code
  AND bd.category_code = 'CDC'
  AND bd.code_no = t.declaration_category
WHERE ${permissionCondition}
ORDER BY t.factory_code ASC, t.invoice_no ASC, t.sort ASC
${isAll ? "" : "LIMIT :limit OFFSET :offset"}
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
async function getByID(factory_code, invoice_no, sort) {
  const acImp = await AC_IMP_MATERIAL_TRACKING.findOne({
    where: {
      factory_code: factory_code,
      invoice_no: invoice_no,
      sort: sort,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function getComInvoice(
  factory_code,
  field,
  value,
  department_code,
  user_code,
  query_level,
  limit = 10 ,
  page = 1,
  search ='',
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    [field]: value,
    limit: parseInt(limit) + 1,
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
  try {
     let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND (
        invoice_no ILIKE :search
      )
    `;
    replacements.search = `%${search.trim()}%`;
  }
    let sql;
    let countSql;
    if (field === "d_type") {
      sql = `
     SELECT invoice_no,
     CASE COALESCE(declaration_category, '1') 
       WHEN '1' THEN '1-Local VAT'
       WHEN '3' THEN '3-Import VN'
       WHEN '2' THEN '2-Direct Import'
       WHEN '6' THEN '其它Others'
     END AS declaration_category_name,
    sort
     FROM "Customs".ac_imp_material_tracking
    WHERE ${permissionCondition}
    AND declaration_category=:d_type 
    AND is_ac='N' 
    ${searchCondition}
    LIMIT :limit OFFSET :offset
    `;
    countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".ac_imp_material_tracking
    WHERE ${permissionCondition}
    AND declaration_category=:d_type 
    AND is_ac='N' 
    ${searchCondition}
    `;
    } else if (field === "vend_no") {
      sql = `
    SELECT COLUMN2 as invoice_no
    FROM "Customs".VW_APDUE_ALL
    WHERE (VEND_NO=:vend_no OR AC_VEND=:vend_no) 
    AND STATUS > 1 
    GROUP BY COLUMN2 ORDER BY COLUMN2
    `;
    countSql = `
    SELECT COUNT(DISTINCT COLUMN2) as total
    FROM "Customs".VW_APDUE_ALL
    WHERE (VEND_NO=:vend_no OR AC_VEND=:vend_no) 
    AND STATUS > 1 
    GROUP BY COLUMN2 ORDER BY COLUMN2
    `;
    }
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
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getCol4Dropdown(
  factory_code,
  field,
  value,
  invoice_no,
  department_code,
  user_code,
  query_level,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    invoice_no: invoice_no,
    [field]: value,
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
  try {
    let sql;
    sql = `
    SELECT invoice_id 
    FROM "Customs".VW_APDUE_ALL
    WHERE (VEND_NO=:vend_no OR AC_VEND=:vend_no) 
    AND column2 = :invoice_no
    AND STATUS > 1 
    LIMIT 1
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    if (rows.length === 0) return [];
    const newItem = rows[0];
    return newItem;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getSortData(
  factory_code,
  com_invoice,
  department_code,
  user_code,
  query_level,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    com_invoice: com_invoice,
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
    SELECT sort 
    FROM "Customs".ac_imp_material_tracking 
    WHERE ${permissionCondition}
    AND invoice_no= :com_invoice 
    AND is_ac='N' 
    LIMIT 1;
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const newItem = rows[0];
    return newItem;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getFieldDropDown(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  com_invoice,
  sort,
  page,
  limit,
  search,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    com_invoice: com_invoice,
    sort: sort,
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
  let sql;
  let countSql;
  if (field) {
    sql = `
       SELECT ${field} FROM "Customs".ac_imp_material_tracking 
       WHERE 
       factory_code=:factory_code 
       AND invoice_no=:com_invoice 
       AND sort=:sort
       AND ${permissionCondition}
       ${searchCondition}
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(*) as total
        FROM "Customs".ac_imp_material_tracking 
       WHERE 
       factory_code=:factory_code 
       AND invoice_no=:com_invoice 
       AND sort=:sort
       AND ${permissionCondition}
       ${searchCondition}
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
async function getPosition(id, pageSize, t, permission) {
  try {
    const position = await AC_IMP_MATERIAL_TRACKING.count({
      where: {
        invoice_no: {
          [Op.lt]: id,
        },
        ...permission,
      },
      transaction: t,
    });

    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return {
      position,
      size,
      page,
      offset,
    };
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
  acImp,
  pageSize,
  t,
) {
  try {
    const addItem = await AC_IMP_MATERIAL_TRACKING.create(acImp, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );

    const positionInfo = await getPosition(
      addItem.invoice_no,
      pageSize,
      t,
      permission,
    );
    return {
      data: addItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add ac imp tracking from db", error);
    throw error;
  }
}
async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existAcImp,
  editAcImp,
  pageSize,
  t,
) {
  try {
    const editItem = await existAcImp.update(editAcImp, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editItem.invoice_no,
      pageSize,
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
  limit,
  offset,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      AC_IMP_MATERIAL_TRACKING: [
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
    const whereClause = queryHelper.whereMap.AC_IMP_MATERIAL_TRACKING || {};
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
    const rows = await AC_IMP_MATERIAL_TRACKING.findAll({
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
        ["invoice_no", "ASC"],
        ["sort", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_IMP_MATERIAL_TRACKING.count({
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
  listAllImp,
  getByID,
  getFieldDropDown,
  getSortData,
  getComInvoice,
  getCol4Dropdown,
  add,
  edit,
  deleteImp,
  search,
};
