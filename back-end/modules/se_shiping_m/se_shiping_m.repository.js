const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_SHIPING_M = require("./se_shiping_m.model.js");

async function listAllSeShipingM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
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
    p_charset: charSet[language] || "E",
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
 FACTORY_CODE,
  CUST_ID, 
  "Customs".GF_CUSTID_CUSTNO(factory_code,CUST_ID) AS CUST_NO, 
  "Customs".GF_CUSTNM_J(FACTORY_CODE,CUST_ID,:p_charset) AS CUST_NAME,
  "Customs".GF_CUSTID_BRANDNM(FACTORY_CODE,CUST_ID,:p_charset) AS CUST_PO, 
  SI_SEQ, 
  START_DATE, 
  END_DATE,
  STATUS ,
   locked_information,
  GRT_DEPT,
  "Customs".GF_DEPTNM(FACTORY_CODE, GRT_DEPT, :p_charset) AS GRT_DEPTNAME, 
  GRT_USER, 
  "Customs".GF_EMPNM(GRT_USER, :p_charset) AS GRT_USERNAME,
  GRT_DATE, 
  LAST_USER, 
  "Customs".GF_EMPNM(LAST_USER, :p_charset) AS LAST_USERNAME, 
  LAST_DATE 
FROM "Customs".SE_SHIPING_M 
WHERE ${permissionCondition}
ORDER BY CUST_ID, SI_SEQ
  LIMIT :limit
  OFFSET :offset
`;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    let total = null;
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
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
async function getByID(factory_code, cust_id, si_seq) {
  const acImp = await AC_SHIPING_M.findOne({
    where: {
      factory_code: factory_code,
      cust_id: cust_id,
      si_seq: si_seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function createsiSeq(
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
) {
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    cust_id: cust_id,
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
    const sql = `
    SELECT COALESCE(MAX(si_seq), 0) + 1 as si_seq
     from "Customs".SE_SHIPING_M 
     where factory_code=:factory_code 
     and cust_id=:cust_id
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    return rows[0] || 1;
  } catch (error) {
    console.error("Error in createAcno:", error);
    throw error;
  }
}
async function getPosition(cust_id, si_seq, pageSize, t, permission) {
  try {
    const position = await AC_SHIPING_M.count({
      where: {
        [Op.or]: [
          {
            cust_id: {
              [Op.lt]: cust_id,
            },
          },
          {
            cust_id: cust_id,
            si_seq: {
              [Op.lt]: si_seq,
            },
          },
        ],
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
  seShipingM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_SHIPING_M.create(seShipingM, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      addItemM.cust_id,
      addItemM.si_seq,
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
      editAIM.cust_id,
      editAIM.si_seq,
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
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  cust_id,
  si_seq,
) {
  const replacements = {
    factory_code: factory_code,
    user_code: user_code,
    cust_id: cust_id,
    si_seq: si_seq,
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
  try {
    const updateMasterSql = `
    UPDATE "Customs".se_shiping_m
    SET status = 7
    WHERE
    factory_code = :factory_code 
    AND si_seq = :si_seq
    and cust_id = :cust_id
  `;
    await pool.query(updateMasterSql, {
      replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    const sql = `
    UPDATE "Customs".se_shiping_d
    SET status = 7, last_user = :user_code, last_date = now()
    WHERE cust_id = :cust_id and si_seq = :si_seq and factory_code = :factory_code and status = 1 
      AND ${permissionCondition}
  `;
    await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.UPDATE,
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
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
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
    cust_id: query?.cust_id || null,
    status: query?.status ?? null,
    s_date_1: query?.s_date_1 || null,
    e_date_1: query?.e_date_1 || null,
    p_charset: charSet[language] || "E",
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
 FACTORY_CODE,
  CUST_ID, 
  "Customs".GF_CUSTID_CUSTNO(factory_code,CUST_ID) AS CUST_NO, 
  "Customs".GF_CUSTNM_J(FACTORY_CODE,CUST_ID,:p_charset) AS CUST_NAME,
  "Customs".GF_CUSTID_BRANDNM(FACTORY_CODE,CUST_ID,:p_charset) AS CUST_PO, 
  SI_SEQ, 
  START_DATE, 
  END_DATE,
  STATUS ,
   locked_information,
  GRT_DEPT,
  "Customs".GF_DEPTNM(FACTORY_CODE, GRT_DEPT, :p_charset) AS GRT_DEPTNAME, 
  GRT_USER, 
  "Customs".GF_EMPNM(GRT_USER, :p_charset) AS GRT_USERNAME,
  GRT_DATE, 
  LAST_USER, 
  "Customs".GF_EMPNM(LAST_USER, :p_charset) AS LAST_USERNAME, 
  LAST_DATE 
FROM "Customs".SE_SHIPING_M 
WHERE ${permissionCondition}
AND
(:cust_id IS NULL OR cust_id LIKE '%' || :cust_id || '%') AND
(:status IS NULL OR status = :status) AND
(:s_date_1 IS NULL OR DATE_TRUNC('day', start_date) >= DATE_TRUNC('day', :s_date_1::timestamp)) AND
(:e_date_1 IS NULL OR DATE_TRUNC('day', end_date) <= DATE_TRUNC('day', :e_date_1::timestamp))
ORDER BY CUST_ID, SI_SEQ
  LIMIT :limit
  OFFSET :offset
`;
    const countSql = `
    SELECT COUNT(*) AS total
    FROM "Customs".SE_SHIPING_M 
    WHERE ${permissionCondition}
    AND
    (:cust_id IS NULL OR cust_id LIKE '%' || :cust_id || '%') AND
    (:status IS NULL OR status = :status) AND
    (:s_date_1 IS NULL OR DATE_TRUNC('day', start_date) >= DATE_TRUNC('day', :s_date_1::timestamp)) AND
    (:e_date_1 IS NULL OR DATE_TRUNC('day', end_date) <= DATE_TRUNC('day', :e_date_1::timestamp))
`;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    let total = null;
    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    if (parseInt(offset) === 0) {
      countResult = await pool.query(countSql, {
        replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = countResult[0]?.total;
    }
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
module.exports = {
  listAllSeShipingM,
  getByID,
  createsiSeq,
  add,
  edit,
  deleteImp,
  search,
  confirm
};
