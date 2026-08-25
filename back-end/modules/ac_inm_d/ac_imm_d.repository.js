const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_INM_D = require("./ac_inm_d.model.js");
const AC_INM_M = require("../ac_inm_m/ac_inm_m.model.js");
const { Op, literal } = require("sequelize");

async function listAllAcInmD(
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  language = "en",
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
    let replacements = {
      factory_code: factory_code || null,
      inm_no: inm_no || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
    };

    // Xác định permission condition
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
        inm_no, 
        seq, 
        status,
        item_no, 
        "Customs".GF_AC_ITEMNAME(factory_code, item_no, :p_charset) AS item_nonm,
        "Customs".GF_AC_ITEMUNIT(factory_code, item_no) AS in_unit,
        "Customs".GF_CODE_NAME(factory_code, '1108', in_unit, :p_charset) AS in_unitnm,
        in_qty, 
        in_money, 
       hs_qty, 
        n_qty,
        grt_dept,
        grt_user,
        grt_date,
        last_user,
        last_date,
        locked_information
      FROM "Customs".ac_inm_d 
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        inm_no = :inm_no
      ORDER BY  seq,item_no 
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
    console.error("Error listing AC_INM_D:", error);
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
async function listAllWithInmNo(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
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

  return await AC_INM_D.findAll({
    where: whereClause,
    include: [
      {
        model: AC_INM_M,
        as: "AIM",
        attributes: [
          "issued_date",
          "expire_date",
          "req_no",
          "commno",
          "note",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal('"AC_INM_D"."factory_code" = "AIM"."factory_code"'),
            literal('"AC_INM_D"."inm_no" = "AIM"."inm_no"'),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [
      ["factory_code", "ASC"],
      ["inm_no", "ASC"],
      ["seq", "ASC"],
    ],
  });
}
async function getByID(factory_code, inm_no, seq) {
  const acImp = await AC_INM_D.findOne({
    where: {
      factory_code: factory_code,
      inm_no: inm_no,
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
async function fetchItemNoList(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus = true,
) {
  let permissionCondition = "1=1";
  let nameField;
  if (language === "vi") {
    nameField = "item_acname_l";
  } else if (language === "zh") {
    nameField = "item_acname_t";
  } else {
    nameField = "item_acname_e";
  }
  let replacements = {
    factory_code: factory_code,
    language: factory_code,
    limit: parseInt(limit) || 10,
    offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  };

  // Xử lý permission based on query_level
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
    searchCondition = `AND (
    item_acno ILIKE :search
    OR item_acname_e ILIKE :search
    OR item_acname_l ILIKE :search
    OR item_acname_t ILIKE :search
  )`;
    replacements.search = `%${search.trim()}%`;
  }
  const isStatusBool = String(isStatus).toLowerCase() === "true";
  let statusCondition = "";
  if (isStatusBool) {
    statusCondition = `status = '7'`;
  }
  const sql = `
    SELECT DISTINCT 
      item_acno,
      item_acno as code_no,
      ${nameField} as itemnm,
      item_acname_e,
      item_acname_l,
      item_acname_t
    FROM "Customs".ac_item_m
    WHERE
      ${statusCondition}
      AND ${permissionCondition}
      ${searchCondition}
    ORDER BY item_acno ASC
    limit :limit
    offset :offset
  `;
  const countSql = `
    SELECT COUNT(*) as total 
    FROM "Customs".ac_item_m
    WHERE
      ${statusCondition}
      AND ${permissionCondition}
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
    console.error("Error in fetchItemNoList:", error);
    throw error;
  }
}

// API function để fetch danh sách Unit theo Item No đã chọn
async function fetchUnitListByItemNo(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  item_no,
  page,
  limit,
  search,
) {
  let permissionCondition = "1=1";
  let nameField;
  if (language === "vi") {
    nameField = "item_acname_l";
  } else if (language === "zh") {
    nameField = "item_acname_t";
  } else {
    nameField = "item_acname_e";
  }

  let replacements = {
    factory_code: factory_code,
    item_no: item_no,
    language: nameField,
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
    searchCondition = `WHERE unit ILIKE :search`;
    replacements.search = `%${search.trim()}%`;
  }

  const sql = `
    SELECT unit
    FROM "Customs".gf_ac_itemunit(:factory_code, :item_no) AS unit
    ${searchCondition}
    LIMIT :limit
    OFFSET :offset
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM "Customs".gf_ac_itemunit(:factory_code, :item_no) AS unit
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
    console.error("Error in fetchUnitListByItemNo:", error);
    throw error;
  }
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
        inm_no: keys.inm_no,
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
  acInmD,
  pageSize,
  t,
) {
  try {
    const maxSeq = await AC_INM_D.max("seq", {
      where: {
        factory_code: acInmD.factory_code,
        inm_no: acInmD.inm_no,
      },
      transaction: t,
    });

    const nextSeq = (maxSeq || 0) + 1;
    const addItem = await AC_INM_D.create(
      {
        ...acInmD,
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
        inm_no: addItem.inm_no,
        seq: addItem.seq,
      },
      pageSize,
      AC_INM_D,
      ["factory_code", "inm_no", "seq"],
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
  existAcInmD,
  editAcInmD,
  pageSize,
  t,
) {
  const editItem = await existAcInmD.update(editAcInmD, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: editItem.factory_code,
      inm_no: editItem.inm_no,
      seq: editItem.seq,
    },
    pageSize,
    AC_INM_D,
    ["factory_code", "inm_no", "seq"],
    t,
    permission,
  );
  return {
    data: editItem,
    ...positionInfo,
  };
}
async function updateStatus(
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await AC_INM_D.findAll({
      order: [
        ["factory_code", "ASC"],
        ["inm_no", "ASC"],
        ["seq", "ASC"],
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
  if (data && data.length > 0) {
    const itemFounds = data.map((item) => item.seq);

    return await AC_INM_D.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          inm_no: inm_no,
          status: 1,
          item_no: {
            [Op.in]: itemFounds,
          },
        },
      },
    );
  }
  return await AC_INM_D.update(
    { status: 7 },
    {
      where: {
        ...whereClause,
        inm_no: inm_no,
        status: 1,
      },
    },
  );
}
async function deleteItem(existAcImp, t) {
  try {
    const deleteImp = await existAcImp.destroy({ transaction: t });
    return deleteImp;
  } catch (error) {
    console.log("Cannot delete import material tracking from db", error);
  }
}
async function search(
  factory_code,
  department_code,
  user_code,
  query_level,
  filters = {},
  limit,
  offset,
) {
  try {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      inm_no: filters.inm_no || "",
      req_no: filters.req_no || null,
      commno: filters.commno || null,
      status: filters.status ?? null,
      s_issuedate: filters.s_issued_date || null,
      e_issuedate: filters.e_issued_date || null,
      s_expiredate: filters.s_expire_date || null,
      e_expiredate: filters.e_expire_date || null,
    };

    // Xác định permission condition
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
        inm_no, 
        seq,
        issued_date, 
        expire_date, 
        req_no, 
        commno, 
        note, 
        status
      FROM "Customs".AC_INM_D 
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        inm_no LIKE :inm_no || '%' AND
        (:status IS NULL OR status = :status) AND
        (:s_issuedate IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::date)) AND
        (:e_issuedate IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::date)) AND
        (:s_expiredate IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::date)) AND
        (:e_expiredate IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::date))
      ORDER BY seq,inm_no
      limit :limit 
      offset :offset

    `;
    const countSql = `
      SELECT COUNT(*) FROM "Customs".AC_INM_D 
      WHERE 
        ${permissionCondition} AND
        factory_code = :factory_code AND
        inm_no LIKE :inm_no || '%' AND
        (:status IS NULL OR status = :status) AND
        (:s_issuedate IS NULL OR DATE_TRUNC('day', issued_date) >= DATE_TRUNC('day', :s_issuedate::date)) AND
        (:e_issuedate IS NULL OR DATE_TRUNC('day', issued_date) <= DATE_TRUNC('day', :e_issuedate::date)) AND
        (:s_expiredate IS NULL OR DATE_TRUNC('day', expire_date) >= DATE_TRUNC('day', :s_expiredate::date)) AND
        (:e_expiredate IS NULL OR DATE_TRUNC('day', expire_date) <= DATE_TRUNC('day', :e_expiredate::date))
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      try {
        total = countResult[0].total || 0;
      } catch (countError) {
        total = 0;
      }
    }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error searching AC_INM_D:", error);
    throw error;
  }
}
module.exports = {
  listAllAcInmD,
  listAllWithInmNo,
  getByID,
  fetchItemNoList,
  fetchUnitListByItemNo,
  updateStatus,
  add,
  edit,
  deleteItem,
  search,
};
