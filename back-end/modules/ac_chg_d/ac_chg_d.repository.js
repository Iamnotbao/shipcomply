const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_CHG_D = require("./ac_chg_d.model.js");
const FACTORY = require("../factories/factory.model.js");
const { listAllAcChgMToExcel } = require("../ac_chg_m/ac_chg_m.repository.js");

async function listAllAcChgD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await AC_CHG_D.findAll({
      order: [
        ["factory_code", "ASC"],
        ["ac_no", "ASC"],
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
  return await AC_CHG_D.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["ac_no", "ASC"],
      ["seq", "ASC"],
    ],
  });
}


async function listAllAcChgDWithView(
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
      permissionCondition = "d.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "d.grt_dept = :permission_dept AND d.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "d.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
  SELECT
    d.factory_code, 
    d.ac_no,
    d.seq,
    d.ac_itemno,
    "Customs".GF_ACPROD_NAME(d.factory_code, d.ac_itemno, :p_charset) AS ac_itemnm,
    "Customs".GF_ACPROD_NAME(FACTORY_CODE,AC_ITEMNO,:p_charset) as ITEM_NAME,
    "Customs".GF_AC_ITEMunit(d.factory_code, d.ac_itemno) AS unit,
    "Customs".GF_CODE_NAME(d.factory_code, '1108', "Customs".GF_AC_ITEMunit(d.factory_code, d.ac_itemno), :p_charset) AS unitnm,
    "Customs".GF_CODE_NAME(d.factory_code, 'COLOR', d.color, :p_charset) AS colornm,
    d.ac_item,
    d.country,
    "Customs".GF_CODE_NAME(d.factory_code, '5006', d.country, :p_charset) AS countrynm,
    d.ref_price,
    d.price,
    d.money,
    d.breadth,
    d.in_qty,
    d.cmoney,
    d.tax_rate,
    d.tax,
    d.atax_rate,
    d.add_tax,
    d.status,
    d.grt_dept,
    d.grt_user,
    d.grt_date,
    d.last_date,
    d.last_user,
    d.locked_information
  FROM "Customs".AC_CHG_D d
  WHERE ${permissionCondition}
    AND d.ac_no = :ac_no
  ORDER BY d.seq
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

async function listAllAcChgDExpWithView(
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
      permissionCondition = "d.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "d.grt_dept = :permission_dept AND d.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "d.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
  SELECT
    d.factory_code, 
    d.ac_no,
    d.seq,
    d.ac_itemno,
    "Customs".GF_ACPROD_NAME(d.factory_code, d.ac_itemno, :p_charset) AS ac_itemnm,
    "Customs".gf_ac_prod_unit(d.factory_code, d.ac_itemno) AS unit,
    "Customs".GF_CODE_NAME(d.factory_code, '1108', "Customs".gf_ac_prod_unit(d.factory_code, d.ac_itemno), :p_charset) AS unitnm,
    "Customs".GF_CODE_NAME(d.factory_code, 'COLOR', d.color, :p_charset) AS colornm,
    d.ac_item,
    d.country,
    "Customs".GF_CODE_NAME(d.factory_code, '5006', d.country, :p_charset) AS countrynm,
    d.ref_price,
    d.price,
    d.money,
    d.breadth,
    d.in_qty,
    d.cmoney,
    d.tax_rate,
    d.tax,
    d.atax_rate,
    d.add_tax,
    d.status,
    d.grt_dept,
    d.grt_user,
    d.grt_date,
    d.last_date,
    d.last_user,
    d.locked_information
  FROM "Customs".AC_CHG_D d
  WHERE ${permissionCondition}
    AND d.ac_no = :ac_no
  ORDER BY d.seq
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
// Cho Sequelize ORM (dùng trong getPosition)
function checkPermission(permission) {
  const whereClause = {};

  if (permission?.factory_code) {
    whereClause.factory_code = permission.factory_code;
  }

  if (permission?.grt_dept) {
    whereClause.grt_dept = permission.grt_dept;
  }

  if (permission?.grt_user) {
    whereClause.grt_user = permission.grt_user;
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
   FROM "Customs".ac_chg_d 
   WHERE ${permissionCondition} 
   AND ac_no = :ac_no
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
  let sql, countSql;
  if (goods_code) {
    sql = `
       Select "Customs".GF_AC_ITEMunit(:factory_code,:goods_code) as unit
      `;
    countSql = `
  SELECT COUNT(*) as total
  FROM (
    SELECT "Customs".GF_AC_ITEMunit(:factory_code, :goods_code) as unit
  ) as subquery
  ${searchCondition}
`;
  } else {
    sql = `
     SELECT "Customs".GF_AC_PROD_unit(:factory_code, "Customs".GF_AC_SHOEID(:AC_CHG_D.ORG_ID,:AC_CHG_D.AC_ITEMNO)) as unit
      `;
    countSql = `
  SELECT COUNT(*) as total
  FROM (
    SELECT "Customs".GF_AC_PROD_unit(:factory_code, "Customs".GF_AC_SHOEID(:AC_CHG_D.ORG_ID,:AC_CHG_D.AC_ITEMNO)) as unit
  ) as subquery
  ${searchCondition}
`;
  }

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
  const acImp = await AC_CHG_D.findOne({
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
    const permissionWhere = checkPermission(permission);
    const orderClause = [];
    for (const field of orderFields) {
      orderClause.push([field, "ASC"]);
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        ac_no: keys.ac_no,
        ...permissionWhere,
      },
      attributes: Object.keys(keys),
      order: orderClause,
      raw: true,
      transaction: t,
    });

    console.log("Total records found:", allRecords.length);
    console.log("Looking for keys:", keys);

    const position = allRecords.findIndex((r) =>
      Object.keys(keys).every((key) => {
        // So sánh với type conversion nếu cần
        const match = String(r[key]) === String(keys[key]);
        if (!match) {
          console.log(
            `Mismatch: ${key} -> DB: ${r[key]} (${typeof r[key]}) vs Search: ${keys[key]} (${typeof keys[key]})`,
          );
        }
        return match;
      }),
    );

    console.log("Position found:", position);

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
    console.error("Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function autoAdd(
  factory_code,
  department_code,
  user_code,
  ac_no,
  language,
) {
  const transaction = await pool.transaction();
  const charset = {
    en: "E",
    vi: "L",
    zh: "T",
  };
  try {
    const getChgMSql = `
      SELECT 
        factory_code,
        ac_no,
        com_invoice,
        min_cont,
        cont_no,
        curr_rate
      FROM "Customs".VW_CHG_IMP
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const chgMResult = await pool.query(getChgMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (chgMResult.length === 0) {
      throw new Error("VW_CHG_IMP not found");
    }

    const ac_chg_m = chgMResult[0];
    const { com_invoice, min_cont, cont_no, curr_rate } = ac_chg_m;
    const checkExistingSql = `
      SELECT COUNT(1) as count
      FROM "Customs".AC_CHG_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const existingResult = await pool.query(checkExistingSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    //  Nếu đã có data, xóa để tạo lại
    if (existingResult[0].count > 0) {
      // Note: Frontend nên confirm trước khi gọi API này
      // throw new Error("Data exists, confirm to overwrite");

      const deleteSql = `
        DELETE FROM "Customs".AC_CHG_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;
      await pool.query(deleteSql, {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      });
    }

    //  Lấy dữ liệu từ AC_REQ_ORDER (group by ITEM_ACNO)
    const getReqOrderSql = `
      SELECT 
        a.factory_code,
        b.item_acno,
        SUM(b.req_acqty) as req_qty
      FROM "Customs".AC_REQ_M a
      JOIN "Customs".AC_REQ_ORDER b 
        ON a.factory_code = b.factory_code
        AND a.req_no = b.req_no
      WHERE a.status = 7
        AND a.factory_code = :factory_code
        AND a.invoice_no = :com_invoice
      GROUP BY a.factory_code, b.item_acno
      ORDER BY b.item_acno
    `;
    const reqOrderResult = await pool.query(getReqOrderSql, {
      replacements: { factory_code, com_invoice },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (reqOrderResult.length === 0) {
      const message = "No AC_REQ_ORDER data found for this invoice";
      throw new Error(message);
    }

    //  Insert vào AC_CHG_D
    let seq = 0;

    for (const item of reqOrderResult) {
      seq += 1;
      const { item_acno, req_qty } = item;

      //  Get UNIT, TAX_RATE, AC_ITEM từ AC_ITEM_M
      const getItemSql = `
        SELECT 
          unit,
          tax_per,
          "Customs".GF_AC_ITEM_M_AC_ITEM(factory_code, item_acno) as ac_item
        FROM "Customs".AC_ITEM_M
        WHERE factory_code = :factory_code
          AND item_acno = :item_acno
        LIMIT 1
      `;
      const itemResult = await pool.query(getItemSql, {
        replacements: { factory_code, item_acno },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      const unit = itemResult[0]?.unit || null;
      const tax_rate = itemResult[0]?.tax_per || null;
      const ac_item = itemResult[0]?.ac_item || null;

      //  Get PRICE từ AC_CONT_D
      let price = 0;
      const cont_no_to_use = min_cont || cont_no; 

      if (cont_no_to_use) {
        const getPriceSql = `
          SELECT cont_price
          FROM "Customs".AC_CONT_D
          WHERE factory_code = :factory_code
            AND cont_no = :cont_no
            AND goods_code = :item_acno
          LIMIT 1
        `;
        const priceResult = await pool.query(getPriceSql, {
          replacements: { factory_code, cont_no: cont_no_to_use, item_acno },
          type: pool.QueryTypes.SELECT,
          transaction,
        });
        price = priceResult[0]?.cont_price || 0;
      }

      //  Calculate REF_PRICE (average from AC_REQ_ORDER)
      const ref_price = await calculateRPrice(
        factory_code,
        com_invoice,
        item_acno,
        transaction,
      );

      //  Calculate amounts
      const money = Math.round(price * req_qty * 100) / 100; // Y_MONEY
      const cmoney = Math.round(money * (curr_rate || 1) * 100) / 100;
      const tax = Math.round((tax_rate / 100) * cmoney * 100) / 100;

      //  Insert into AC_CHG_D
      const insertSql = `
        INSERT INTO "Customs".AC_CHG_D (
          factory_code,
          ac_no,
          seq,
          ac_itemno,
          unit,
          in_qty,
          tax_rate,
          ac_item,
          price,
          money,
          ref_price,
          cmoney,
          tax,
          status,
          grt_dept,
          grt_user
        ) VALUES (
          :factory_code,
          :ac_no,
          :seq,
          :ac_itemno,
          :unit,
          :in_qty,
          :tax_rate,
          :ac_item,
          :price,
          :money,
          :ref_price,
          :cmoney,
          :tax,
          1,
          :department_code,
          :user_code
        )
      `;
      await pool.query(insertSql, {
        replacements: {
          factory_code: factory_code,
          ac_no: ac_no,
          seq: seq,
          ac_itemno: item_acno,
          unit: unit,
          in_qty: req_qty,
          tax_rate: tax_rate,
          ac_item: ac_item,
          price: price,
          money: money,
          ref_price: ref_price,
          cmoney: cmoney,
          tax: tax,
          department_code: department_code,
          user_code: user_code,
        },
        type: pool.QueryTypes.INSERT,
        transaction,
      });
    }

    //  Tính tổng và update lại VW_CHG_IMP
    const getSumSql = `
      SELECT 
        COALESCE(SUM(money), 0) as sum_money,
        COALESCE(SUM(tax), 0) as sum_tax,
        COALESCE(SUM(in_qty), 0) as sum_qty,
        COALESCE(SUM(add_tax), 0) as sum_add_tax
      FROM "Customs".AC_CHG_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const sumResult = await pool.query(getSumSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const sum_money = sumResult[0]?.sum_money || 0;
    const sum_tax = sumResult[0]?.sum_tax || 0;
    const sum_qty = sumResult[0]?.sum_qty || 0;
    const sum_add_tax = sumResult[0]?.sum_add_tax || 0;

    //  Update VW_CHG_IMP
    const updateSql = `
      UPDATE "Customs".VW_CHG_IMP
      SET 
        sum_money = :sum_money,
        tax = :sum_tax,
        sum_qty = :sum_qty,
        add_tax = :sum_add_tax
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateSql, {
      replacements: {
        sum_money,
        sum_tax,
        sum_qty,
        sum_add_tax,
        factory_code,
        ac_no,
      },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    //  Return the generated data
    const getGeneratedDataSql = `
      SELECT
    d.factory_code, 
    d.ac_no,
    d.seq,
    d.ac_itemno,
    "Customs".GF_AC_ITEMNAME(d.factory_code, d.ac_itemno, :p_charset) AS ac_itemnm,
    "Customs".GF_ACPROD_NAME(FACTORY_CODE,AC_ITEMNO,:p_charset) as ITEM_NAME,
    "Customs".GF_AC_ITEMunit(d.factory_code, d.ac_itemno) AS unit,
    "Customs".GF_CODE_NAME(d.factory_code, 'UNIT', "Customs".GF_AC_ITEMunit(d.factory_code, d.ac_itemno), :p_charset) AS unitnm,
    "Customs".GF_CODE_NAME(d.factory_code, 'COLOR', d.color, :p_charset) AS colornm,
    d.ac_item,
    d.country,
    "Customs".GF_CODE_NAME(d.factory_code, 'CHGCY', d.country, :p_charset) AS countrynm,
    d.ref_price,
    d.price,
    d.money,
    d.breadth,
    d.in_qty,
    d.cmoney,
    d.tax_rate,
    d.tax,
    d.atax_rate,
    d.add_tax,
    d.status,
    d.grt_dept,
    d.grt_user,
    d.grt_date,
    d.last_date,
    d.last_user,
    d.locked_information
  FROM "Customs".AC_CHG_D d
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const generatedData = await pool.query(getGeneratedDataSql, {
      replacements: { factory_code, ac_no, p_charset: charset[language] },
      type: pool.QueryTypes.SELECT,
      transaction,
    });
    //  Commit transaction
    await transaction.commit();
    return {
      success: true,
      message: `Successfully generated ${seq} records`,
      count: seq,
      data: generatedData,
      summary: {
        sum_money,
        sum_tax,
        sum_qty,
        sum_add_tax,
      },
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in autoAdd AC_CHG_D:", error);
    throw error;
  }
}
async function calculateRPrice(factory_code, com_invoice, item_acno, t) {
  const getRefPriceSql = `
    SELECT 
      COALESCE(SUM(a.amount), 0) as total_money,
      COALESCE(SUM(a.req_acqty), 0) as total_qty
    FROM "Customs".AC_REQ_ORDER a
    JOIN "Customs".AC_REQ_M b 
      ON a.factory_code = b.factory_code
      AND a.req_no = b.req_no
    WHERE a.factory_code = :factory_code
      AND b.invoice_no = :com_invoice
      AND b.status = 7
      AND a.item_acno = :item_acno
  `;

  const refPriceResult = await pool.query(getRefPriceSql, {
    replacements: { factory_code, com_invoice, item_acno },
    type: pool.QueryTypes.SELECT,
    transaction: t,
  });

  const total_money = refPriceResult[0]?.total_money || 0;
  const total_qty = refPriceResult[0]?.total_qty || 0;

  return total_qty > 0
    ? Math.round((total_money / total_qty) * 10000) / 10000
    : 0;
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
    const maxSeq = await AC_CHG_D.max("seq", {
      where: {
        factory_code: acImp.factory_code,
        ac_no: acImp.ac_no,
      },
      transaction: t,
    });

    const nextSeq = (maxSeq || 0) + 1;
    const addItem = await AC_CHG_D.create(
      {
        ...acImp,
        seq: nextSeq,
      },
      {
        transaction: t,
      },
    );
    const permission = checkPermission(
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
      AC_CHG_D,
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
  const permission = checkPermission(
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
    AC_CHG_D,
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
      AC_CHG_D: [
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
    const whereClause = queryHelper.whereMap.AC_CHG_D || {};
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
    const impSearch = await AC_CHG_D.findAll({
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
async function refreshSeq(factory_code, ac_no) {
  const transaction = await pool.transaction();
  try {
    // 1. Kiểm tra có dữ liệu detail không
    const countSql = `
      SELECT COUNT(1) AS cnt
      FROM "Customs".AC_CHG_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const countResult = await pool.query(countSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (parseInt(countResult[0].cnt) === 0) {
      await transaction.rollback();
      return { success: true, message: "Không có dữ liệu để refresh" };
    }

    // 2. Cập nhật lại SEQ theo thứ tự ROW_NUMBER
    const updateSql = `
      UPDATE "Customs".AC_CHG_D AS target
      SET seq = source.new_seq
      FROM (
        SELECT factory_code, ac_no, seq,
               ROW_NUMBER() OVER (
                 PARTITION BY factory_code, ac_no
                 ORDER BY seq
               ) AS new_seq
        FROM "Customs".AC_CHG_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      ) AS source
      WHERE target.factory_code = source.factory_code
        AND target.ac_no = source.ac_no
        AND target.seq = source.seq
    `;
    await pool.query(updateSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    await transaction.commit();
    return { success: true, message: "刷新序號 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in refreshSeq:", error);
    throw error;
  }
}
async function copyItemsFromShoeId(
  factory_code,
  ac_no,
  cont_no,
  shoe_id,
  language,
) {
  const transaction = await pool.transaction();
  const charset = { en: "E", vi: "L", zh: "T" };
  try {
    // 1. Kiểm tra SHOE_ID không được null
    if (!shoe_id) {
      const message = await gf_mesgnm(500036, charset[language]);
      throw new Error(message);
    }

    // 2. Lấy danh sách sản phẩm theo SHOE_ID
    const getProdSql = `
      SELECT factory_code, prod_acno, customs_shoe_id
      FROM "Customs".AC_PROD_M
      WHERE factory_code = :factory_code
        AND customs_shoe_id = :shoe_id
    `;
    const prodResult = await pool.query(getProdSql, {
      replacements: { factory_code, shoe_id },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (prodResult.length === 0) {
      await transaction.rollback();
      return {
        success: true,
        message: "Không có sản phẩm nào thuộc SHOE_ID này",
      };
    }

    for (const prod of prodResult) {
      // 3. Lấy UNIT từ AC_SHOE_M theo PROD_ACNO
      const getUnitSql = `
        SELECT unit
        FROM "Customs".AC_SHOE_M
        WHERE factory_code = :factory_code
          AND customs_shoe_id = :prod_acno
      `;
      const unitResult = await pool.query(getUnitSql, {
        replacements: { factory_code, prod_acno: prod.prod_acno },
        type: pool.QueryTypes.SELECT,
        transaction,
      });
      const unit = unitResult[0]?.unit || "";

      // 4. Xóa dòng cũ nếu đã tồn tại cùng AC_ITEMNO
      await pool.query(
        `DELETE FROM "Customs".AC_CHG_D
         WHERE factory_code = :factory_code
           AND ac_no = :ac_no
           AND ac_itemno = :prod_acno`,
        {
          replacements: { factory_code, ac_no, prod_acno: prod.prod_acno },
          type: pool.QueryTypes.DELETE,
          transaction,
        },
      );

      // 5. Lấy SEQ tiếp theo
      const getSeqSql = `
        SELECT COALESCE(MAX(seq), 0) + 1 AS next_seq
        FROM "Customs".AC_CHG_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;
      const seqResult = await pool.query(getSeqSql, {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });
      const next_seq = seqResult[0]?.next_seq || 1;

      // 6. Insert dòng mới với PRICE lấy từ GF_OUT_CONT_PRICE
      await pool.query(
        `INSERT INTO "Customs".AC_CHG_D
           (factory_code, ac_no, seq, ac_itemno, shoe_id, price, qty, tax_rate, unit)
         VALUES
           (:factory_code, :ac_no, :next_seq, :prod_acno, :shoe_id,
            "Customs".GF_OUT_CONT_PRICE(:factory_code, :cont_no, :prod_acno),
            0, 0, :unit)`,
        {
          replacements: {
            factory_code,
            ac_no,
            next_seq,
            prod_acno: prod.prod_acno,
            shoe_id: prod.customs_shoe_id,
            cont_no,
            unit,
          },
          type: pool.QueryTypes.INSERT,
          transaction,
        },
      );
    }

    await transaction.commit();
    return { success: true, message: "Copy items thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in copyItemsFromShoeId:", error);
    throw error;
  }
}
async function refreshPrice(factory_code, ac_no, language) {
  try {
    const transaction = await pool.transaction();
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };
    // 1. Kiểm tra invoice đã tồn tại chưa
    const invoiceCheck = await pool.query(
      `
      SELECT COUNT(1) AS x
      FROM "Customs".se_inv_m
      WHERE ac_no = :ac_no
        AND factory_code = :factory_code
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    const x = parseInt(invoiceCheck[0]?.x || 0);
    if (x !== 0) {
      return {
        success: false,
        message:
          "The invoice data has been created and the unit price cannot be refreshed.",
      };
    }

    // 2. Lấy danh sách AC_PLAN_ORD
    const planOrdList = await pool.query(
      `
      SELECT factory_code, ac_no, se_id, se_seq, ship_seq, se_ver, pack_gu
      FROM "Customs".ac_plan_ord
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
        transaction
        
      },
    );
    console.log("adudud check",planOrdList);
    
    
    // 3. Loop I -> J -> K -> UPDATE AC_PLAN_SIZE
    for (const i of planOrdList) {
      const packList = await pool.query(
        `
        SELECT factory_code, se_id, se_seq, pk_seq,
               COALESCE(ctns, 0) AS ctns, ship_seq, se_ver, pack_gu
        FROM "Customs".ac_plan_pack
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND se_id = :se_id
          AND se_seq = :se_seq
          AND ship_seq = :ship_seq
          AND se_ver = :se_ver
          AND pack_gu = :pack_gu
        `,
        {
          replacements: {
            factory_code: i.factory_code,
            ac_no,
            se_id: i.se_id,
            se_seq: i.se_seq,
            ship_seq: i.ship_seq,
            se_ver: i.se_ver,
            pack_gu: i.pack_gu,
          },
          type: pool.QueryTypes.SELECT,
        },
      );

      for (const j of packList) {
        const sizeList = await pool.query(
          `
          SELECT size_no,
                 size_seq,
                 COALESCE(pairs, 0) AS pairs,
                 "Customs".gf_seord_price_nover(org_id, se_id, se_seq) AS price,
                 se_ver,
                 pack_gu
          FROM "pac".sd_pack_d
          WHERE org_id = :factory_code
            AND se_id = :se_id
            AND se_seq = :se_seq
            AND pk_seq = :pk_seq
            AND se_ver = :se_ver
            AND pack_gu = :pack_gu
          `,
          {
            replacements: {
              factory_code: j.factory_code,
              se_id: j.se_id,
              se_seq: j.se_seq,
              pk_seq: j.pk_seq,
              se_ver: j.se_ver,
              pack_gu: parseInt(j.pack_gu),
            },
            type: pool.QueryTypes.SELECT,
          },
        );

        for (const k of sizeList) {
          await pool.query(
            `
            UPDATE "Customs".ac_plan_size
            SET price = :price,
                money = COALESCE(:price, 0) * COALESCE(:ctns, 0) * COALESCE(:pairs, 0)
            WHERE factory_code = :factory_code
              AND ac_no = :ac_no
              AND se_id = :se_id
              AND se_seq = :se_seq
              AND size_no = :size_no
              AND ship_seq = :ship_seq
              AND se_ver = :se_ver
              AND pack_gu = :pack_gu
            `,
            {
              replacements: {
                factory_code: i.factory_code,
                ac_no,
                se_id: i.se_id,
                se_seq: i.se_seq,
                size_no: k.size_no,
                ship_seq: i.ship_seq,
                se_ver: i.se_ver,
                pack_gu: i.pack_gu,
                price: parseFloat(k.price),
                ctns: parseFloat(j.ctns),
                pairs: parseFloat(k.pairs),
              },
              type: pool.QueryTypes.UPDATE,
            },
          );
        }
      }
    }

    // 4. Clear QTY, MONEY của AC_CHG_D có IS_REF = 'Y'
    await pool.query(
      `
      UPDATE "Customs".ac_chg_d
      SET qty = NULL,
          money = NULL
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND is_ref = 'Y'
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.UPDATE,
        transaction
      },
    );

    // 5. Lấy danh sách AC_PLAN_SIZE group by PROD_ACNO, PRICE
    const planSizeList = await pool.query(
      `
      SELECT prod_acno,
             COALESCE(price, 0) AS price,
             SUM(COALESCE(pairs, 0)) AS qty,
             SUM(COALESCE(money, 0)) AS money
      FROM "Customs".ac_plan_size
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      GROUP BY prod_acno, price
      ORDER BY prod_acno, COALESCE(price, 0)
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
        transaction
      },
    );

    // 6. Loop T -> upsert AC_CHG_D
    for (const t of planSizeList) {
      // Case 1: tồn tại cùng AC_ITEMNO + PRICE
      const existByPrice = await pool.query(
        `
        SELECT 1 AS n
        FROM "Customs".ac_chg_d
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND ac_itemno = :prod_acno
          AND price = :price
        LIMIT 1
        `,
        {
          replacements: {
            factory_code,
            ac_no,
            prod_acno: t.prod_acno,
            price: t.price,
          },
          type: pool.QueryTypes.SELECT,
          transaction
        },
      );

      if (existByPrice.length > 0) {
        await pool.query(
          `
          UPDATE "Customs".ac_chg_d
          SET qty   = COALESCE(qty, 0) + COALESCE(:qty, 0),
              money = COALESCE(money, 0) + COALESCE(:money, 0),
              is_ref = 'Y'
          WHERE factory_code = :factory_code
            AND ac_no = :ac_no
            AND ac_itemno = :prod_acno
            AND price = :price
          `,
          {
            replacements: {
              factory_code,
              ac_no,
              prod_acno: t.prod_acno,
              price: t.price,
              qty: parseFloat(t.qty),
              money: parseFloat(t.money),
            },
            type: pool.QueryTypes.UPDATE,
            transaction
          },
        );
        continue;
      }

      // Case 2: tồn tại cùng AC_ITEMNO nhưng khác PRICE
      const existByItem = await pool.query(
        `
        SELECT 1 AS n
        FROM "Customs".ac_chg_d
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND ac_itemno = :prod_acno
        LIMIT 1
        `,
        {
          replacements: { factory_code, ac_no, prod_acno: t.prod_acno },
          type: pool.QueryTypes.SELECT,
          transaction
        },
      );

      if (existByItem.length > 0) {
        await pool.query(
          `
          UPDATE "Customs".ac_chg_d
          SET price = :price,
              qty   = COALESCE(qty, 0) + COALESCE(:qty, 0),
              money = COALESCE(:price, 0) * (COALESCE(qty, 0) + COALESCE(:qty, 0)),
              is_ref = 'Y'
          WHERE factory_code = :factory_code
            AND ac_no = :ac_no
            AND ac_itemno = :prod_acno
          `,
          {
            replacements: {
              factory_code,
              ac_no,
              prod_acno: t.prod_acno,
              price: parseFloat(t.price),
              qty: parseFloat(t.qty),
            },
            type: pool.QueryTypes.UPDATE,
            transaction
          },
        );
        continue;
      }

      // Case 3: không tồn tại -> lấy MAX(SEQ)+1 rồi INSERT
      const maxSeqResult = await pool.query(
        `
        SELECT MAX(seq) AS max_seq
        FROM "Customs".ac_chg_d
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
        `,
        {
          replacements: { factory_code, ac_no },
          type: pool.QueryTypes.SELECT,
          transaction
        },
      );

      const newSeq = parseInt(maxSeqResult[0]?.max_seq || 0) + 1;

      await pool.query(
        `
        INSERT INTO "Customs".ac_chg_d (
          factory_code, ac_no, seq, ac_itemno, color, country, unit,
          price, qty, breadth, tax_rate, tax, money, atax_rate, add_tax,
          shoe_id, remark, in_qty, in_unit, ac_item, over_qty, is_ref,
          cmoney, req_no, ref_price
        )
        SELECT
          factory_code, ac_no, :new_seq, ac_itemno, color, country, unit,
          :price, :qty, breadth, tax_rate, tax, :money, atax_rate, add_tax,
          shoe_id, remark, in_qty, in_unit, ac_item, over_qty, 'Y',
          cmoney, req_no, ref_price
        FROM "Customs".ac_chg_d
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND ac_itemno = :prod_acno
        LIMIT 1
        `,
        {
          replacements: {
            factory_code,
            ac_no,
            new_seq: newSeq,
            prod_acno: t.prod_acno,
            price: t.price,
            qty: t.qty,
            money: t.money,
          },
          type: pool.QueryTypes.INSERT,
          transaction
        },
      );
    }

    // 7. Update SUM_MONEY, SUM_QTY trên VW_CHG_EXP
    await pool.query(
      `
      UPDATE "Customs".vw_chg_exp t
      SET (sum_money, sum_qty) = (
        SELECT SUM(COALESCE(money, 0)), SUM(COALESCE(qty, 0))
        FROM "Customs".ac_chg_d
        WHERE factory_code = t.factory_code
          AND ac_no = t.ac_no
          and status  > 0
      )
      WHERE t.factory_code = :factory_code
        AND t.ac_no = :ac_no
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.UPDATE,
        transaction
      },
    );
    await transaction.commit();
    return {
      success: true,
      message: "Unit price refreshed successfully",
      ac_no,
      factory_code,
    };
  } catch (error) {
    console.error("ERROR in refreshPrice:", error);
    throw error;
  }
}
module.exports = {
  listAllAcChgD,
  listAllAcChgDWithView,
  listAllAcChgDExpWithView,
  listAllAcChgMToExcel,
  fetchSumData,
  fetchUnitByGoodsCode,
  getByID,
  add,
  autoAdd,
  edit,
  deleteImp,
  search,
  refreshSeq,
  copyItemsFromShoeId,
  refreshPrice,
  calculateRPrice
};
