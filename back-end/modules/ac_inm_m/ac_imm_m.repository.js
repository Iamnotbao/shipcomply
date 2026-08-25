const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_INM_M = require("./ac_inm_m.model.js");

async function listAllAcInmM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_INM_M.findAll({
      order: [["inm_no", "ASC"]],
      limit: limit + 1,
      offset: offset,
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
  const rows = await AC_INM_M.findAll({
    where: whereClause,
    order: [["inm_no", "ASC"]],
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
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  inm_no,
) {
  const replacements = {
    factory_code: factory_code,
    user_code: user_code,
    inm_no: inm_no,
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
    UPDATE "Customs".ac_inn_d
    SET status = 7, last_user = :user_code, last_date = now()
    WHERE inm_no = :inm_no and status = 1 
      AND ${permissionCondition}
  `;
  try {
    await pool.query(sql, {
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
async function getByID(factory_code, inm_no) {
  const acImp = await AC_INM_M.findOne({
    where: {
      factory_code: factory_code,
      inm_no: inm_no,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function getPosition(inm_no, pageSize, t, permission) {
  try {
    const position = await AC_INM_M.count({
      where: {
        inm_no: {
          [Op.lt]: inm_no,
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
  acInmM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_INM_M.create(acInmM, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItemM.inm_no,
      pageSize,
      t,
      permission,
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
  existAcInmM,
  editAcInmM,
  pageSize,
  t,
) {
  try {
    const editAIM = await existAcInmM.update(editAcInmM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      editAIM.inm_no,
      pageSize,
      t,
      permission,
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
    let permissionCondition = "TRUE";
    let replacements = {
      factory_code: factory_code,
      inm_no: query.inm_no || "",
      status:
        query.status !== undefined && query.status !== null
          ? query.status
          : null,
      s_issuedate: query.s_date_1 || null,
      e_issuedate: query.e_date_1 || null,
      s_expiredate: query.s_date_2 || null,
      e_expiredate: query.e_date_2 || null,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition = "grt_dept = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT 
        factory_code,
        inm_no, 
        issued_date, 
        expire_date, 
        req_no, 
        commno, 
        note, 
        status,
        grt_dept,
        grt_user,
        grt_date,
        last_user,
        last_date,
        locked_information
      FROM "Customs"."ac_inm_m"
      WHERE 
        factory_code = :factory_code
        AND COALESCE(inm_no,'') ILIKE  '%' || :inm_no || '%'
        AND (:status IS NULL OR status = :status)
        AND (:s_issuedate IS NULL OR issued_date::date >= :s_issuedate::date)
        AND (:e_issuedate IS NULL OR issued_date::date <= :e_issuedate::date)
        AND (:s_expiredate IS NULL OR expire_date::date >= :s_expiredate::date)
        AND (:e_expiredate IS NULL OR expire_date::date <= :e_expiredate::date)
        AND ${permissionCondition}
      ORDER BY inm_no
      LIMIT :limit
      OFFSET :offset
    `;
    const countQuery = `
      SELECT COUNT(*) as total FROM "Customs"."ac_inm_m"
      WHERE 
        factory_code = :factory_code
        AND COALESCE(inm_no,'') ILIKE  '%' || :inm_no || '%'
        AND (:status IS NULL OR status = :status)
        AND (:s_issuedate IS NULL OR issued_date::date >= :s_issuedate::date)
        AND (:e_issuedate IS NULL OR issued_date::date <= :e_issuedate::date)
        AND (:s_expiredate IS NULL OR expire_date::date >= :s_expiredate::date)
        AND (:e_expiredate IS NULL OR expire_date::date <= :e_expiredate::date)
        AND ${permissionCondition}
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countQuery, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = countResult[0].total;
    }
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database cannot search the data", error);
    throw error;
  }
}
module.exports = {
  listAllAcInmM,
  getByID,
  add,
  edit,
  deleteImp,
  search,
  confirm
};
