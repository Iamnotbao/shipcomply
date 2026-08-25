
const SE_PAY = require("./sd_ord_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const { Op } = require("sequelize");
const pool = require("../../config/db.js");

async function getListSdOM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      zh: "T",
      en: "E",
    };

    let replacements = {
      org_id: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
    };
    // Permission logic
    let permissionCondition = "1=1";
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "m.org_id = :permission_org";
        replacements.permission_org = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "m.grt_dept = :permission_dept AND m.org_id = :permission_org";
        replacements.permission_dept = department_code;
        replacements.permission_org = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "m.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT 
      m.org_id,
        m.se_id,
        m.se_day,
        m.se_seq,
        m.se_ver,
        m.mer_po,
        "Customs".GF_CUSTID_CUSTNO(m.org_id, m.se_custid) AS s_custno,
        "Customs".GF_CUSTNM_J(m.org_id, m.se_custid, :p_charset) AS se_custidnm,
        "Customs".GF_CUSTID_CUSTNO(m.org_id, m.acc_custid) AS a_custno,
        "Customs".GF_CUSTNM_J(m.org_id, m.acc_custid, :p_charset) AS acc_custnm,
        "Customs".GF_PAY_NAME(m.org_id, m.pay_no, :p_charset) AS paynm,
        m.last_user,
        "Customs".GF_EMPNM(m.last_user, :p_charset) AS last_usernm,
        m.last_date,
        m.grt_dept,
        "Customs".GF_DEPTNM(m.org_id, m.grt_dept, :p_charset) AS grt_deptnm,
        m.grt_user,
        "Customs".GF_EMPNM(m.grt_user, :p_charset) AS grt_usernm,
        m.status
      FROM "pac".SD_ORD_M m
      WHERE 
        ${permissionCondition}
      ORDER BY m.se_id, m.po
      LIMIT :limit 
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return { rows: actualRows, hasMore: hasMore, count: null };
  } catch (error) {
    console.error("Error fetching SD_ORD_M:", error);
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
  factory_code,
  user_code,
  query_level,
  department_code,
  language,
  filters,
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      zh: "T",
      en: "E",
    };
    
    let replacements = {
      org_id: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
      se_id: filters?.se_id || '',
      last_date_from: filters?.s_date_1 || null,
      fir_date_to: filters?.e_date_1 || null,
      status: filters?.status ?? null,
      se_custid: filters?.se_custid || null,
      price_status: filters?.price_status || null,
      s_nst: filters?.s_date_2 || null,
      e_nst: filters?.e_date_2  || null,
      s_pdd: filters?.s_date_3 || null,
      e_pdd: filters?.e_date_3 || null,
      prod_no: filters?.prod_no || '',
    };

    // Permission logic
    let permissionCondition = "1=1";
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "m.org_id = :permission_org";
        replacements.permission_org = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "m.grt_dept = :permission_dept AND m.org_id = :permission_org";
        replacements.permission_dept = department_code;
        replacements.permission_org = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "m.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT 
        m.se_id,
              m.org_id,
        m.se_day,
        m.se_ver,
        m.se_seq,
        m.mer_po,
        "Customs".GF_CUSTID_CUSTNO(m.org_id, m.se_custid) AS s_custno,
        "Customs".GF_CUSTNM_J(m.org_id, m.se_custid, :p_charset) AS se_custidnm,
        "Customs".GF_CUSTID_CUSTNO(m.org_id, m.acc_custid) AS a_custno,
        "Customs".GF_CUSTNM_J(m.org_id, m.acc_custid, :p_charset) AS acc_custnm,
        "Customs".GF_PAY_NAME(m.org_id, m.pay_no, :p_charset) AS paynm,
        m.last_user,
        "Customs".GF_EMPNM(m.last_user, :p_charset) AS last_usernm,
        m.last_date,
        m.grt_dept,
        "Customs".GF_DEPTNM(m.org_id, m.grt_dept, :p_charset) AS grt_deptnm,
        m.grt_user,
        "Customs".GF_EMPNM(m.grt_user, :p_charset) AS grt_usernm,
        m.status 
      FROM "pac".SD_ORD_M m
      WHERE 
        ${permissionCondition}
        AND m.org_id = :org_id
        AND (Coalesce(m.se_id, '') ILIKE '%'|| :se_id || '%' OR :se_id IS NULL)
        AND(:last_date_from IS NULL OR DATE_TRUNC('day', m.se_day) >= DATE_TRUNC('day', :last_date_from::timestamp)) 
        AND (:fir_date_to IS NULL OR DATE_TRUNC('day', m.se_day) >= DATE_TRUNC('day', :fir_date_to::timestamp))
        AND (m.status = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(m.org_id, m.se_custid) = :se_custid OR :se_custid IS NULL)
        AND ("Customs".GF_PRICE_STATUS(m.org_id, m.se_id) = :price_status OR :price_status IS NULL)
        AND (:s_nst IS NULL OR DATE_TRUNC('day', m.nst) >= DATE_TRUNC('day', :s_nst::timestamp)) 
        AND(:e_nst IS NULL OR DATE_TRUNC('day', m.nst) >= DATE_TRUNC('day', :e_nst::timestamp))
        AND(:s_pdd IS NULL OR DATE_TRUNC('day', m.nlt) >= DATE_TRUNC('day', :s_pdd::timestamp))
        AND(:e_pdd IS NULL OR DATE_TRUNC('day', m.nlt) >= DATE_TRUNC('day', :e_pdd::timestamp)) 
        AND (Coalesce(m.prod_no, '')  ILIKE  '%'|| :prod_no || '%' OR :prod_no IS NULL)
      ORDER BY m.se_id, m.po
      LIMIT :limit 
      OFFSET :offset
    `;
    const countSql = `
      SELECT 
      Count(*) as total
      FROM "pac".SD_ORD_M m
      WHERE 
        ${permissionCondition}
        AND m.org_id = :org_id
        AND (Coalesce(m.se_id, '') ILIKE '%'|| :se_id || '%' OR :se_id IS NULL)
        AND(:last_date_from IS NULL OR DATE_TRUNC('day', m.se_day) >= DATE_TRUNC('day', :last_date_from::timestamp)) 
        AND (:fir_date_to IS NULL OR DATE_TRUNC('day', m.se_day) >= DATE_TRUNC('day', :fir_date_to::timestamp))
        AND (m.status = :status OR :status IS NULL)
        AND ("Customs".GF_CUSTID_CUSTNO(m.org_id, m.se_custid) = :se_custid OR :se_custid IS NULL)
        AND ("Customs".GF_PRICE_STATUS(m.org_id, m.se_id) = :price_status OR :price_status IS NULL)
        AND (:s_nst IS NULL OR DATE_TRUNC('day', m.nst) >= DATE_TRUNC('day', :s_nst::timestamp))
        AND(:e_nst IS NULL OR DATE_TRUNC('day', m.nst) >= DATE_TRUNC('day', :e_nst::timestamp)) 
        AND(:s_pdd IS NULL OR DATE_TRUNC('day', m.nlt) >= DATE_TRUNC('day', :s_pdd::timestamp)) 
        AND(:e_pdd IS NULL OR DATE_TRUNC('day', m.nlt) >= DATE_TRUNC('day', :e_pdd::timestamp))
        AND (Coalesce(m.prod_no, '')  ILIKE  '%'|| :prod_no || '%' OR :prod_no IS NULL)
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    const total = parseInt(countResult[0]?.total);
    return { rows: actualRows, hasMore: hasMore, total: total };
  } catch (error) {
    console.error("Error fetching SD_ORD_M:", error);
    throw error;
  }
}
module.exports = {
  getListSdOM,
  getByID,
  add,
  edit,
  deleteABM,
  search,
};
