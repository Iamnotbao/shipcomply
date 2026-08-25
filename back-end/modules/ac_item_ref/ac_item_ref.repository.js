const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const AC_ITEM_REF = require("./ac_item_ref.model.js");
const FACTORY = require("../factories/factory.model.js");
const AC_ITEM_M = require("../ac_item_m/ac_item_m.model.js");
const { Op, literal, fn, col } = require("sequelize");

const getNumericSort = () => {
  return literal(`
    CASE 
      WHEN REGEXP_REPLACE(item_no, '[^0-9]', '', 'g') = '' THEN 0
      ELSE CAST(REGEXP_REPLACE(item_no, '[^0-9]', '', 'g') AS BIGINT)
    END
  `);
};
async function listAllIR(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  if (user_code === "admin") {
    return await AC_ITEM_REF.findAll({
      order: [
        ["factory_code", "ASC"],
        ["item_acno", "ASC"],
        [getNumericSort(), "ASC"],
        ["item_no", "ASC"],
      ],
    });
  }
  console.log(
    "all things",
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const whereClause = {};
  if (query_level === "1" && factory_code) {
    whereClause.factory_code = factory_code;
  } else if (query_level === "2" && department_code) {
    whereClause.grt_dept = department_code;
    whereClause.factory_code = factory_code;
  } else if (query_level === "3" && user_code) {
    whereClause.grt_user = user_code;
  }
  const rows = await AC_ITEM_REF.findAll({
    where: whereClause,
    order: [
      ["factory_code", "ASC"],
      ["item_acno", "ASC"],
      [getNumericSort(), "ASC"],
      ["item_no", "ASC"],
    ],
    limit: limit + 1,
    offset: offset,
  });
  const hasMore = rows.length > limit;
  const actualRows = hasMore ? rows.slice(0, limit) : rows;
  let total = null;
  if (parseInt(offset) === 0) {
    try {
      // Build WHERE clause cho raw query
      total = await AC_ITEM_REF.count({
        where: whereClause,
      });
      console.log("tota", total);
    } catch (countError) {
      try {
        const sequelizeCount = await AC_ITEM_REF.count({
          where: whereClause,
        });
        total = parseInt(sequelizeCount) || 0;
      } catch (fallbackError) {
        total = 0;
      }
    }
  }
  return {
    rows: actualRows,
    count: total,
    hasMore: hasMore,
  };
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
async function updateStatus(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  data,
) {
  if (user_code === "admin") {
    return await AC_ITEM_REF.findAll({
      order: [
        ["factory_code", "ASC"],
        ["item_acno", "ASC"],
        [getNumericSort(), "ASC"],
        ["item_no", "ASC"],
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
    const itemNos = data.map((item) => item.item_no);

    return await AC_ITEM_REF.update(
      { status: 7 },
      {
        where: {
          ...whereClause,
          item_acno: item_acno,
          status: 1,
          item_no: {
            [Op.in]: itemNos,
          },
        },
      },
    );
  }
  return await AC_ITEM_REF.update(
    { status: 7 },
    {
      where: {
        ...whereClause,
        item_acno: item_acno,
        status: 1,
      },
    },
  );
}
async function listAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  console.log(
    "listAll with category join",
    factory_code,
    department_code,
    user_code,
    query_level,
  );

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

  return await AC_ITEM_REF.findAll({
    where: whereClause,
    include: [
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_ITEM_REF"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_ITEM_REF"."item_acno" = "ITEM_ACNO"."item_acno"'),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [
      ["factory_code", "ASC"],
      ["item_acno", "ASC"],
      [getNumericSort(), "ASC"],
      ["item_no", "ASC"],
    ],
  });
}
async function listAllWithItemNo(item_no) {
  const whereClause = { item_no: item_no };
  return await AC_ITEM_REF.findAll({
    where: whereClause,
    include: [
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_ITEM_REF"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_ITEM_REF"."item_acno" = "ITEM_ACNO"."item_acno"'),
          ],
        },
      },
    ],
    order: [
      ["factory_code", "ASC"],
      ["item_acno", "ASC"],
      [getNumericSort(), "ASC"],
      ["item_no", "ASC"],
    ],
  });
}
async function getByID(factory_code, item_acno, item_no) {
  const acImp = await AC_ITEM_REF.findOne({
    where: {
      factory_code: factory_code,
      item_acno: item_acno,
      item_no: item_no,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
      //  Include BASIC_DATA_CATEGORY - Composite key với literal
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_ITEM_REF"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_ITEM_REF"."item_acno" = "ITEM_ACNO"."item_acno"'),
          ],
        },
      },
    ],
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}
async function getByItemNo(item_no) {
  const acImp = await AC_ITEM_REF.findAll({
    where: {
      item_no: item_no,
    },
    include: [
      {
        model: FACTORY,
        required: false,
      },
      //  Include BASIC_DATA_CATEGORY - Composite key với literal
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false,
        on: {
          [Op.and]: [
            literal(
              '"AC_ITEM_REF"."factory_code" = "ITEM_ACNO"."factory_code"',
            ),
            literal('"AC_ITEM_REF"."item_acno" = "ITEM_ACNO"."item_acno"'),
          ],
        },
      },
    ],
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      item_acno: item_acno,
    };
    if (user_code !== "admin") {
      switch (query_level) {
        case "1":
          break;
        case "2":
          if (department_code) {
            whereClause.grt_dept = department_code;
          }
          break;
        case "3":
          if (user_code) {
            whereClause.grt_user = user_code;
          }
          break;
      }
    }
    const rows = await AC_ITEM_REF.findAll({
      where: whereClause,
      order: [
        ["factory_code", "ASC"],
        ["item_acno", "ASC"],
        [getNumericSort(), "ASC"],
        ["item_no", "ASC"],
      ],
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    });
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    let total = null;
    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}
async function getPosition(keys, pageSize, model, orderFields, t, permission) {
  try {
    const orderClause = [];
    for (const field of orderFields) {
      if (field === "item_no") {
        orderClause.push([getNumericSort(), "ASC"]);
        orderClause.push(["item_no", "ASC"]);
      } else {
        orderClause.push([field, "ASC"]);
      }
    }
    const allRecords = await model.findAll({
      where: {
        factory_code: keys.factory_code,
        item_acno: keys.item_acno,
      },
      ...permission,
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
    console.error("❌ Cannot calculate position:", error);
    return { position: 0, size: parseInt(pageSize) || 10, page: 0, offset: 0 };
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  acIR,
  pageSize,
  t,
) {
  try {
    const addItem = await AC_ITEM_REF.create(acIR, {
      transaction: t,
    });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: addItem.factory_code,
        item_acno: addItem.item_acno,
        item_no: addItem.item_no,
      },
      pageSize,
      AC_ITEM_REF,
      ["factory_code", "item_acno", "item_no"],
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
  existAcIR,
  editAcIR,
  pageSize,
  t,
) {
  try {
    const editItem = await existAcIR.update(editAcIR, { transaction: t });
    const permission = await checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      {
        factory_code: editItem.factory_code,
        item_acno: editItem.item_acno,
        item_no: editItem.item_no,
      },
      pageSize,
      AC_ITEM_REF,
      ["factory_code", "item_acno", "item_no"],
      t,
      permission,
    );
    return {
      data: editItem,
      ...positionInfo,
    };
  } catch (error) {
    console.log("Cannot edit ac item ref from db", error);
  }
}

async function deleteIR(existAcIR, t) {
  try {
    const deleteAcIR = await existAcIR.destroy({ transaction: t });
    return deleteAcIR;
  } catch (error) {
    console.log("Cannot delete ac item ref from db", error);
  }
}
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level,
  masterLimit,
  masterOffset,
) {
  try {
    const queryHelper = new QueryHelper(query, {
      AC_ITEM_REF: ["item_no", "item_acno", "item_unit", "formula", "status"],
      FACTORY: ["factory_code"],
    }).filter();

    const whereClause = queryHelper.whereMap.AC_ITEM_REF || {};

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

    // ✅ BƯỚC 1: Đếm tổng số masters
    const totalMastersResult = await AC_ITEM_REF.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      attributes: ["factory_code", "item_acno"],
      group: ["AC_ITEM_REF.factory_code", "AC_ITEM_REF.item_acno"],
      raw: true,
    });

    const totalMasters = totalMastersResult.length;
    console.log("📊 Total masters found:", totalMasters);

    // ✅ BƯỚC 2: Lấy danh sách master keys của page hiện tại
    const paginatedMasterKeys = await AC_ITEM_REF.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      attributes: ["factory_code", "item_acno"],
      group: ["AC_ITEM_REF.factory_code", "AC_ITEM_REF.item_acno"],
      order: [
        [col("AC_ITEM_REF.factory_code"), "ASC"],
        [col("AC_ITEM_REF.item_acno"), "ASC"],
      ],
      limit: masterLimit,
      offset: masterOffset,
      raw: true,
    });

    console.log("📄 Masters in page:", paginatedMasterKeys.length);

    if (paginatedMasterKeys.length === 0) {
      return {
        rows: [],
        totalMasters: totalMasters,
        totalDetails: 0,
        mastersInPage: 0,
        masterKeys: [],
        masterInfo: [],
      };
    }

    // ✅ BƯỚC 3: Lấy FULL master info từ AC_ITEM_M (EXPLICIT attributes)
    const masterConditions = paginatedMasterKeys.map((m) => ({
      factory_code: m.factory_code,
      item_acno: m.item_acno,
    }));

    console.log("🔍 Fetching master info for keys:", masterConditions);

    const masterInfoRecords = await AC_ITEM_M.findAll({
      where: {
        [Op.or]: masterConditions,
      },
      // ✅ QUAN TRỌNG: List TẤT CẢ attributes từ model
      attributes: [
        "factory_code",
        "item_acno",
        "item_acname_l",
        "item_acname_t",
        "item_acname_e",
        "ac_item",
        "unit",
        "tax_per",
        "loss_per",
        "ac_type",
        "locked_information",
        "status",
        "grt_dept",
        "grt_user",
        "grt_date",
        "last_user",
        "last_date",
      ],
      order: [
        ["factory_code", "ASC"],
        ["item_acno", "ASC"],
      ],
      raw: true, // ✅ Giữ raw: true để get plain object
    });

    console.log("✅ Master info fetched:", masterInfoRecords.length);
    console.log(
      "📋 Sample master data:",
      JSON.stringify(masterInfoRecords[0], null, 2),
    );

    // ✅ KIỂM TRA: Có master nào không có data trong AC_ITEM_M không?
    const missingMasters = paginatedMasterKeys.filter(
      (key) =>
        !masterInfoRecords.find(
          (m) =>
            m.factory_code === key.factory_code &&
            m.item_acno === key.item_acno,
        ),
    );

    if (missingMasters.length > 0) {
      console.warn("⚠️ Masters not found in AC_ITEM_M:", missingMasters);

      // ✅ Thêm placeholder cho masters thiếu
      missingMasters.forEach((key) => {
        masterInfoRecords.push({
          factory_code: key.factory_code,
          item_acno: key.item_acno,
          item_acname_l: null,
          item_acname_t: null,
          item_acname_e: null,
          ac_item: null,
          unit: null,
          tax_per: null,
          loss_per: null,
          ac_type: null,
          locked_information: null,
          status: null,
          grt_dept: null,
          grt_user: null,
          grt_date: null,
          last_user: null,
          last_date: null,
        });
      });
    }

    // ✅ BƯỚC 4: Lấy TẤT CẢ details của masters trong page
    const detailsForPage = await AC_ITEM_REF.findAll({
      where: {
        ...whereClause,
        [Op.or]: masterConditions,
      },
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
        },
        {
          model: AC_ITEM_M,
          as: "ITEM_ACNO",
          attributes: [
            "item_acname_t",
            "item_acname_e",
            "item_acname_l",
            "status",
          ],
          required: false,
          on: {
            [Op.and]: [
              literal(
                '"AC_ITEM_REF"."factory_code" = "ITEM_ACNO"."factory_code"',
              ),
              literal('"AC_ITEM_REF"."item_acno" = "ITEM_ACNO"."item_acno"'),
            ],
          },
        },
      ],
      order: [
        ["factory_code", "ASC"],
        ["item_acno", "ASC"],
        [getNumericSort(), "ASC"],
        ["item_no", "ASC"],
      ],
    });

    console.log("📄 Details fetched:", detailsForPage.length);

    let totalDetails = null;
    if (masterOffset === 0) {
      totalDetails = await AC_ITEM_REF.count({
        where: whereClause,
        include: [
          {
            model: FACTORY,
            where: queryHelper.whereMap.FACTORY || {},
            required: true,
            attributes: [],
          },
        ],
      });
      console.log("📊 Total details (all masters):", totalDetails);
    }

    return {
      rows: detailsForPage,
      totalMasters: totalMasters,
      totalDetails: totalDetails,
      mastersInPage: paginatedMasterKeys.length,
      masterKeys: masterConditions,
      masterInfo: masterInfoRecords,
    };
  } catch (error) {
    console.error(" Database search error:", error);
    throw error;
  }
}

module.exports = {
  listAllIR,
  listAllWithItemAcno,
  listAllWithItemNo,
  getByID,
  getByItemAcno,
  getByItemNo,
  add,
  edit,
  updateStatus,
  deleteIR,
  search,
};
