const QueryHelper = require("../../utils/queryHelper.js");
const fs = require("fs");
const AC_REQ_M = require("./ac_req_m.model.js");
const FACTORY = require("../factories/factory.model.js");
const pool = require("../../config/db.js");
const acVendBaseService = require("../ac_vend_base/ac_vend_base.service.js");
const { Op } = require("sequelize");

async function listAllARM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
  language = "en",
) {
  if (user_code === "admin") {
    return await AC_REQ_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["req_no", "ASC"],
      ],
    });
  }
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedOffset = parseInt(offset, 10) || 0;
  const whereClause = {};
  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }
  console.log("limit and offset", limit, offset);

  // Lấy data từ AC_REQ_M
  let rows = await AC_REQ_M.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["req_no", "ASC"],
    ],
    limit: parsedLimit + 1,
    offset: parsedOffset,
  });
  const vendNoDropdown = await pool.query(
    `SELECT 
    vend_no,
    CASE 
      WHEN :charset = 'T' THEN shortnm_t
      WHEN :charset = 'E' THEN shortnm_e
      ELSE shortnm_s
    END AS name 
   FROM "po".po_vender_m
   WHERE org_id = :factory_code
     AND status = '7'
   ORDER BY vend_no`,
    {
      replacements: {
        charset: charset[language],
        factory_code: factory_code,
      },
      type: pool.QueryTypes.SELECT,
    },
  );

  // Tạo Map để lookup nhanh
  const vendMap = new Map(
    vendNoDropdown?.map((v) => [v.vend_no, v.name]) || [],
  );

  if (rows.length > 0) {
    for (const record of rows) {
      const vendName = vendMap.get(record.vend_no) || "";
      record.dataValues.vend_no_name = vendName
        ? `${record.vend_no} - ${vendName}`
        : record.vend_no;
      if (record.invoice_no) {
        try {
          const acTypeResult = await pool.query(
            `SELECT 
    imt.declaration_category AS ac_type,
    bd.name_e AS ac_type_name,
    CONCAT(imt.declaration_category, ' - ', bd.name_e) AS ac_type_display
  FROM "Customs".ac_imp_material_tracking imt
  LEFT JOIN "Customs".basic_data bd
    ON bd.factory_code = :factory_code
    AND bd.category_code = 'CDC'
    AND bd.code_no = imt.declaration_category
  WHERE imt.factory_code = :factory_code
    AND imt.invoice_no = :invoice_no
    AND imt.declaration_category IS NOT NULL
  LIMIT 1`,
            {
              replacements: {
                factory_code: record.factory_code,
                invoice_no: record.invoice_no,
              },
              type: pool.QueryTypes.SELECT,
            },
          );

          if (acTypeResult && acTypeResult.length > 0) {
            record.dataValues.ac_type = acTypeResult[0].ac_type;
            record.dataValues.ac_type_name = acTypeResult[0].ac_type_display;
          } else {
            record.dataValues.ac_type = null;
            record.dataValues.ac_type_name = null;
          }
        } catch (error) {
          console.error(
            `Error getting ac_type for ${record.req_no}:`,
            error.message,
          );
          record.dataValues.ac_type = null;
          record.dataValues.ac_type_name = null;
        }
      } else {
        record.dataValues.ac_type = null;
        record.dataValues.ac_type_name = null;
      }
    }
  }
  const hasMore = rows.length > parsedLimit;
  const actualRows = hasMore ? rows.slice(0, parsedLimit) : rows;

  let total = null;

  return {
    rows: actualRows,
    count: total,
    hasMore: hasMore,
  };
}
async function listAllSubByARM(
  factory_code,
  req_no,
  department_code,
  user_code,
  query_level,
  search = {},
  language = "en",
) {
  const nameCol = { en: "name_e", vi: "name_l", zh: "name_t" }[language] || "name_e";

  if (user_code === "admin") {
    const rows = await pool.query(
      `
      SELECT a.*, b.*
      FROM "Customs".ac_req_order a
      LEFT JOIN "Customs".ac_req_m b
        ON b.req_no = a.req_no
        AND b.factory_code = a.factory_code
      ORDER BY a.factory_code ASC, a.req_no ASC
      LIMIT :limit OFFSET :offset
      `,
      { replacements: { limit: parsedLimit, offset: parsedOffset }, type: pool.QueryTypes.SELECT }
    );
    return { rows };
  }

  let permissionCondition = "1=1";
  const replacements = {
    factory_code: factory_code || null,
    req_no: req_no || null,
    invoice_no: search.invoice_no || "",
    vend_no: search.vend_no || "",
    ac_type: search.ac_type || "",
    req_date: search.req_date || null,
    status: search?.status ?? null,
  };

  if (query_level === "1" && factory_code) {
    permissionCondition = "a.factory_code = :factory_code";
  } else if (query_level === "2" && department_code && factory_code) {
    permissionCondition = "b.grt_dept = :permission_dept AND a.factory_code = :factory_code";
    replacements.permission_dept = department_code;
  } else if (query_level === "3" && user_code) {
    permissionCondition = "b.grt_user = :permission_user";
    replacements.permission_user = user_code;
  }

  const searchCondition = `
    COALESCE(b.invoice_no, '') ILIKE '%' || :invoice_no || '%'
    AND COALESCE(b.vend_no, '') ILIKE '%' || :vend_no || '%'
    AND (:ac_type = '' OR act.ac_type ILIKE '%' || :ac_type || '%')
    AND (:req_date IS NULL OR DATE_TRUNC('day', b.req_date) = DATE_TRUNC('day', CAST(:req_date AS date)))
    AND (:status is null or b.status=:status)
  `;

  const sql = `
    SELECT a.*, b.*, act.ac_type, act.ac_type_name
    FROM "Customs".ac_req_order a
    LEFT JOIN "Customs".ac_req_m b
      ON b.req_no = a.req_no
      AND b.factory_code = a.factory_code
    LEFT JOIN LATERAL (
      SELECT imt.declaration_category AS ac_type,
             bd.${nameCol} AS ac_type_name
      FROM "Customs".ac_imp_material_tracking imt
      LEFT JOIN "Customs".basic_data bd
        ON bd.factory_code = imt.factory_code
        AND bd.category_code = 'CDC'
        AND bd.code_no = imt.declaration_category
      WHERE imt.factory_code = b.factory_code
        AND imt.invoice_no = b.invoice_no
        AND imt.declaration_category IS NOT NULL
      LIMIT 1
    ) act ON true
    WHERE ${permissionCondition}
      AND (:req_no IS NULL OR a.req_no = :req_no)
      AND ${searchCondition}
    ORDER BY a.factory_code ASC, a.req_no,a.req_seq ASC
  `;

  const rows = await pool.query(sql, { replacements, type: pool.QueryTypes.SELECT });
  return { rows };
}
async function confirm(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
) {
  if (user_code === "admin") {
    return await AC_REQ_M.findAll({
      order: [
        ["factory_code", "ASC"],
        ["req_no", "ASC"],
      ],
    });
  }

  const replacements = {
    user_code: user_code,
    req_no: req_no,
    factory_code: factory_code,
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
  try {
    const transaction = await pool.transaction();
    const sql = `UPDATE "Customs".ac_req_order 
  SET status = 7, last_user = :user_code, last_date = NOW()
  where req_no=:req_no and status = 1`;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    await transaction.commit();
    return rows;
  } catch (error) {
    await transaction.rollback();
    console.log("Error when update the child table", error);

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
async function getByID(factory_code, req_no) {
  const acBomM = await AC_REQ_M.findOne({
    where: {
      factory_code: factory_code,
      req_no: req_no,
    },
    include: [FACTORY],
  });
  if (!acBomM) {
    console.log("No ac req m found!");
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
async function createReqNo(
  factory_code,
  year_month,
  factory_abbreviation,
  department_code,
  user_code,
  query_level,
) {
  try {
    return pool.transaction(async (t) => {
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
      };
      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      try {
        const rows = await pool.query(
          `SELECT TRIM(to_char(coalesce(max(cast(right(t.req_no,4)as int)),0)+1,'0000')) as next_number from "Customs".ac_req_m t 
          WHERE t.factory_code=:factory ${additionalWhere}
          `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
          },
        );
        console.log("check the result from get the req_no", rows);
        const result = `${factory_abbreviation}${year_month}${rows[0].next_number}`;
        return result;
      } catch (error) {
        console.log("error in run the query ", error);
      }
    });
  } catch (error) {
    console.log("the create req_no generate has been error", error);
  }
}
async function listAllInvoiceNo(
  factory_code,
  user_code,
  department_code,
  query_level,
  page,
  limit,
  search,
  isStatus = true,
) {
  try {
    return pool.transaction(async (t) => {
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      // if (user_code !== "admin") {
      //   if (query_level === "2" && department_code) {
      //     additionalWhere = " AND grt_dept = :dept";
      //     replacements.dept = department_code;
      //   } else if (query_level === "3" && user_code) {
      //     additionalWhere = " AND grt_user = :user";
      //     replacements.user = user_code;
      //   }
      // }
      let searchCondition = "";
      if (search && search.trim() !== "") {
        searchCondition = `
      AND (
        invoice_no ILIKE :search
      )
    `;
        replacements.search = `%${search.trim()}%`;
      }
      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
      try {
        const rows = await pool.query(
          ` select distinct invoice_no from "Customs". ac_imp_material_tracking
            where factory_code=:factory AND 
            invoice_no NOT IN (SELECT DISTINCT COALESCE(INVOICE_NO,'?')
            FROM "Customs".ac_req_m
            WHERE factory_code=:factory ) 
            ${searchCondition}
            ${additionalWhere}
            ${statusCondition}
            order by invoice_no
            limit :limit offset :offset
          `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        let total = null;
        const countResult = await pool.query(
          `SELECT COUNT(distinct invoice_no) as total 
           from "Customs". ac_imp_material_tracking
            where factory_code=:factory AND 
            invoice_no NOT IN (SELECT DISTINCT COALESCE(INVOICE_NO,'?') FROM "Customs".ac_req_m
            WHERE factory_code=:factory ) 
             ${searchCondition}
            ${additionalWhere}
            ${statusCondition}
               `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        total = parseInt(countResult[0]?.total) || 0;
        return {
          data: rows,
          total: total,
          pageSize: parseInt(limit) || 10,
          currentPage: parseInt(page) || 1,
        };
      } catch (error) {
        console.log("error in run the query ", error);
      }
    });
  } catch (error) {
    console.log("the create req_no generate has been error", error);
  }
}
async function listAllAcNo(
  factory_code,
  invoice_no,
  user_code,
  department_code,
  query_level,
  page,
  limit,
  search,
  isStatus = true,
) {
  try {
    return pool.transaction(async (t) => {
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        invoice: invoice_no,
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      // if (user_code !== "admin") {
      //   if (query_level === "2" && department_code) {
      //     additionalWhere = " AND grt_dept = :dept";
      //     replacements.dept = department_code;
      //   } else if (query_level === "3" && user_code) {
      //     additionalWhere = " AND grt_user = :user";
      //     replacements.user = user_code;
      //   }
      // }
      let searchCondition = "";
      if (search && search.trim() !== "") {
        searchCondition = `
      AND (
        AC_NO ILIKE :search
      )
    `;
        replacements.search = `%${search.trim()}%`;
      }
      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      const isStatusBool = String(isStatus).toLowerCase() === "true";
      let statusCondition = "";
      if (isStatusBool) {
        statusCondition = `AND status = '7'`;
      }
      try {
        const rows = await pool.query(
          ` SELECT distinct AC_NO FROM "Customs".VW_CHG_IMP WHERE factory_code=:factory AND COM_INVOICE=:invoice ${additionalWhere} ${searchCondition} ${statusCondition}
          UNION 
          SELECT distinct AC_NO FROM "Customs".ac_proc_m WHERE factory_code=:factory AND com_invoice=:invoice ${additionalWhere} ${searchCondition} ${statusCondition}
            order by AC_NO
            limit :limit offset :offset
          `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        let total = null;
        const countResult = await pool.query(
          `SELECT COUNT(*) as total FROM (
  SELECT distinct AC_NO FROM "Customs".VW_CHG_IMP 
  WHERE factory_code=:factory AND COM_INVOICE=:invoice 
    ${additionalWhere} ${searchCondition} ${statusCondition}
  UNION 
  SELECT distinct AC_NO FROM "Customs".ac_proc_m 
  WHERE factory_code=:factory AND com_invoice=:invoice 
    ${additionalWhere} ${searchCondition} ${statusCondition}
) combined
               `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        total = parseInt(countResult[0]?.total) || 0;
        return {
          data: rows,
          total: total,
          pageSize: parseInt(limit) || 10,
          currentPage: parseInt(page) || 1,
        };
      } catch (error) {
        console.log("error in run the query ", error);
      }
    });
  } catch (error) {
    console.log("the create req_no generate has been error", error);
  }
}
async function listAllAcType(
  factory_code,
  user_code,
  department_code,
  query_level,
  invoice_no,
) {
  try {
    return pool.transaction(async (t) => {
      let additionalWhere = "";
      const replacements = {
        factory: factory_code,
        invoice_no: invoice_no,
      };

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }
      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });
      try {
        const rows = await pool.query(
          `UPDATE "Customs".ac_req_m 
           SET actype = (Select ac_type from "Customs".ac_imp_material_tracking
           Where factory_code = :factory AND invoice = :invoice_no)
          `,
          {
            replacements: replacements,
            type: pool.QueryTypes.SELECT,
            transaction: t,
            logging: true,
          },
        );
        console.log("check the result from get the req_no", rows);
        return rows;
      } catch (error) {
        console.log("error in run the query ", error);
      }
    });
  } catch (error) {
    console.log("the create req_no generate has been error", error);
  }
}
async function getAcTypeFromMaterPur(
  factory_code,
  invoice_no,
  department_code,
  user_code,
  query_level,
  page = 1,
  limit = 10,
  search = "",
) {
  try {
    return pool.transaction(async (t) => {
      let additionalWhere = "";
      const replacements = {
        factory_code: factory_code,
        invoice_no: invoice_no,
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit) || 0,
      };

      if (user_code !== "admin") {
        if (query_level === "2" && department_code) {
          additionalWhere = " AND grt_dept = :dept";
          replacements.dept = department_code;
        } else if (query_level === "3" && user_code) {
          additionalWhere = " AND grt_user = :user";
          replacements.user = user_code;
        }
      }

      if (search && search.trim() !== "") {
        additionalWhere += " AND declaration_category LIKE :search";
        replacements.search = `%${search}%`;
      }

      await pool.query('SET search_path TO "Customs",public', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });

      const rows = await pool.query(
        `SELECT DISTINCT declaration_category as ac_type
         FROM "Customs".ac_imp_material_tracking 
         WHERE factory_code = :factory_code
           AND invoice_no = :invoice_no
           AND declaration_category IN ('1','2','3')
           ${additionalWhere}
         LIMIT :limit
         OFFSET :offset`,
        {
          replacements: replacements,
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );

      const totalResult = await pool.query(
        `SELECT COUNT(DISTINCT declaration_category) as count
         FROM "Customs".ac_imp_material_tracking
         WHERE factory_code = :factory_code
           AND invoice_no = :invoice_no
           AND declaration_category IN ('1','2','3')
           ${additionalWhere}`,
        {
          replacements: {
            factory_code: replacements.factory_code,
            invoice_no: replacements.invoice_no,
            ...(replacements.dept && { dept: replacements.dept }),
            ...(replacements.user && { user: replacements.user }),
            ...(replacements.search && { search: replacements.search }),
          },
          type: pool.QueryTypes.SELECT,
          transaction: t,
          logging: true,
        },
      );

      const total = parseInt(totalResult[0]?.count || 0);

      return {
        data: rows,
        total: total,
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      };
    });
  } catch (error) {
    console.log("Error getting declaration_category:", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acReqM,
  pageSize,
  t,
) {
  const addItem = await AC_REQ_M.create(acReqM, { transaction: t });
  const permission = await checkPermission(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const positionInfo = await getPosition(
    {
      factory_code: addItem.factory_code,
      req_no: addItem.req_no,
    },
    pageSize,
    AC_REQ_M,
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
  existAcReqM,
  editAcReqM,
  pageSize,
  t,
) {
  try {
    const editItem = await existAcReqM.update(editAcReqM, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        req_no: editItem.req_no,
      },
      pageSize,
      AC_REQ_M,
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
async function deleteARM(existAcReqM, t) {
  try {
    const deleteAcReqM = await existAcReqM.destroy({ transaction: t });
    return deleteAcReqM;
  } catch (error) {
    console.log("Cannot delete ac req m from db", error);
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
  language = "en",
) {
  try {
    const charset = { en: "E", vi: "L", zh: "T" };
    const acTypeFilter = query?.search?.ac_type || null;
    const queryWithoutAcType = {
      ...query,
      search: Object.fromEntries(
        Object.entries(query?.search || {}).filter(([k]) => k !== "ac_type"),
      ),
    };

    const queryHelper = new QueryHelper(queryWithoutAcType, {
      AC_REQ_M: ["req_no", "req_date", "invoice_no", "status", "vend_no"],
      FACTORY: ["factory_code"],
    }).filter();

    const whereClause = queryHelper.whereMap.AC_REQ_M || {};

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
    if (acTypeFilter) {
      whereClause.invoice_no = {
        [Op.in]: pool.literal(
          `(SELECT DISTINCT invoice_no 
            FROM "Customs".ac_imp_material_tracking 
            WHERE factory_code = '${factory_code}' 
              AND declaration_category = '${acTypeFilter}')`,
        ),
      };
    }

    const rows = await AC_REQ_M.findAll({
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
        ["req_no", "ASC"],
      ],
      limit: limit,
      offset: offset,
    });

    // ✅ Fetch vend dropdown 1 lần
    const vendNoDropdown = await pool.query(
      `SELECT 
        vend_no,
        CASE 
          WHEN :charset = 'T' THEN shortnm_t
          WHEN :charset = 'E' THEN shortnm_e
          ELSE shortnm_s
        END AS name 
       FROM "po".po_vender_m
       WHERE org_id = :factory_code
         AND status = '7'
       ORDER BY vend_no`,
      {
        replacements: {
          charset: charset[language],
          factory_code: factory_code,
        },
        type: pool.QueryTypes.SELECT,
      },
    );
    const vendMap = new Map(
      vendNoDropdown?.map((v) => [v.vend_no, v.name]) || [],
    );

    if (rows.length > 0) {
      for (const record of rows) {
        // ✅ vend_no_name
        const vendName = vendMap.get(record.vend_no) || "";
        record.dataValues.vend_no_name = vendName
          ? `${record.vend_no} - ${vendName}`
          : record.vend_no;

        if (record.invoice_no) {
          try {
            // ✅ Nếu đang search theo ac_type thì gán thẳng, không query lại
            if (acTypeFilter) {
              record.dataValues.ac_type = acTypeFilter;
              // ✅ Vẫn cần lấy ac_type_name từ basic_data
              const bdResult = await pool.query(
                `SELECT name_e FROM "Customs".basic_data 
                 WHERE factory_code = :factory_code 
                   AND category_code = 'CDC' 
                   AND code_no = :ac_type
                 LIMIT 1`,
                {
                  replacements: {
                    factory_code: factory_code,
                    ac_type: acTypeFilter,
                  },
                  type: pool.QueryTypes.SELECT,
                },
              );
              const acTypeName = bdResult[0]?.name_e || "";
              record.dataValues.ac_type_name = acTypeName
                ? `${acTypeFilter} - ${acTypeName}`
                : acTypeFilter;
              continue;
            }

            // ✅ Không search ac_type → JOIN như listAllARM
            const acTypeResult = await pool.query(
              `SELECT 
                imt.declaration_category AS ac_type,
                CONCAT(imt.declaration_category, ' - ', bd.name_e) AS ac_type_name
               FROM "Customs".ac_imp_material_tracking imt
               LEFT JOIN "Customs".basic_data bd
                 ON bd.factory_code = :factory_code
                 AND bd.category_code = 'CDC'
                 AND bd.code_no = imt.declaration_category
               WHERE imt.factory_code = :factory_code
                 AND imt.invoice_no = :invoice_no
               LIMIT 1`,
              {
                replacements: {
                  factory_code: record.factory_code,
                  invoice_no: record.invoice_no,
                },
                type: pool.QueryTypes.SELECT,
              },
            );
            if (acTypeResult && acTypeResult.length > 0) {
              record.dataValues.ac_type = acTypeResult[0].ac_type;
              record.dataValues.ac_type_name = acTypeResult[0].ac_type_name;
            } else {
              record.dataValues.ac_type = null;
              record.dataValues.ac_type_name = null;
            }
          } catch (error) {
            console.error(
              `Error getting ac_type for ${record.req_no}:`,
              error.message,
            );
            record.dataValues.ac_type = null;
            record.dataValues.ac_type_name = null;
          }
        } else {
          record.dataValues.ac_type = null;
          record.dataValues.ac_type_name = null;
        }
      }
    }

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = await AC_REQ_M.count({ where: whereClause });
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
async function applyFilter(orgId, reqNo, empId, pCharset) {
  try {
    const result = await pool.transaction(async (t) => {
      const ordersQuery = `
        SELECT ORDER_NO, CONT_NO, ITEM_ACNO 
        FROM "Customs".AC_REQ_ORDER 
        WHERE factory_code = :orgId AND REQ_NO = :reqNo
      `;
      const ordersResult = await pool.query(ordersQuery, {
        replacements: { orgId, reqNo },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      });
      const validationErrors = [];
      for (const order of ordersResult) {
        if (!order.cont_no) {
          validationErrors.push(`Order ${order.order_no}: Contract is empty`);
        }
        if (!order.item_acno) {
          validationErrors.push(`Order ${order.order_no}: Item is empty`);
        }
      }
      if (validationErrors.length > 0) {
        const err = new Error("Validation failed");
        err.isValidation = true;
        err.errors = validationErrors;
        throw err;
      }

      const countQuery = `
        SELECT COUNT(*) as count 
        FROM "Customs".AC_REQ_ORDER 
        WHERE factory_code = :orgId AND REQ_NO = :reqNo
      `;
      const countResult = await pool.query(countQuery, {
        replacements: { orgId, reqNo },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      });
      const recordCount = parseInt(countResult[0].count);

      if (recordCount === 0) {
        throw new Error("No records found (Error 540124)");
      }

      const invoiceQuery = `
        SELECT INVOICE_NO 
        FROM "Customs".AC_REQ_M 
        WHERE factory_code = :orgId AND REQ_NO = :reqNo
      `;
      const invoiceResult = await pool.query(invoiceQuery, {
        replacements: { orgId, reqNo },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      });
      const invoiceNo = invoiceResult[0]?.invoice_no;

      let acNo = "";
      try {
        const vwChgQuery = `
          SELECT AC_NO 
          FROM "Customs".VW_CHG_IMP 
          WHERE factory_code = :orgId AND COM_INVOICE = :invoiceNo
        `;
        const vwChgResult = await pool.query(vwChgQuery, {
          replacements: { orgId, invoiceNo },
          type: pool.QueryTypes.SELECT,
          transaction: t,
        });

        if (vwChgResult.length > 0) {
          acNo = vwChgResult[0].ac_no;
        }
      } catch (err) {
        try {
          const acProcQuery = `
            SELECT AC_NO 
            FROM "Customs".AC_PROC_M 
            WHERE factory_code = :orgId AND COM_INVOICE = :invoiceNo
          `;
          const acProcResult = await pool.query(acProcQuery, {
            replacements: { orgId, invoiceNo },
            type: pool.QueryTypes.SELECT,
            transaction: t,
          });
          acNo = acProcResult[0]?.ac_no || "";
        } catch (err2) {
          acNo = "";
        }
      }

      const ordersLoopQuery = `
        SELECT 
          M.factory_code, M.CHK_NO, M.CHK_SEQ, M.ORDER_NO, 
          M.ORDER_SEQ, M.SEQ, M.REQ_NO 
        FROM "Customs".AC_REQ_ORDER M
        INNER JOIN "Customs".AC_REQ_M D 
          ON M.factory_code = D.factory_code AND M.REQ_NO = D.REQ_NO
        WHERE D.factory_code = :orgId AND D.REQ_NO = :reqNo
      `;
      const ordersLoopResult = await pool.query(ordersLoopQuery, {
        replacements: { orgId, reqNo },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      });

      for (const row of ordersLoopResult) {
        if (row.chk_no) {
          const upsertQuery = `
            INSERT INTO "Customs".PO_RCPT_AC 
              (factory_code, CHK_NO, CHK_SEQ, AC_NO, ORDER_NO, ORDER_SEQ)
            VALUES (:orgId, :chkNo, :chkSeq, :acNo, :orderNo, :orderSeq)
            ON CONFLICT (factory_code, CHK_NO, CHK_SEQ) 
            DO UPDATE SET AC_NO = :acNo
          `;
          await pool.query(upsertQuery, {
            replacements: {
              orgId: row.factory_code,
              chkNo: row.chk_no,
              chkSeq: row.chk_seq,
              acNo: acNo,
              orderNo: row.order_no,
              orderSeq: row.order_seq,
            },
            transaction: t,
          });
        }

        const updateChgeQtyQuery = `
          UPDATE "Customs".AC_REQ_ORDER 
          SET CHGE_QTY = REQ_ACQTY 
          WHERE factory_code = :orgId AND REQ_NO = :reqNo AND SEQ = :seq
        `;
        await pool.query(updateChgeQtyQuery, {
          replacements: {
            orgId: row.factory_code,
            reqNo: row.req_no,
            seq: row.seq,
          },
          transaction: t,
        });
      }
      const updateStatusQuery = `
        UPDATE "Customs".AC_REQ_M 
        SET 
          STATUS = 7,
          LAST_USER = :empId,
          LAST_DATE = NOW(),
          AC_NO = :acNo
        WHERE factory_code = :orgId AND REQ_NO = :reqNo
      `;
      await pool.query(updateStatusQuery, {
        replacements: { empId, acNo, orgId, reqNo },
        transaction: t,
      });

      return {
        success: true,
        message: "Process completed successfully",
        acNo: acNo,
        recordCount: recordCount,
      };
    });

    return result;
  } catch (error) {
    console.error("Error in applyFilter:", error);
    if (error.isValidation) {
      return {
        success: false,
        message: error.message,
        errors: error.errors,
        acNo: null,
        recordCount: 0,
      };
    }
    return {
      success: false,
      message: error?.message || "An error occurred",
      errors: [],
      acNo: null,
      recordCount: 0,
    };
  }
}
module.exports = {
  listAllARM,
  listAllSubByARM,
  getByID,
  getAcTypeFromMaterPur,
  listAllInvoiceNo,
  listAllAcNo,
  listAllAcType,
  createReqNo,
  add,
  edit,
  deleteARM,
  search,
  applyFilter,
  confirm,
};
