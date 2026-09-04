const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const IV_TRANS_D_TW = require("./iv_trans_d_tw.model.js");
const FACTORY = require("../factories/factory.model.js");
const AC_ITEM_M = require("../ac_item_m/ac_item_m.model.js");
const { Op, literal } = require("sequelize");
const rd_temp = require("../rd_temp/rd_temp.js");

async function listAllITDT(order_no, order_seq, limit, offset) {
  try {
    let replacements = {
      order_no: order_no || null,
      order_seq: parseInt(order_seq) || null,
      limit: limit + 1,
      offset: offset,
    };
    const sql = `
     SELECT DISTINCT ON(iv_trans_d_tw.TRANS_NO, iv_trans_d_tw.TRANS_SEQ)
    iv_trans_d_tw.org_id,
    iv_trans_d_tw.TRANS_NO,
    iv_trans_d_tw.TRANS_SEQ,
    iv_trans_d_tw.OUT_QTY,
    iv_trans_d_tw.COL3,
    iv_trans_d_tw.COL4,
    iv_trans_d_tw.LAST_DATE
FROM "po".iv_trans_d AS iv_trans_d_tw
INNER JOIN "Customs".vw_ac_srcorder AS VW_AC_SRCORDER
    ON iv_trans_d_tw.COL3 = VW_AC_SRCORDER.order_no
    AND iv_trans_d_tw.COL4::numeric = VW_AC_SRCORDER.order_seq
WHERE iv_trans_d_tw.COL3=:order_no
    AND iv_trans_d_tw.COL4::numeric=:order_seq
ORDER BY iv_trans_d_tw.TRANS_NO,
         iv_trans_d_tw.TRANS_SEQ,
         iv_trans_d_tw.LAST_DATE DESC,
         iv_trans_d_tw.OUT_QTY DESC;
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
      logging: true,
    });
    let total = null;
    const hasMore = rows.length > limit;
    return { rows: rows, count: total, hasMore: hasMore };
  } catch (error) {
    console.error("Error fetching IV_TRANS_D_TW:", error);
  }
}

async function checkBoxRight(
  order_no,
  order_seq,
  all_checked_items,
  session_id,
) {
  try {
    const is_check =
      all_checked_items && all_checked_items.length > 0 ? "Y" : "N";

    console.log(`📊 Auto-detected is_check: ${is_check}`);

    const sessionKey = session_id;

    if (is_check === "Y") {
      // ========================================
      // CASE 1: IS_CHECK = 'Y' → INSERT vào RD_TEMP
      // ========================================

      if (!all_checked_items || all_checked_items.length === 0) {
        // Edge case: Nếu gọi với empty array nhưng is_check='Y'
        // → Lấy toàn bộ danh sách từ DB
        const fullList = await listAllITDT(order_no, order_seq);

        fullList.forEach((item) => {
          rd_temp.save(sessionKey, {
            factory_code: item.factory_code || null,
            item_no: order_no,
            code_no: "IV_TRANS_D_TW",
            seq: item.out_qty,
            col1: order_no,
            col2: null,
            col4: order_seq,
            // col5: item.out_qty,
            // col6: order_seq,
            out_qty: item.out_qty,
            ...item,
          });
        });

        const total = fullList.reduce(
          (sum, item) => sum + (parseFloat(item.out_qty) || 0),
          0,
        );

        return {
          success: true,
          total: total,
          items: fullList,
        };
      }

      // Có items được check cụ thể
      const existingCache = rd_temp.getAll(sessionKey);
      const leftItems = existingCache.filter(
        (i) => (i.code_no || "-NULL-") !== "IV_TRANS_D_TW",
      );

      const otherRightItems = existingCache.filter(
        (i) =>
          i.code_no === "IV_TRANS_D_TW" &&
          (i.col1 !== order_no || parseFloat(i.col4) !== parseFloat(order_seq)),
      );

      rd_temp.clearSession(sessionKey);
      [...leftItems, ...otherRightItems].forEach((item) =>
        rd_temp.save(sessionKey, item),
      );

      // INSERT các items được check
      all_checked_items.forEach((item) => {
        rd_temp.save(sessionKey, {
          factory_code: item.factory_code || null,
          item_no: order_no,
          code_no: "IV_TRANS_D_TW",
          seq: item.out_qty,
          col1: order_no,
          col2: null,
          col4: order_seq,
          // col5: item.out_qty,
          // col6: order_seq,
          out_qty: item.out_qty,
          ...item,
        });
      });
    } else {
      // ========================================
      // CASE 2: IS_CHECK = 'N' → DELETE từ RD_TEMP
      // ========================================

      const existingCache = rd_temp.getAll(sessionKey);

      const itemsToKeep = existingCache.filter(
        (i) =>
          !(
            i.code_no === "IV_TRANS_D_TW" &&
            i.item_no === order_no &&
            parseFloat(i.col4) === parseFloat(order_seq)
          ),
      );

      rd_temp.clearSession(sessionKey);
      itemsToKeep.forEach((item) => rd_temp.save(sessionKey, item));

      return {
        success: true,
        total: 0,
        items: [],
      };
    }

    // ========================================
    // SELECT SUM(SEQ) FROM RD_TEMP
    // ========================================

    const updatedCache = rd_temp.getAll(sessionKey);
    const savedRightItems = updatedCache.filter(
      (item) =>
        item.code_no === "IV_TRANS_D_TW" &&
        item.item_no === order_no &&
        parseFloat(item.col4) === parseFloat(order_seq),
    );

    const total = savedRightItems.reduce((sum, item) => {
      return sum + (parseFloat(item.seq) || 0);
    }, 0);
    return {
      success: true,
      total: total,
      items: savedRightItems,
    };
  } catch (error) {
    console.error("❌ ERROR in checkBoxQty:", error);
    throw error;
  }
}

async function getByID(factory_code, trans_no, trans_seq) {
  const acImp = await IV_TRANS_D_TW.findOne({
    where: {
      factory_code: factory_code,
      trans_no: trans_no,
      trans_seq: trans_seq,
    },
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}

async function add(acIR, t) {
  try {
    const addIR = await IV_TRANS_D_TW.create(acIR, {
      transaction: t,
    });
    return addIR;
  } catch (error) {
    console.log("Cannot add ac item ref from db", error);
  }
}
async function edit(existITDT, editITDT, t) {
  try {
    const editITD = await existITDT.update(editITDT, { transaction: t });
    return editITD;
  } catch (error) {
    console.log("Cannot edit ac item ref from db", error);
  }
}
async function deleteITDT(existITDT, t) {
  try {
    const deleteITD = await existITDT.destroy({ transaction: t });
    return deleteITD;
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
) {
  try {
    const queryHelper = new QueryHelper(query, {
      IV_TRANS_D_TW: ["trans_no", "trans_seq"],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.IV_TRANS_D_TW || {};
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
    const impSearch = await IV_TRANS_D_TW.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["trans_no", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}

module.exports = {
  listAllITDT,
  getByID,
  checkBoxRight,
  add,
  edit,
  deleteITDT,
  search,
};
