const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_PROC_D = require("./ac_proc_d.model.js");
const FACTORY = require("../factories/factory.model.js");

async function listAllAcProcD(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  if (user_code === "admin") {
    return await AC_PROC_D.findAll({
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
  return await AC_PROC_D.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["ac_no", "ASC"],
      ["seq", "ASC"],
    ],
  });
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
      "Customs".GF_AC_ITEM_M_AC_ITEM(FACTORY_CODE,AC_ITEMNO),
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
    FROM "Customs".AC_PROC_D 
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
      FROM "Customs".AC_PROC_D
      WHERE 
    ${permissionCondition}
    AND AC_NO=:ac_no
    order by SEQ,AC_ITEMNO
      LIMIT :limit
      OFFSET :offset
`;
    const countSql = `
      SELECT COUNT(*) as total
      FROM "Customs".AC_PROC_D 
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
    "ac_qty"
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
   FROM "Customs".AC_PROC_D 
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
  const acImp = await AC_PROC_D.findOne({
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
    //  Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        com_invoice,
        min_cont,
        out_cont,
        in_crate
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      throw new Error("AC_PROC_M not found");
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, min_cont, out_cont, in_crate } = ac_proc_m;

    //  Kiểm tra đã có AC_PROC_D chưa
    const checkExistingSql = `
      SELECT COUNT(1) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const existingResult = await pool.query(checkExistingSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    //  Nếu đã có data, hỏi xác nhận có muốn xóa và tạo lại không
    let shouldProceed = true;
    if (existingResult[0].count > 0) {
      // Note: Trong web API, confirmation nên handle ở frontend
      // Ở đây giả sử frontend đã confirm, hoặc có parameter confirm=true
      // throw new Error(await gf_mesgnm(540016, language)); // "Data exists, confirm to overwrite"

      // Xóa data cũ
      const deleteSql = `
        DELETE FROM "Customs".AC_PROC_D
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

    //  Insert vào AC_PROC_D
    let seq = 0;

    for (const item of reqOrderResult) {
      seq += 1;
      const { item_acno, req_qty } = item;

      //  Get UNIT từ AC_ITEM_M
      const getUnitSql = `
        SELECT unit
        FROM "Customs".AC_ITEM_M
        WHERE factory_code = :factory_code
          AND item_acno = :item_acno
        LIMIT 1
      `;
      const unitResult = await pool.query(getUnitSql, {
        replacements: { factory_code, item_acno },
        type: pool.QueryTypes.SELECT,
        transaction,
      });
      const unit = unitResult[0]?.unit || "";

      //  Get TAX_RATE từ AC_ITEM_M
      const getTaxSql = `
        SELECT tax_per
        FROM "Customs".AC_ITEM_M
        WHERE factory_code = :factory_code
          AND item_acno = :item_acno
        LIMIT 1
      `;
      const taxResult = await pool.query(getTaxSql, {
        replacements: { factory_code, item_acno },
        type: pool.QueryTypes.SELECT,
        transaction,
      });
      const tax_rate = taxResult[0]?.tax_per || 0;

      //  Get PRICE từ AC_CONT_D
      let price = 0;
      const cont_no = min_cont || out_cont;

      if (cont_no) {
        const getPriceSql = `
          SELECT cont_price
          FROM "Customs".AC_CONT_D
          WHERE factory_code = :factory_code
            AND cont_no = :cont_no
            AND goods_code = :item_acno
          LIMIT 1
        `;
        const priceResult = await pool.query(getPriceSql, {
          replacements: { factory_code, cont_no, item_acno },
          type: pool.QueryTypes.SELECT,
          transaction,
        });
        price = priceResult[0]?.cont_price || 0;
      }

      //  Calculate REF_PRICE (average from AC_REQ_ORDER)
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
        transaction,
      });

      const total_money = refPriceResult[0]?.total_money || 0;
      const total_qty = refPriceResult[0]?.total_qty || 0;
      const ref_price =
        total_qty > 0
          ? Math.round((total_money / total_qty) * 10000) / 10000
          : 0;

      //  Calculate amounts
      const money = Math.round(price * req_qty * 100) / 100;
      const rb_money = Math.round(money * (in_crate || 1) * 100) / 100;
      const tax = Math.round((tax_rate / 100) * rb_money * 100) / 100;

      //  Insert into AC_PROC_D
      const insertSql = `
        INSERT INTO "Customs".AC_PROC_D (
          factory_code,
          ac_no,
          seq,
          ac_itemno,
          unit,
          ac_qty,
          tax_rate,
          price,
          ref_price,
          money,
          rb_money,
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
          :ac_qty,
          :tax_rate,
          :price,
          :ref_price,
          :money,
          :rb_money,
          :tax,
          1,
          :user_code,
          :department_code
        )
      `;
      await pool.query(insertSql, {
        replacements: {
          factory_code: factory_code,
          ac_no: ac_no,
          seq: seq,
          ac_itemno: item_acno,
          unit: unit,
          ac_qty: req_qty,
          tax_rate: tax_rate,
          price: price,
          ref_price: ref_price,
          money: money,
          rb_money: rb_money,
          tax: tax,
          user_code: user_code,
          department_code: department_code,
        },
        type: pool.QueryTypes.INSERT,
        transaction,
      });
    }

    //  Return the generated data
    const getGeneratedDataSql = `
      SELECT
      factory_code, 
      ac_no,
      seq,
      AC_ITEMNO,
      "Customs".GF_AC_ITEMNAME(FACTORY_CODE,AC_ITEMNO,:p_charset) AS ITEM_NAME,
      "Customs".GF_AC_ITEM_M_AC_ITEM(FACTORY_CODE,AC_ITEMNO),
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
    FROM "Customs".AC_PROC_D 
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
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in autoGenerateAcProcD:", error);
    throw error;
  }
}
async function autoAddMarkB(
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
  }
  try {
    // 1. Lấy thông tin AC_PROC_M
    const getProcMSql = `
      SELECT 
        factory_code,
        ac_no,
        com_invoice,
        vend_no,
        col6,
        col4
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code 
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(getProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      throw new Error("AC_PROC_M not found");
    }

    const ac_proc_m = procMResult[0];
    const { com_invoice, vend_no, col6, col4 } = ac_proc_m;

    // 2. Kiểm tra đã có AC_PROC_D chưa
    const checkExistingSql = `
      SELECT COUNT(1) as count
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const existingResult = await pool.query(checkExistingSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 3. Nếu đã có data, xóa data cũ
    // Note: Frontend nên confirm trước khi gọi API này
    if (existingResult[0].count > 0) {
      const deleteSql = `
        DELETE FROM "Customs".AC_PROC_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      `;
      await pool.query(deleteSql, {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.DELETE,
        transaction,
      });
    }

    // 4. Lấy dữ liệu từ VW_APDUE_ALL (group by ITEM_NO, PRICE, EXCHG_RATE)
    const getApDueSql = `
      SELECT 
        :factory_code as factory_code,
        item_no AS bom_itemno,
        "Customs".GF_REF_ITEMACNO_NOORG(item_no) AS item_no,
        price AS b_price,
        COALESCE(exchg_rate, 1) AS exchg_rate,
        SUM(COALESCE(ap_qty, 0)) AS req_qty,
        price * SUM(COALESCE(ap_qty, 0)) AS ap_bmoney
      FROM "Customs".VW_APDUE_ALL
      WHERE ac_vend = :vend_no
        AND column2 = :com_invoice
      --  AND src = :col6
        AND status > 1
        AND invoice_id = :col4
      GROUP BY item_no, price, exchg_rate
      ORDER BY item_no
    `;
    const apDueResult = await pool.query(getApDueSql, {
      replacements: {
        factory_code: factory_code,
        vend_no: vend_no,
        com_invoice: com_invoice,
        col6: col6,
        col4: parseInt(col4) || null,
      },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (apDueResult.length === 0) {
      throw new Error("No data found in VW_APDUE_ALL for this invoice");
    }

    // 5. Insert vào AC_PROC_D
    let seq = 0;

    for (const item of apDueResult) {
      const { bom_itemno, item_no, b_price, exchg_rate, req_qty, ap_bmoney } =
        item;
      console.log("nhin item di", item);

      // Bỏ qua nếu item_acno null
      if (!item_no) {
        continue;
      }

      seq += 1;

      // 5.1. Lấy UNIT và TAX_PER từ AC_ITEM_M
      const getItemInfoSql = `
        SELECT unit, tax_per
        FROM "Customs".AC_ITEM_M
        WHERE factory_code = :factory_code
          AND item_acno = :item_no
        LIMIT 1
      `;
      const itemInfoResult = await pool.query(getItemInfoSql, {
        replacements: { factory_code, item_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      const v_unit = itemInfoResult[0]?.unit || "";
      const v_tax = itemInfoResult[0]?.tax_per || 0;

      // 5.2. Lấy FORMULA từ AC_ITEM_REF và tính V_QTY
      let v_qty = 0;
      try {
        const getFormulaSql = `
          SELECT COALESCE(formula, 1) as formula
          FROM "Customs".AC_ITEM_REF
          WHERE factory_code = :factory_code
            AND item_acno = :item_no
            AND item_no = :bom_itemno
          LIMIT 1
        `;
        const formulaResult = await pool.query(getFormulaSql, {
          replacements: { factory_code, item_no, bom_itemno },
          type: pool.QueryTypes.SELECT,
          transaction,
        });

        const formula = formulaResult[0]?.formula || 1;
        v_qty = req_qty * formula;
      } catch (error) {
        v_qty = 0;
      }

      // 5.3. Tính giá và tiền
      const v_exchg_rate = exchg_rate || 1;
      const v_money = ap_bmoney;
      const v1_money = Math.round((v_money / v_exchg_rate) * 100) / 100;

      let vb_price = 0;
      if (v_qty > 0) {
        vb_price = Math.round((v_money / v_qty) * 10000) / 10000;
      }

      const v1_price = Math.round((vb_price / v_exchg_rate) * 10000) / 10000;
      const v_tax_amount = Math.round((v_tax / 100) * v_money * 100) / 100;

      // 5.4. Lấy AC_ITEM từ function
      const getAcItemSql = `
      SELECT "Customs".GF_AC_ITEM_M_AC_ITEM(:factory_code, :item_no) as ac_item
    
      `;
      const acItemResult = await pool.query(getAcItemSql, {
        replacements: { factory_code, item_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });
      const ac_item = acItemResult[0]?.ac_item || "";

      // 5.5. Insert vào AC_PROC_D
      const insertSql = `
        INSERT INTO "Customs".AC_PROC_D (
          factory_code,
          ac_no,
          seq,
          ac_itemno,
          unit,
          ac_qty,
          tax_rate,
          tax,
          price,
          rb_money,
          ac_item,
          ref_price,
          money,
          in_crate,
          status,
          grt_dept,
          grt_user
        ) VALUES (
          :factory_code,
          :ac_no,
          :seq,
          :ac_itemno,
          :unit,
          :ac_qty,
          :tax_rate,
          :tax,
          :price,
          :rb_money,
          :ac_item,
          :ref_price,
          :money,
          :in_crate,
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
          ac_itemno: item_no,
          unit: v_unit,
          ac_qty: v_qty,
          tax_rate: v_tax,
          tax: v_tax_amount,
          price: vb_price,
          rb_money: v_money,
          ac_item: ac_item,
          ref_price: v1_price,
          money: v1_money,
          in_crate: v_exchg_rate,
          department_code: department_code,
          user_code: user_code,
        },
        type: pool.QueryTypes.INSERT,
        transaction,
      });
    }

    // 6. Cập nhật IN_CRATE vào AC_PROC_M (lấy từ AC_PROC_D)
    try {
      const getCrateSql = `
        SELECT in_crate
        FROM "Customs".AC_PROC_D
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
          AND in_crate IS NOT NULL
        LIMIT 1
      `;
      const crateResult = await pool.query(getCrateSql, {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      if (crateResult.length > 0 && crateResult[0].in_crate) {
        const updateCrateSql = `
          UPDATE "Customs".AC_PROC_M
          SET in_crate = :in_crate
          WHERE factory_code = :factory_code
            AND ac_no = :ac_no
        `;
        await pool.query(updateCrateSql, {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            in_crate: crateResult[0].in_crate,
          },
          type: pool.QueryTypes.UPDATE,
          transaction,
        });
      }
    } catch (error) {
      // Bỏ qua nếu không có in_crate
      console.log("No in_crate found, skipping update");
    }

    // 8. Return the generated data
    const getGeneratedDataSql = `
      SELECT
      factory_code, 
      ac_no,
      seq,
      AC_ITEMNO,
      "Customs".GF_AC_ITEMNAME(FACTORY_CODE,AC_ITEMNO,:p_charset) AS ITEM_NAME,
      "Customs".GF_AC_ITEM_M_AC_ITEM(FACTORY_CODE,AC_ITEMNO),
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
    FROM "Customs".AC_PROC_D 
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;

    const generatedData = await pool.query(getGeneratedDataSql, {
      replacements: { factory_code, ac_no,p_charset:charset[language] },
      type: pool.QueryTypes.SELECT,
      transaction
    });
    // 7. Commit transaction
    await transaction.commit();
    return {
      success: true,
      message: `Successfully generated ${seq} records from VW_APDUE_ALL`,
      count: seq,
      data: generatedData,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in autoAddMarkB:", error);
    throw error;
  }
}
async function updateExchangeRateMarkB(
  factory_code,
  ac_no,
  in_crate,
  language,
) {
  const transaction = await pool.transaction();

  try {
    // 1. Validate IN_CRATE
    if (!in_crate || in_crate <= 0) {
      const message = await gf_mesgnm(110013, language); 
      throw new Error(
        message || "IN_CRATE is required and must be greater than 0",
      );
    }

    // 2. Kiểm tra AC_PROC_M tồn tại
    const checkProcMSql = `
      SELECT ac_no
      FROM "Customs".AC_PROC_M
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const procMResult = await pool.query(checkProcMSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (procMResult.length === 0) {
      throw new Error("AC_PROC_M not found");
    }
    // 3. Cập nhật IN_CRATE và MONEY cho tất cả records
    // MONEY = ROUND(RB_MONEY/IN_CRATE,2)
    const updateProcDSql = `
      UPDATE "Customs".AC_PROC_D
      SET in_crate = :in_crate,
          money = ROUND(rb_money/ :in_crate,2)
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    const updateProcDResult = await pool.query(updateProcDSql, {
      replacements: { factory_code, ac_no, in_crate },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
 // 4. Cập nhật RB_MONEY cho các record có AC_QTY > 0
    // RB_MONEY = ROUND(ROUND(MONEY * IN_CRATE)
    // const updateRbMoneySql = `
    //   UPDATE "Customs".AC_PROC_D
    //   SET rb_money = ROUND(COALESCE(money, 0) * :in_crate,0)
    //   WHERE factory_code = :factory_code
    //     AND ac_no = :ac_no
    // `;
    // await pool.query(updateRbMoneySql, {
    //   replacements: { factory_code, ac_no, in_crate },
    //   type: pool.QueryTypes.UPDATE,
    //   transaction,
    // });
    // 5. Cập nhật REF_PRICE cho các record có AC_QTY > 0
    // REF_PRICE = ROUND(ROUND(RB_MONEY / IN_CRATE, 2) / AC_QTY, 4)
    const updateRefPriceSql = `
      UPDATE "Customs".AC_PROC_D
      SET ref_price = ROUND(
                        ROUND(
                          COALESCE(rb_money, 0) / :in_crate, 
                          2
                        ) / COALESCE(ac_qty, 1), 
                        4
                      )
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
        AND COALESCE(ac_qty, 0) > 0
    `;
        await pool.query(updateRefPriceSql, {
      replacements: { factory_code, ac_no, in_crate },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });
    // 6. Cập nhật RB_MONEY cho các record có AC_QTY > 0
    // QTY = ROUND(ROUND(MONEY / PRICE, 0), 0)
    const updateQtySql = `
      UPDATE "Customs".AC_PROC_D
      SET qty = ROUND(COALESCE(money, 0) / price,0)
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateQtySql, {
      replacements: { factory_code, ac_no, in_crate },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 6. Cập nhật IN_CRATE vào AC_PROC_M
    const updateProcMSql = `
      UPDATE "Customs".AC_PROC_M
      SET in_crate = :in_crate
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
    `;
    await pool.query(updateProcMSql, {
      replacements: { factory_code, ac_no, in_crate },
      type: pool.QueryTypes.UPDATE,
      transaction,
    });

    // 7. Commit transaction
    await transaction.commit();

    // 8. Lấy dữ liệu đã cập nhật
    const getUpdatedDataSql = `
      SELECT 
        factory_code,
        ac_no,
        seq,
        ac_itemno,
        ac_qty,
        rb_money,
        in_crate,
        money,
        ref_price
      FROM "Customs".AC_PROC_D
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      ORDER BY seq
    `;
    const updatedData = await pool.query(getUpdatedDataSql, {
      replacements: { factory_code, ac_no },
      type: pool.QueryTypes.SELECT,
    });

    return {
      success: true,
      message: `Exchange rate updated successfully to ${in_crate}`,
      updated_count: updateProcDResult[1], // rowCount
      in_crate: in_crate,
      data: updatedData,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in updateExchangeRateMarkB:", error);
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
    const maxSeq = await AC_PROC_D.max("seq", {
      where: {
        factory_code: acImp.factory_code,
        ac_no: acImp.ac_no,
      },
      transaction: t,
    });

    const nextSeq = (maxSeq || 0) + 1;
    const addItem = await AC_PROC_D.create(
      { ...acImp, seq: nextSeq },
      {
        transaction: t,
      },
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
        ac_no: addItem.ac_no,
        seq: addItem.seq,
      },
      pageSize,
      AC_PROC_D,
      ["seq", "ac_itemno"],
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
  existAcProcD,
  editAcProcD,
  pageSize,
  t,
) {
  try {
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
      AC_PROC_D,
      ["seq", "ac_itemno"],
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit item from db", error);
    throw error; // ← throw lên để controller bắt
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
) {
  try {
    const queryHelper = new QueryHelper(query, {
      AC_PROC_D: [
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
    const whereClause = queryHelper.whereMap.AC_PROC_D || {};
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
    const impSearch = await AC_PROC_D.findAll({
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
  listAllAcProcD,
  listAllAcProcDWithView,
  listAllAcProcDWithViewMarkB,
  updateExchangeRateMarkB,
  fetchSumData,
  fetchUnitByGoodsCode,
  getByID,
  autoAdd,
  autoAddMarkB,
  add,
  edit,
  deleteImp,
  search,
};
