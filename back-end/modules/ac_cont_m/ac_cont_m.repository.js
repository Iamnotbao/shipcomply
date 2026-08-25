// ac_cont_m.repository.js
const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_CONT_M = require("./ac_cont_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");

async function listAllAcContM(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await AC_CONT_M.findAll({
      order: [["cont_no", "ASC"]],
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
  return await AC_CONT_M.findAll({
    where: whereClause,
    order: [["cont_no", "ASC"]],
  });
}
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) {
  const replacements = {
    factory_code: factory_code,
    user_code: user_code,
    cont_no: cont_no,
  };
  let permissionCondition = "1=1";
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
  const transaction = await pool.transaction();
  const sql = `
    UPDATE "Customs".ac_cont_d
    SET status = 7, last_user = :user_code, last_date = now()
    WHERE cont_no = :cont_no and status = 1 
      AND ${permissionCondition}
  `;
  await pool.query(sql, {
    replacements,
    type: pool.QueryTypes.SELECT,
    transaction,
  });

  const updateSumSql = `
    UPDATE "Customs".ac_cont_m
    SET sum_money = money,
        sum_qty = qty from
        (select  SUM(COALESCE(cont_money,0)) as money ,
        SUM(COALESCE(cont_qty,0)) as qty 
        from "Customs".ac_cont_d 
        where factory_code = :factory_code
        and cont_no = :cont_no
      ) as temp
    WHERE
      factory_code = :factory_code 
    AND cont_no = :cont_no 
      AND ${permissionCondition}
  `;
  try {
    await pool.query(updateSumSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      message: "Confirmed successfully!",
    };
  } catch (error) {
    console.log("Error when confirm all", error);
    await transaction.rollback();
    return {
      success: false,
      message: "Error when confirm all",
    };
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
async function listAllAcContMWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
) {
  let charSet = {
    vi: "S",
    en: "E",
    zh: "T",
  };
  let permissionCondition = "1=1";
  let replacements = {
    p_charset: charSet[language],
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "m.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "m.grt_dept = :permission_dept AND m.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "m.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  const sql = `
    SELECT 
      m.factory_code,
      m.cont_no,
      m.cont_type,
      m.issued_date,
      m.expire_date,
      m.last_edate,
      m.vend_no,
      m.seller,
      m.buyer,
      m.sum_qty,
      m.sum_money,
      m.currency,
      m.status,
      m.locked_information,
      "Customs".GF_CODE_NAME(
        m.factory_code, 
        'CONT_TYPE', 
        m.cont_type, 
        :p_charset
      ) AS cont_type_name,
      "Customs".GF_CODE_NAME(
        m.factory_code, 
        'CURRENCY', 
        m.currency, 
        :p_charset
      ) AS currency_name
    FROM "Customs".ac_cont_m m
    WHERE 
      ${permissionCondition}
    ORDER BY m.cont_no ASC
  `;

  const rows = await pool.query(sql, {
    replacements,
    type: pool.QueryTypes.SELECT,
  });

  return { rows };
}

async function getByID(factory_code, cont_no) {
  console.log("grtata", factory_code, cont_no);

  const acContM = await AC_CONT_M.findOne({
    where: {
      factory_code: factory_code,
      cont_no: cont_no,
    },
    include: [FACTORY],
  });
  if (!acContM) {
    console.log("No contract master found!");
    return null;
  }
  return acContM;
}
async function getPosition(cont_no, pageSize, t, permission, cont_type = "1") {
  try {
    const position = await AC_CONT_M.count({
      where: {
        cont_no: {
          [Op.lt]: cont_no,
        },
        cont_type: cont_type,
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

async function fetchFieldByPoVenderM(
  factory_code,
  department_code,
  user_code,
  query_level,
  field = null,
  category_code,
  vend_no,
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
    category_code: category_code,
    vend_no: vend_no || null,
    language: charset[language] || "E",
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
    const searchFields = [];
    // Chỉ thêm field nào tồn tại trong query đang dùng
    if (field === "vend_no") {
      searchFields.push("vend_no ILIKE :search");
    } else {
      // Với các field khác, chỉ search trên field đó
      searchFields.push(`${field} ILIKE :search`);
    }

    if (searchFields.length > 0) {
      searchCondition = `AND (${searchFields.join(" OR\n        ")})`;
      replacements.search = `%${search.trim()}%`;
    }
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `AND status = '7'`;
  }
  console.log("thay gia ba", isStatusBool);
  let sql;
  let countSql;
  if (field === "vend_no") {
    sql = `
        SELECT DISTINCT 
          vend_no,
          "Customs".GF_VEND_FULLNM(FACTORY_CODE,VEND_NO,:language)AS vend_name,
          vend_no as code_no,
          fullnm_e as FULLNM_E,
          address_e as ADDRESS_E,
          pay_cur as PAY_CUR,
          pay_no as PAY_NO
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND ${permissionCondition}
          ${searchCondition}
          ${statusCondition}
        ORDER BY vend_no ASC
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(DISTINCT vend_no) as total
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND ${permissionCondition}
          ${searchCondition}
          ${statusCondition}
      `;
  } else if (isStatusBool && field !== "vend_no") {
    sql = `
        SELECT DISTINCT ${field} as code_no
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND ${permissionCondition}
          ${searchCondition}
          ${statusCondition}
        ORDER BY ${field} ASC
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(DISTINCT ${field}) as total
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND ${permissionCondition}
          ${searchCondition}
          ${statusCondition}
      `;
  } else if (!isStatusBool && field !== "vend_no") {
    sql = `
        SELECT DISTINCT ${field} as code_no
        FROM "Customs".po_vender_m
        WHERE 
        factory_code = :factory_code
      AND ${permissionCondition}
        AND vend_no = :vend_no
        ${searchCondition}
        ${statusCondition}
        ORDER BY ${field} ASC
        LIMIT :limit
        OFFSET :offset
      `;
    countSql = `
        SELECT COUNT(DISTINCT ${field}) as total
        FROM "Customs".po_vender_m
        WHERE factory_code = :factory_code
          AND ${permissionCondition}
          ${searchCondition}
          ${statusCondition}
      `;
  } else {
    sql = `
      SELECT code_no 
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
      LIMIT :limit
      OFFSET :offset
    `;

    countSql = `
      SELECT COUNT(*) as total
      FROM "Customs".basic_data 
      WHERE category_code = :category_code
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
    console.error("Error in fetchFieldByPoVenderM:", error);
    throw error;
  }
}
async function fetchBankParameter(factory_code, field, page, limit, search) {
  let sql;
  let replacements = {
    factory_code: factory_code,
  };
  if (field === "bank") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','10') AS bank
    `;
  } else if (field === "bank_ic") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','12') AS bank_ic 
    `;
  } else if (field === "bank_addr") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','11') AS bank_addr
    `;
  } else if (field === "org_tax") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','7') AS org_tax
    `;
  } else if (field === "ac_unit") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','8') AS ac_unit
    `;
  } else if (field === "ac_addr") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','9') AS ac_addr
    `;
  } else if (field === "lic_date") {
    sql = ` SELECT TO_DATE(
            "Customs".GF_PARAM_VALUE(:factory_code, 'AC', '5'),
            'MM/DD/YYYY'
        ) AS lic_date
    `;
  } else if (field === "lic_edate") {
    sql = ` SELECT TO_DATE(
            "Customs".GF_PARAM_VALUE(:factory_code, 'AC', '6'),
            'MM/DD/YYYY'
        ) AS lic_edate
    `;
  } else if (field === "license") {
    sql = `SELECT "Customs".GF_PARAM_VALUE(:factory_code,'AC','4') AS license
    `;
  } else {
    return [];
  }
  try {
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    if (!rows || rows.length === 0) {
      return [];
    }
    const firstRow = rows[0];
    const value =
      firstRow[field] ||
      firstRow.bank ||
      firstRow.bank_ic ||
      firstRow.bank_addr;

    if (!value || value === null) {
      return [];
    }
    return rows;
  } catch (error) {
    console.error(`Error fetching bank parameter for field ${field}:`, error);
    return [];
  }
}
async function fetchBigContNo(factory_code, gridData, page, limit, search) {
  const replacements = {
    factory_code: gridData?.factory_code || factory_code,
    vend_no: gridData?.vend_no,
    issued_date: gridData?.issued_date,
    expire_date: gridData?.expire_date,
    d_type: gridData?.d_type,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  console.log("fetchBigContNo params:", replacements);

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND cont_no ILIKE :search
    `;
    replacements.search = `%${search.trim()}%`;
  }

  const sql = `
    SELECT 
      cont_no,
      cont_no as code_no
    FROM "Customs".vw_cont_imp
    WHERE factory_code = :factory_code
      AND vend_no = :vend_no
      AND status = 7
      AND cont_category = '2'
      AND :issued_date BETWEEN issued_date AND expire_date
      AND :expire_date BETWEEN issued_date AND expire_date
      AND d_type = :d_type
      ${searchCondition}
    ORDER BY cont_no ASC
    LIMIT :limit
    OFFSET :offset
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".vw_cont_imp
    WHERE factory_code = :factory_code
      AND vend_no = :vend_no
      AND status = 7
      AND cont_category = '2'
      AND :issued_date BETWEEN issued_date AND expire_date
      AND :expire_date BETWEEN issued_date AND expire_date
      AND d_type = :d_type
      ${searchCondition}
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
    console.error("Error fetching big contract number:", error);
    throw error;
  }
}
async function fetchBigContNoExmp(factory_code, gridData, page, limit, search) {
  const replacements = {
    factory_code: gridData?.factory_code || factory_code,
    vend_no: gridData?.vend_no,
    issued_date: gridData?.issued_date,
    expire_date: gridData?.expire_date,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  console.log("fetchBigContNo params:", replacements);

  let searchCondition = "";
  if (search && search.trim() !== "") {
    searchCondition = `
      AND cont_no ILIKE :search
    `;
    replacements.search = `%${search.trim()}%`;
  }

  const sql = `
    SELECT 
      cont_no,
      cont_no as code_no
    FROM "Customs".vw_cont_exp
    WHERE factory_code = :factory_code
      AND vend_no = :vend_no
      AND status = 7
      AND cont_category = '2'
      AND :issued_date BETWEEN issued_date AND expire_date
      AND :expire_date BETWEEN issued_date AND expire_date
      ${searchCondition}
    ORDER BY cont_no ASC
    LIMIT :limit
    OFFSET :offset
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".vw_cont_exp
    WHERE factory_code = :factory_code
      AND vend_no = :vend_no
      AND status = 7
      AND cont_category = '2'
      AND :issued_date BETWEEN issued_date AND expire_date
      AND :expire_date BETWEEN issued_date AND expire_date
      ${searchCondition}
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
    console.error("Error fetching big contract number:", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_type,
  acContM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_CONT_M.create(acContM, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItemM.cont_no,
      pageSize,
      t,
      permission,
      cont_type,
    );

    return {
      data: addItemM,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
    throw error;
  }
}
async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_type,
  existAcContM,
  editAcContM,
  pageSize,
  t,
) {
  try {
    const editAIM = await existAcContM.update(editAcContM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editAIM.cont_no,
      pageSize,
      t,
      permission,
      cont_type,
    );
    return {
      data: editAIM,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac item m from db", error);
    throw error;
  }
}

async function deleteContM(existAcContM, t) {
  try {
    const deleteContM = await existAcContM.destroy({ transaction: t });
    return deleteContM;
  } catch (error) {
    console.log("Cannot delete contract master from db", error);
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
      AC_CONT_M: [
        "cont_no",
        "cont_type",
        "issued_date",
        "expire_date",
        "last_edate",
        "vend_no",
        "seller",
        "p_seller",
        "buyer",
        "sum_qty",
        "sum_money",
        "currency",
        "freight",
        "insurance",
        "term_pay",
        "pay_term",
        "goods_origin",
        "port_dis",
        "d_type",
        "cont_category",
        "big_contno",
        "status",
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.AC_CONT_M || {};
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
    const contMSearch = await AC_CONT_M.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["cont_no", "ASC"]],
      limit: limit,
      offset: offset,
    });

    return contMSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}

module.exports = {
  listAllAcContM,
  listAllAcContMWithView,
  getByID,
  add,
  edit,
  deleteContM,
  search,
  fetchFieldByPoVenderM,
  fetchBankParameter,
  fetchBigContNo,
  fetchBigContNoExmp,
  confirm,
};
