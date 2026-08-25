const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const rd_temp = require("../rd_temp/rd_temp.js");
const AC_SRCORDER_M = require("../ac_srcorder_m/ac_srcorder_m.model.js");

async function getListOfAAS(
  factory_code,
  department_code,
  user_code,
  query_level,
  vend_no,
  invoice_no,
  limit,
  offset,
  language,
  is_max,
) {
  try {
    const charLange = {
      en: "E",
      vi: "L",
      zh: "T",
    };
    // Xây dựng điều kiện permission
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code ?? null,
      limit: parseInt(limit) + 1 ?? 10,
      offset: parseInt(offset) ?? 0,
      language: charLange[language] ?? "E",
      vend_no: `%${vend_no}%` ?? null,
      invoice_no: invoice_no ?? null,
      is_max: is_max ?? "N",
    };

    // Xác định permission condition
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "vw.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "vw.grt_dept = :permission_dept AND vw.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "vw.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT distinct on(vw.id)
        vw.id,
        vw.type,
        vw.order_date,
        vw.order_no,
        vw.order_seq,
        vw.vr_cfmday,
        vw.ac_code,
        CASE
          WHEN :language = 'T' THEN ais.name_t
          WHEN :language = 'E' THEN ais.name_e
          ELSE ais.name_s
        END AS itemnm,
        "Customs".gf_code_name(vw.factory_code, '1108', vw.pr_unit, 'E') AS unitnm,
        CASE
          WHEN :language = 'T' THEN aim.item_acname_t
          WHEN :language = 'E' THEN aim.item_acname_e
          ELSE aim.item_acname_l
        END AS itemnm1,
        "Customs".gf_code_name(:factory_code, '1108', aim.unit, :language) AS unitnm1,
        vw.item_acno,
        vw.order_qty,
        vw.chge_ordqty,
        CASE 
          WHEN :is_max = 'Y' THEN
            CASE 
              WHEN COALESCE(vw.plan_qty, 0) - (COALESCE(vw.order_qty, 0) - COALESCE(vw.chge_ordqty, 0)) < 0
              THEN COALESCE(vw.order_qty, 0) - COALESCE(vw.chge_ordqty, 0)
              ELSE COALESCE(vw.plan_qty, 0)
            END
          ELSE COALESCE(vw.plan_qty, 0)
        END AS plan_iqty,

        NULL AS bl_qty,
        NULL AS is_check,
        vw.cont_no,
        vw.order_acqty,
        vw.req_acqty,
        NULL AS ac_req,
        vw.plan_qty,
        vw.chge_qty,
        vw.factory_code,
        vw.ac_vend,
        vw.status,
        vw.order_type,
        vw.pr_unit,
        vw.locked_information,
        arm.invoice_no
      FROM (
        SELECT * FROM "Customs".vw_ac_srcorder 
        WHERE factory_code = :factory_code
        AND order_no LIKE '%%'
        AND ac_vend LIKE :vend_no
      ) vw
      LEFT JOIN "Customs".ac_allitem_src ais
        ON ais.ac_code = vw.ac_code AND ais.factory_code = vw.factory_code
      LEFT JOIN "Customs".ac_item_m aim
        ON aim.item_acno = vw.item_acno AND aim.factory_code = vw.factory_code
      LEFT JOIN "Customs".ac_req_order aro
        ON aro.order_no = vw.order_no 
        AND aro.order_seq = vw.order_seq 
        AND aro.factory_code = vw.factory_code
      LEFT JOIN (
        SELECT * FROM "Customs".ac_req_m 
        WHERE factory_code = :factory_code 
        AND invoice_no = :invoice_no
      ) arm
        ON aro.req_no = arm.req_no AND aro.factory_code = arm.factory_code
      ORDER BY vw.id
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    return { rows: actualRows, count: null, hasMore };
  } catch (error) {
    console.error("Error fetching AAS list:", error);
    throw error;
  }
}

async function getRDTemp(session_id) {
  const rdTempCache = rd_temp.getAll(session_id);
  console.log("aowia", rdTempCache);
  return rdTempCache;
}
async function clearRDTemp(session_id) {
  try {
    const rdTempCache = rd_temp.clearSession(session_id);
    return rdTempCache;
  } catch (error) {
    console.log("error in db", error);
    throw error;
  }
}
async function checkBoxLeft(
  factory_code,
  order_no,
  order_seq,
  is_check,
  is_max = false,
  plan_iq = 0,
  session_id,
  all_items = null,
) {
  // if (Array.isArray(all_items)) {
  //   if (is_check === "N") {
  //     rd_temp.cache.set(session_id, []);
  //     return { action: "UNSELECT_ALL", ttl_qty: 0 };
  //   }

  //   const orderNos = all_items.map((i) => `'${i.order_no}'`).join(",");
  //   const orderSeqs = all_items.map((i) => `'${i.order_seq}'`).join(",");

  //   const allOrders = await pool.query(
  //     `
  //     SELECT id, ac_code, ac_send, item_acno,
  //       order_acqty::FLOAT, plan_qty::FLOAT,
  //       order_qty::FLOAT, chge_ordqty::FLOAT,
  //       req_acqty::FLOAT,
  //       "type", order_no, order_seq
  //     FROM "Customs".vw_ac_srcorder
  //     WHERE factory_code = :factory_code
  //       AND order_no  IN (${orderNos})
  //       AND order_seq IN (${orderSeqs})
  //     `,
  //     { replacements: { factory_code }, type: pool.QueryTypes.SELECT },
  //   );

  //   const acCodes = [...new Set(allOrders.map((o) => `'${o.ac_code}'`))].join(
  //     ",",
  //   );
  //   const allItemRefs = await pool.query(
  //     `
  //     SELECT A.item_acno, A.formula, A.item_no as ac_code
  //     FROM "Customs".ac_item_ref A
  //     INNER JOIN "Customs".ac_item_m B
  //       ON A.factory_code = B.factory_code AND A.item_acno = B.item_acno
  //     WHERE A.factory_code = :factory_code
  //       AND A.item_no IN (${acCodes})
  //       AND B.status = 7
  //     `,
  //     { replacements: { factory_code }, type: pool.QueryTypes.SELECT },
  //   );

  //   const expQtyResults = await Promise.all(
  //     allOrders.map((order) =>
  //       pool.query(
  //         `
  //         SELECT CASE
  //           WHEN COALESCE("Customs".get_ac_i_exp_qty(:fc, :on, :os), 0) = 0
  //           THEN :plan_qty::NUMERIC
  //           ELSE "Customs".get_ac_i_exp_qty(:fc, :on, :os)
  //         END as v_planqty
  //         `,
  //         {
  //           replacements: {
  //             fc: factory_code,
  //             on: order.order_no,
  //             os: order.order_seq.toString(),
  //             plan_qty: parseFloat(order.plan_qty) || 0,
  //           },
  //           type: pool.QueryTypes.SELECT,
  //         },
  //       ),
  //     ),
  //   );

  //   const updateValues = allOrders.map((order, idx) => {
  //     const itemRef = allItemRefs.find((r) => r.ac_code === order.ac_code);
  //     const v_no = itemRef?.item_acno ?? null;
  //     const v_for = itemRef?.formula || 1;
  //     let v_planqty = parseFloat(expQtyResults[idx][0].v_planqty) || 0;
  //     if (is_max && v_planqty < order.order_qty) v_planqty = order.order_qty;
  //     const v_qty =
  //       Math.round(v_planqty * v_for * 10000) / 10000;
  //     return { order, v_no, v_for, v_planqty, v_qty };
  //   });

  //   for (const { order, v_no, v_qty } of updateValues) {
  //     await pool.query(
  //       `
  //       UPDATE "Customs".ac_srcorder_m
  //       SET item_acno = :v_no, order_acqty = :v_qty
  //       WHERE factory_code = :factory_code
  //         AND order_no = :order_no AND order_seq = :order_seq
  //       `,
  //       {
  //         replacements: {
  //           v_no,
  //           v_qty,
  //           factory_code,
  //           order_no: order.order_no,
  //           order_seq: order.order_seq,
  //         },
  //         type: pool.QueryTypes.UPDATE,
  //       },
  //     );
  //   }

  //   for (const { order, v_no, v_for, v_planqty, v_qty } of updateValues) {
  //     // FIX: Không return/skip khi v_no null hoặc v_qty = 0
  //     // Oracle vẫn tính tiếp, chỉ bỏ qua bước save RD_TEMP
  //     if (!v_no || v_qty === 0) continue;

  //     const input = all_items.find(
  //       (i) => i.order_no === order.order_no && i.order_seq === order.order_seq,
  //     );
  //     const plan_iqty = input?.plan_qty || 0;
  //     const v_leftpo = v_planqty - (order.chge_ordqty || 0);
  //     const bl_qty = v_leftpo > 0 ? Math.min(v_leftpo, plan_iqty) : null;
  //     const ac_req = bl_qty
  //       ? Math.round(bl_qty * v_for  * 10000) / 10000
  //       : null;

  //     if (ac_req && bl_qty) {
  //       //  FIX: Upsert thay vì chỉ save
  //       rd_temp.save(session_id, {
  //         factory_code,
  //         item_no: order.ac_send,
  //         code_no: null,
  //         seq: order.id,
  //         col1: order.order_no,
  //         col2: order.type,
  //         col4: ac_req,
  //         col5: bl_qty,
  //         col6: order.order_seq,
  //       });
  //     }
  //   }

  //   const ttl_qty = rd_temp
  //     .getAll(session_id)
  //     .filter((i) => (i.code_no || "-NULL-") !== "IV_TRANS_D_TW")
  //     .reduce((sum, i) => sum + (parseFloat(i.col5) || 0), 0);

  //   return {
  //     action: "SELECT_ALL",
  //     is_check: "Y",
  //     ttl_qty,
  //     total_processed: updateValues.length,
  //   };
  // }

  let transaction;
  try {
    const sessionKey = session_id;
    transaction = await pool.transaction();
    let plan_iqty = plan_iq;

    const orderResult = await pool.query(
      `
      SELECT
        id, ac_code, ac_send, item_acno,
        order_acqty::FLOAT as order_acqty,
        plan_qty::FLOAT    as plan_qty,
        order_qty::FLOAT   as order_qty,
        chge_ordqty::FLOAT as chge_ordqty,
        req_acqty::FLOAT   as req_acqty,
        "type"
      FROM "Customs".vw_ac_srcorder
      WHERE factory_code = :factory_code
        AND order_no  = :order_no
        AND order_seq = :order_seq
      `,
      {
        replacements: { factory_code, order_no, order_seq },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    if (!orderResult || orderResult.length === 0) {
      await transaction.rollback();
      return { error: "ORDER_NOT_FOUND" };
    }

    const order = orderResult[0];

    // ─── UNCHECK branch ───────────────────────────────────────────────────────
    if (is_check !== "Y") {
      console.log(" UNCHECK: Processing N branch...");
      rd_temp.delete(sessionKey, order.id, order.type);

      const remainingItems = rd_temp.getAll(sessionKey);
      const ttl_qty = remainingItems
        .filter((item) => (item.code_no || "-NULL-") !== "IV_TRANS_D_TW")
        .reduce((sum, item) => sum + (parseFloat(item.col5) || 0), 0);

      await transaction.commit();
      return {
        action: "UNCHECK",
        is_check: "N",
        ac_req: null,
        bl_qty: null,
        ttl_qty,
        message: "Item unchecked successfully",
      };
    }

    // ─── CHECK branch ─────────────────────────────────────────────────────────
    console.log(" CHECK: Processing Y branch...");

    // 1. Tính v_planqty
    const expQtyResult = await pool.query(
      `
      SELECT CASE
        WHEN COALESCE("Customs".get_ac_i_exp_qty(:factory_code, :order_no, :order_seq), 0::NUMERIC) = 0
        THEN :plan_qty::NUMERIC
        ELSE "Customs".get_ac_i_exp_qty(:factory_code, :order_no, :order_seq)
      END::NUMERIC as v_planqty
      `,
      {
        replacements: {
          factory_code,
          order_no,
          order_seq: order_seq.toString(),
          plan_qty: plan_iq !== 0 ? plan_iq : order.plan_qty,
        },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    let v_planqty = parseFloat(expQtyResult[0].v_planqty) || 0;

    // 3. Lấy ITEM_ACNO và FORMULA
    const itemRefResult = await pool.query(
      `
      SELECT A.item_acno, A.formula
      FROM "Customs".ac_item_ref A
      INNER JOIN "Customs".ac_item_m B
        ON A.factory_code = B.factory_code
        AND A.item_acno   = B.item_acno
      WHERE A.factory_code = :factory_code
        AND A.item_no      = :ac_code
        AND B.status       = 7
      `,
      {
        replacements: { factory_code, ac_code: order.ac_code },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    let v_no = null;
    let v_for = 1;
    if (itemRefResult && itemRefResult.length > 0) {
      v_no = itemRefResult[0].item_acno;
      v_for = itemRefResult[0].formula || 1;
    }

    // (Oracle tính TTL_QTY ở ngoài IF/ELSE, không return sớm)
    const calcTtlQty = () =>
      rd_temp
        .getAll(sessionKey)
        .filter((item) => (item.code_no || "-NULL-") !== "IV_TRANS_D_TW")
        .reduce((sum, item) => sum + (parseFloat(item.col5) || 0), 0);

    // 7. Validate
    let final_is_check = "Y";

    // 8-11. Chỉ chạy khi hợp lệ (giống Oracle: ELSE block)
    let ac_req = null,
      bl_qty = null;
    let v_ac = 0,
      v_po = 0,
      v_leftpo = 0,
      v_leftac = 0;
    v_qty = 0;

    if (final_is_check === "Y") {
      const cachedItems = rd_temp.getAll(sessionKey);

      const sameOrderItems = cachedItems.filter(
        (item) =>
          item.col1 === order_no &&
          parseFloat(item.col6) === parseFloat(order_seq) &&
          item.seq !== order.id &&
          (item.code_no || "-NULL-") !== "IV_TRANS_D_TW",
      );

      v_ac = sameOrderItems.reduce(
        (sum, i) => sum + (parseFloat(i.col4) || 0),
        0,
      );
      v_po = sameOrderItems.reduce(
        (sum, i) => sum + (parseFloat(i.col5) || 0),
        0,
      );

      v_leftpo = (v_planqty || 0) - (order.chge_ordqty || 0) - v_po;
      v_leftac = (order.order_acqty || 0) - (order.req_acqty || 0) - v_ac;
      // 2. Apply IS_MAX
      if (is_max === true || is_max === "Y") {
        v_planqty = Math.max(order.order_qty, v_planqty) || 0;
        ac_req = Math.round(v_planqty * (v_for || 1) * 10000) / 10000;
        bl_qty = v_planqty;
      } else {
        console.log(
          "check the value",
          v_leftpo,
          plan_iqty,
          v_leftac,
          order.order_acqty,
          order.req_acqty,
        );

        if (v_leftpo > plan_iqty) {
          ac_req = Math.round(plan_iqty * (v_for || 1) * 10000) / 10000;
          bl_qty = plan_iqty;
        } else if (v_leftpo > 0) {
          ac_req = v_leftac;
          bl_qty = v_leftpo;
        }
      }
      // 4. Tính v_qty
      v_qty = Math.round((v_planqty || 0) * (v_for || 1) * 10000) / 10000;
      if (!v_no || v_qty === 0) {
        console.log("Invalid: ITEM_ACNO NULL or ORD_ACQTY = 0 → IS_CHECK='N'");
        final_is_check = "N";
        await transaction.commit();
        const message =
          "Invalid: ITEM_ACNO NULL or ORD_ACQTY = 0 → IS_CHECK='N'";

        return { success: false, message: message, is_check: final_is_check };
      }

      // 5. UPDATE AC_SRCORDER_M
      await pool.query(
        `
      UPDATE "Customs".ac_srcorder_m
      SET item_acno = :v_no, order_acqty = :v_qty
      WHERE factory_code = :factory_code
        AND order_no  = :order_no
        AND order_seq = :order_seq
      `,
        {
          replacements: { v_no, v_qty, factory_code, order_no, order_seq },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      // 6. UPDATE AC_SRCORDER_D
      await pool.query(
        `
      UPDATE "Customs".ac_srcorder_d
      SET item_acno = :v_no, order_acqty = :v_qty
      WHERE factory_code = :factory_code
        AND order_no  = :order_no
        AND order_seq = :order_seq
      `,
        {
          replacements: { v_no, v_qty, factory_code, order_no, order_seq },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );
      rd_temp.save(sessionKey, {
        factory_code,
        item_no: order.ac_send,
        code_no: null,
        seq: order.id,
        col1: order_no,
        col2: order.type,
        col4: ac_req,
        col5: bl_qty,
        col6: order_seq,
      });
    }

    // 12. TTL_QTY — luôn chạy dù valid hay invalid (giống Oracle nằm ngoài IF/ELSE)
    const ttl_qty = rd_temp
      .getAll(sessionKey)
      .filter((item) => (item.code_no || "-NULL-") !== "IV_TRANS_D_TW")
      .reduce((sum, item) => sum + (parseFloat(item.col5) || 0), 0);

    await transaction.commit();

    return {
      action: final_is_check === "Y" ? "CHECK" : "CHECK_INVALID",
      is_check: final_is_check,
      ac_req,
      bl_qty,
      item_acno: v_no,
      order_acqty: v_qty,
      ac_send: order.ac_send,
      type: order.type,
      plan_iqty,
      v_planqty,
      v_leftpo,
      v_leftac,
      ttl_qty, // ← luôn có, dù invalid
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("ERROR in checkBoxLeft:", error);
    throw error;
  }
}
async function getPlanIQty(factory_code, order_no, order_seq, is_max = false) {
  try {
    const result = await pool.query(
      `
      SELECT plan_qty, order_qty, chge_ordqty
      FROM "Customs".vw_ac_srcorder
      WHERE factory_code = :factory_code 
        AND order_no = :order_no 
        AND order_seq = :order_seq
      `,
      {
        replacements: {
          factory_code: factory_code,
          order_no: order_no,
          order_seq: order_seq,
        },
        type: pool.QueryTypes.SELECT,
      },
    );
    if (!result || result.length === 0) {
      return 0;
    }

    const { plan_qty, order_qty, chge_ordqty } = result[0];

    // Logic: IF NVL(:COND.IS_MAX,'N') = 'Y' THEN
    if (is_max === "Y" || is_max === true) {
      // Handle cả string 'Y' từ query param
      const adjusted_order_qty = (order_qty || 0) - (chge_ordqty || 0);
      if ((plan_qty || 0) < adjusted_order_qty) {
        return adjusted_order_qty;
      }
    }
    return plan_qty || 0;
  } catch (error) {
    console.error("ERROR in getPlanIQty:", error);
    throw error;
  }
}
async function updateCustom(
  session_id,
  factory_code,
  order_no,
  order_seq,
  item_id,
  item_type,
  new_bl_qty,
  is_check = "Y",
  is_max = false,
  plan_iqty,
  order_qty,
  chge_ordqty,
  order_acqty,
  req_acqty,
  force = false,
) {
  try {
    // 1. Tính V_PLANQTY (logic DECODE + GET_AC_I_EXP_QTY)
    let v_planqty;

    // Gọi function GET_AC_I_EXP_QTY từ DB
    const expQtyResult = await pool.query(
      `SELECT "Customs".GET_AC_I_EXP_QTY(:factory_code, :order_no, :order_seq) as exp_qty`,
      {
        replacements: {
          factory_code: factory_code.toString(),
          order_no,
          order_seq: order_seq.toString(),
        },
        type: pool.QueryTypes.SELECT,
      },
    );

    const exp_qty = expQtyResult[0]?.exp_qty || 0;

    // DECODE logic: nếu exp_qty = 0 thì dùng plan_iqty, ngược lại dùng exp_qty
    v_planqty = exp_qty === 0 ? plan_iqty || 0 : exp_qty;

    console.log("📊 V_PLANQTY:", { exp_qty, plan_iqty, v_planqty });

    // 2. Kiểm tra IS_MAX
    if ((v_planqty || 0) < (order_qty || 0) && is_max === true) {
      v_planqty = order_qty || 0;
    }

    console.log("📊 After IS_MAX check:", { v_planqty, order_qty, is_max });

    // 3. Kiểm tra IS_CHECK
    if (is_check !== "Y") {
      const error = new Error("Item không được phép chỉnh sửa (IS_CHECK ≠ Y)");
      error.code = "IS_CHECK_NOT_Y";
      throw error;
    }

    // 4. Lấy V_AC và V_PO từ RdTempCache
    // WHERE FACTORY_CODE=... AND COL1=ORDER_NO AND COL6=ORDER_SEQ AND SEQ<>ID
    const allLeftItems = rd_temp.getLeftItems(session_id);

    const otherLeftItems = allLeftItems.filter(
      (item) =>
        item.factory_code === factory_code &&
        item.col1 === order_no &&
        item.col6 === order_seq &&
        item.seq !== item_id, // ← SEQ <> :AC_SRCORDER_M1.ID
    );

    const v_ac = otherLeftItems.reduce(
      (sum, item) => sum + (parseFloat(item.col4) || 0),
      0,
    );

    const v_po = otherLeftItems.reduce(
      (sum, item) => sum + (parseFloat(item.col5) || 0),
      0,
    );

    console.log("📊 From RD_TEMP cache:", { v_ac, v_po });

    // 5. Tính V_LEFTPO và V_LEFTAC
    const v_leftpo = (v_planqty || 0) - (chge_ordqty || 0) - (v_po || 0);
    const v_leftac = (order_acqty || 0) - (req_acqty || 0) - (v_ac || 0);

    console.log("📊 Left amounts:", { v_leftpo, v_leftac });

    // 6. Kiểm tra vượt quá
    if ((new_bl_qty || 0) > v_leftpo) {
      // ← Thay vì throw, return canForce như updateBlQtyManual
      if (!force) {
        return {
          success: false,
          error: "EXCEED_LIMIT",
          message: `BL_QTY (${new_bl_qty}) vượt quá V_LEFTPO (${v_leftpo})`,
          bl_qty: 0,
          ac_req: null,
          canForce: true, // ← cho phép force
          ttl_qty: rd_temp.getTotalCol5(session_id),
        };
      }
    }
    // 7. Tính AC_REQ
    let ac_req;

    if ((new_bl_qty || 0) === v_leftpo) {
      ac_req = v_leftac;
    } else {
      // ROUND(BL_QTY/DECODE(V_PLANQTY,0,1,V_PLANQTY)*ORD_ACQTY, 4)
      ac_req =
        Math.round(
          ((new_bl_qty || 0) / (v_planqty || 1)) * (order_acqty || 0) * 10000,
        ) / 10000;
    }

    console.log("✅ Calculated:", { bl_qty: new_bl_qty, ac_req });

    // 8. UPDATE RD_TEMP (cache)
    // WHERE SEQ=:AC_SRCORDER_M1.ID AND COL2=:AC_SRCORDER_M1.TYPE
    const currentItem = rd_temp.getOne(session_id, item_id, item_type);
    const allC = rd_temp.getAll(session_id);
    console.log("📦 Session:", session_id);
    console.log("📦 All items:", allC);
    console.log("📦 Current item:", currentItem);

    if (!currentItem) {
      const error = new Error(
        `Không tìm thấy item với SEQ=${item_id}, COL2=${item_type}`,
      );
      error.code = 540123;
      error.type = "RD_TEMP_ERROR";
      throw error;
    }

    rd_temp.set(session_id, item_id, {
      ...currentItem,
      col5: new_bl_qty, // ← COL5 = BL_QTY
      col4: ac_req, // ← COL4 = AC_REQ
    });

    // 9. SELECT SUM(COL5) INTO :COND.TTL_QTY FROM RD_TEMP
    const ttl_qty = rd_temp.getTotalCol5(session_id);

    console.log("📦 Total BL_QTY (TTL_QTY):", ttl_qty);

    return {
      success: true,
      bl_qty: new_bl_qty,
      ac_req: ac_req,
      ttl_qty: ttl_qty,
    };
  } catch (error) {
    console.error("❌ ERROR in updateBlQty:", error);
    throw error;
  }
}
async function updateBlQtyManual(
  factory_code,
  is_max,
  is_check,
  gridData,
  new_bl_qty,
  plan_iqty,
  session_id,
  force = false,
) {
  try {
    // Destructure gridData
    const {
      id,
      type,
      order_no,
      order_seq,
      order_qty,
      chge_ordqty,
      order_acqty,
      req_acqty,
    } = gridData;

    console.log(`\n🔵 UPDATE BL_QTY MANUAL`);
    console.log(`   Item ID: ${id}, Type: ${type}`);
    console.log(`   New BL_QTY: ${new_bl_qty}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 1: Tính V_PLANQTY
    // ═══════════════════════════════════════════════════════════
    // SELECT DECODE(NVL(GET_AC_I_EXP_QTY(...),0),0,NVL(:PLAN_IQTY,0),GET_AC_I_EXP_QTY(...))
    // INTO V_PLANQTY FROM DUAL

    const expQtyResult = await pool.query(
      `
      SELECT COALESCE(
        "Customs".get_ac_i_exp_qty(
          :factory_code::TEXT,
          :order_no,
          :order_seq::TEXT
        ),
        0
      ) as exp_qty
      `,
      {
        replacements: {
          factory_code,
          order_no,
          order_seq,
        },
        type: pool.QueryTypes.SELECT,
      },
    );

    const exp_qty = parseFloat(expQtyResult[0]?.exp_qty) || 0;

    // DECODE: nếu exp_qty = 0 thì dùng plan_iqty, ngược lại dùng exp_qty
    let v_planqty = exp_qty === 0 ? plan_iqty || 0 : exp_qty;

    console.log(`  EXP_QTY: ${exp_qty}, Initial V_PLANQTY: ${v_planqty}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 2: Kiểm tra IS_MAX
    // ═══════════════════════════════════════════════════════════
    // IF NVL(V_PLANQTY,0) < NVL(:ORD_QTY,0) AND NVL(:IS_MAX,'N') = 'Y' THEN
    //     V_PLANQTY := NVL(:ORD_QTY,0);
    // END IF;

    if (
      (v_planqty || 0) < (order_qty || 0) &&
      (is_max === "Y" || is_max === true)
    ) {
      v_planqty = order_qty || 0;
      console.log(`  Applied IS_MAX: V_PLANQTY = ${v_planqty}`);
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 3: Kiểm tra IS_CHECK
    // ═══════════════════════════════════════════════════════════
    // IF :AC_SRCORDER_M1.IS_CHECK='Y' THEN

    if (is_check !== "Y") {
      console.log(`  IS_CHECK ≠ 'Y', cannot modify`);
      const error = new Error(
        "Item không được check, không thể chỉnh sửa BL_QTY",
      );
      error.code = "IS_CHECK_NOT_Y";
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 4: Lấy V_AC và V_PO từ RD_TEMP
    // ═══════════════════════════════════════════════════════════
    // SELECT SUM(NVL(COL4,0)), SUM(NVL(COL5,0))
    // INTO V_AC, V_PO
    // FROM RD_TEMP
    // WHERE FACTORY_CODE=:FACTORY_CODE
    //   AND COL1=:ORDER_NO
    //   AND COL6=:ORDER_SEQ
    //   AND SEQ<>:ID

    const allItems = rd_temp.getAll(session_id);

    const otherItems = allItems.filter(
      (item) =>
        item.factory_code === factory_code &&
        item.col1 === order_no &&
        parseFloat(item.col6) === parseFloat(order_seq) &&
        item.seq !== id, // ← SEQ <> ID
    );

    const v_ac = otherItems.reduce(
      (sum, item) => sum + (parseFloat(item.col4) || 0),
      0,
    );

    const v_po = otherItems.reduce(
      (sum, item) => sum + (parseFloat(item.col5) || 0),
      0,
    );

    console.log(`   📦 From RD_TEMP: V_AC=${v_ac}, V_PO=${v_po}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 5: Tính V_LEFTPO và V_LEFTAC
    // ═══════════════════════════════════════════════════════════
    // V_LEFTPO := NVL(V_PLANQTY,0)-NVL(:CHGE_ORDQTY,0)-NVL(V_PO,0)
    // V_LEFTAC := NVL(:ORD_ACQTY,0)-NVL(:REQ_ACQTY1,0)-NVL(V_AC,0)

    const v_leftpo = (v_planqty || 0) - (chge_ordqty || 0) - (v_po || 0);
    const v_leftac = (order_acqty || 0) - (req_acqty || 0) - (v_ac || 0);

    console.log(`   📊 V_LEFTPO=${v_leftpo}, V_LEFTAC=${v_leftac}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 6: Kiểm tra và tính AC_REQ
    // ═══════════════════════════════════════════════════════════
    // IF NVL(:BL_QTY,0) > V_LEFTPO THEN
    //     :BL_QTY := 0;
    // ELSE
    //     IF NVL(:BL_QTY,0) = V_LEFTPO THEN
    //         :AC_REQ := V_LEFTAC;
    //     ELSE
    //         SELECT ROUND(NVL(:BL_QTY,0)/DECODE(NVL(V_PLANQTY,0),0,1,V_PLANQTY)*NVL(:ORD_ACQTY,0),4) INTO :AC_REQ FROM DUAL;
    //     END IF;
    //     UPDATE RD_TEMP SET COL5=:BL_QTY, COL4=:AC_REQ
    //     WHERE SEQ=:ID AND COL2=:TYPE;
    // END IF;

    let final_bl_qty;
    let final_ac_req;
    console.log("adu force", force);

    // Case 1: vượt V_LEFTPO
    if ((new_bl_qty || 0) > v_leftpo) {
      if (!force) {
        await pool.query("ROLLBACK");
        return {
          success: false,
          error: "EXCEED_LIMIT",
          message: "BL_QTY exceeds V_LEFTPO (message 960036)",
          bl_qty: 0,
          ac_req: null,
          canForce: true,
        };
      }
      // force = true → gán thẳng, tính proportionally
      console.log(`   ⚠️ FORCE: BL_QTY > V_LEFTPO, override`);
      const divisor = (v_planqty || 0) === 0 ? 1 : v_planqty;
      final_bl_qty = new_bl_qty;
      final_ac_req =
        Math.round(((new_bl_qty || 0) / divisor) * (order_acqty || 0) * 10000) /
        10000;
    }
    // Case 2: BL_QTY = V_LEFTPO
    else if ((new_bl_qty || 0) === v_leftpo) {
      console.log(`   BL_QTY = V_LEFTPO → AC_REQ = V_LEFTAC`);
      final_bl_qty = new_bl_qty;
      final_ac_req = v_leftac;
    }
    // Case 3: BL_QTY < V_LEFTPO
    else {
      console.log(`   🔢 BL_QTY < V_LEFTPO → Calculate proportionally`);
      const divisor = (v_planqty || 0) === 0 ? 1 : v_planqty;
      final_ac_req =
        Math.round(((new_bl_qty || 0) / divisor) * (order_acqty || 0) * 10000) /
        10000;
      final_bl_qty = new_bl_qty;
    }

    console.log(` Final: BL_QTY=${final_bl_qty}, AC_REQ=${final_ac_req}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 7: UPDATE RD_TEMP
    // ═══════════════════════════════════════════════════════════
    // UPDATE RD_TEMP SET COL5=:BL_QTY, COL4=:AC_REQ
    // WHERE SEQ=:ID AND COL2=:TYPE

    const currentItem = rd_temp.getOne(session_id, id, type);

    if (!currentItem) {
      const error = new Error(
        `Cannot find item in RD_TEMP: SEQ=${id}, TYPE=${type}`,
      );
      error.code = "RD_TEMP_NOT_FOUND";
      throw error;
    }

    rd_temp.set(session_id, id, {
      ...currentItem,
      col5: final_bl_qty, // ← BL_QTY
      col4: final_ac_req, // ← AC_REQ
    });

    console.log(`    Updated RD_TEMP cache`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 8: Tính TTL_QTY
    // ═══════════════════════════════════════════════════════════
    // SELECT SUM(NVL(COL5,0)) INTO :COND.TTL_QTY FROM RD_TEMP

    const ttl_qty = rd_temp.getTotalCol5(session_id);

    console.log(`    TTL_QTY (Total BL_QTY): ${ttl_qty}`);

    // ═══════════════════════════════════════════════════════════
    // RETURN RESULT
    // ═══════════════════════════════════════════════════════════

    return {
      success: true,
      bl_qty: final_bl_qty,
      ac_req: final_ac_req,
      ttl_qty: ttl_qty,
      v_planqty: v_planqty,
      v_leftpo: v_leftpo,
      v_leftac: v_leftac,
    };
  } catch (error) {
    console.error("❌ ERROR in updateBlQtyManual:", error);
    throw error;
  }
}
/**
 * Confirm - Lưu vào AC_REQ_ORDER
 * KHÔNG CẦN RD_TEMP
 */
async function confirmSelection(
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  vend_no,
  session_id,
) {
  const transaction = await pool.transaction();

  try {
    // 1. Lấy MAX(SEQ) từ AC_REQ_ORDER
    const seqResult = await pool.query(
      `
      SELECT COALESCE(MAX(req_seq), 0) as max_seq
      FROM "Customs".ac_req_order
      WHERE factory_code = :factory_code AND req_no = :req_no
      `,
      {
        replacements: { factory_code, req_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    let v_seq = parseInt(seqResult[0].max_seq) || 0;
    console.log(" Current MAX SEQ:", v_seq);

    // 2. Đọc từ RD_TEMP - Giống Oracle:
    // SELECT COL2 TYPE, SEQ, COL4, ITEM_NO, COL5, COL1, COL6
    // FROM RD_TEMP
    // WHERE NVL(CODE_NO,'-NULL-')<>'IV_TRANS_D_TW'
    // ORDER BY COL1, COL6, SEQ
    const cachedItems = rd_temp.getAll(session_id);
    const itemsToProcess = cachedItems
      .filter((item) => (item.code_no || "-NULL-") !== "IV_TRANS_D_TW")
      .sort((a, b) => {
        if (a.col1 !== b.col1) return a.col1.localeCompare(b.col1);
        if (a.col6 !== b.col6) return parseFloat(a.col6) - parseFloat(b.col6);
        return a.seq - b.seq;
      });
    console.log("rd_temp", cachedItems);

    console.log(`📦 Processing ${itemsToProcess.length} items from RD_TEMP`);

    // 3. FOR I IN ... LOOP
    for (const I of itemsToProcess) {
      console.log(
        `\n🔄 Item: SEQ=${I.seq}, ORDER_NO=${I.col1}, ORDER_SEQ=${I.col6}, TYPE=${I.col2}`,
      );

      // BEGIN
      let v_qc = "N";

      // SELECT REQ_QC INTO V_QC FROM AC_VEND_BASE
      // WHERE FACTORY_CODE=:PARAMETER.P_ORGID
      // AND VEND_NO=:AC_REQ_M.VEND_NO
      // AND AC_SEND=I.ITEM_NO
      // EXCEPTION WHEN NO_DATA_FOUND THEN V_QC:='N'
      try {
        const qcResult = await pool.query(
          `
          SELECT req_qc 
          FROM "Customs".ac_vend_base 
          WHERE factory_code = :factory_code 
            AND vend_no = :vend_no 
            AND ac_send = :ac_send
          `,
          {
            replacements: {
              factory_code,
              vend_no,
              ac_send: I.item_no, // I.ITEM_NO
            },
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );

        if (qcResult && qcResult.length > 0) {
          v_qc = qcResult[0].req_qc || "N";
        }
      } catch (e) {
        v_qc = "N";
      }

      console.log(`   V_QC = ${v_qc}`);

      // SELECT COUNT(1) INTO X FROM AC_REQ_ORDER
      // WHERE FACTORY_CODE = :AC_REQ_M.FACTORY_CODE
      // AND REQ_NO=:AC_REQ_M.REQ_NO
      // AND ORDER_NO=I.COL1
      // AND ORDER_SEQ=I.COL6
      const existResult = await pool.query(
        `
        SELECT COUNT(1) as cnt
        FROM "Customs".ac_req_order
        WHERE factory_code = :factory_code 
          AND req_no = :req_no 
          AND order_no = :order_no 
          AND order_seq = :order_seq
        `,
        {
          replacements: {
            factory_code,
            req_no,
            order_no: I.col1, // I.COL1
            order_seq: I.col6, // I.COL6
          },
          type: pool.QueryTypes.SELECT,
          transaction,
        },
      );

      const x = parseInt(existResult[0].cnt) || 0;

      // IF X>0 THEN UPDATE
      if (x > 0) {
        console.log("UPDATE existing record");

        // UPDATE AC_REQ_ORDER
        // SET REQ_ACQTY=REQ_ACQTY+NVL(I.COL4,0),
        //     REQ_QTY=REQ_QTY+NVL(I.COL5,0)
        await pool.query(
          `
          UPDATE "Customs".ac_req_order 
          SET req_acqty = req_acqty + :col4,
              req_qty = req_qty + :col5,
              amount = ROUND((req_qty + :col5) * COALESCE(price, 0), 2)
          WHERE factory_code = :factory_code 
            AND req_no = :req_no 
            AND order_no = :order_no 
            AND order_seq = :order_seq
          `,
          {
            replacements: {
              col4: I.col4 || 0, // I.COL4
              col5: I.col5 || 0, // I.COL5
              factory_code,
              req_no,
              order_no: I.col1,
              order_seq: I.col6,
            },
            type: pool.QueryTypes.UPDATE,
            transaction,
          },
        );
      }
      // ELSE INSERT
      else {
        v_seq++;
        console.log(`   ➕ INSERT new record with SEQ=${v_seq}`);

        // IF I.TYPE=1 THEN
        if (I.col2 === "1") {
          // INSERT INTO AC_REQ_ORDER(...)
          // SELECT ... FROM AC_SRCORDER_M WHERE ID=I.SEQ
          await pool.query(
            `
            INSERT INTO "Customs".ac_req_order (
              factory_code, req_no, req_seq, order_type, src_id,
              order_date, order_no, order_seq, ac_send, cont_no, ac_code,
              item_acno, order_acqty, req_acqty, req_qc, req_qty,
              currency, price, amount,grt_dept, grt_user, grt_date
            )
            SELECT 
              :factory_code, :req_no, :v_seq,  order_type, :src_id,
              order_date, :order_no, :order_seq, ac_send, cont_no, ac_code,
              item_acno, order_acqty, :req_acqty, :req_qc, :req_qty,
              currency, price, ROUND(:req_qty * COALESCE(price, 0), 2),:grt_dept, :grt_user, :grt_date
            FROM "Customs".vw_ac_srcorder
            WHERE id = :src_id
            `,
            {
              replacements: {
                factory_code,
                req_no,
                v_seq,
                order_no: I.col1, // I.COL1
                order_seq: I.col6, // I.COL6
                req_acqty: I.col4 || 0, // I.COL4
                req_qc: v_qc,
                req_qty: I.col5 || 0, // I.COL5
                grt_dept: department_code,
                grt_user: user_code,
                grt_date: new Date(),
              },
              type: pool.QueryTypes.INSERT,
              transaction,
            },
          );
        }
        // ELSE (TYPE ≠ 1)
        else {
          // INSERT INTO AC_REQ_ORDER(...)
          // SELECT ... FROM AC_SRCORDER_D WHERE ID=I.SEQ
          await pool.query(
            `
            INSERT INTO "Customs".ac_req_order (
              factory_code, req_no, req_seq, order_type, src_id,
              order_date, order_no, order_seq, ac_send, cont_no, ac_code,
              item_acno, order_acqty, req_acqty, req_qc, req_qty,
              currency, price, amount, grt_dept, grt_user, grt_date
            )
            SELECT 
              :factory_code, :req_no, :v_seq, order_type, :src_id,
              order_date, :order_no, :order_seq, ac_send, cont_no, ac_code,
              item_acno, order_acqty, :req_acqty, :req_qc, :req_qty,
              currency, price, ROUND(:req_qty * COALESCE(price, 0), 2),:grt_dept, :grt_user, :grt_date
            FROM "Customs".vw_ac_srcorder
            WHERE id = :src_id
            `,
            {
              replacements: {
                factory_code,
                req_no,
                v_seq,
                src_id: I.seq,
                order_no: I.col1,
                order_seq: I.col6,
                req_acqty: I.col4 || 0,
                req_qc: v_qc,
                req_qty: I.col5 || 0,
                grt_dept: department_code,
                grt_user: user_code,
                grt_date: new Date(),
              },
              type: pool.QueryTypes.INSERT,
              transaction,
            },
          );
        }
      }
    } // END LOOP

    // 4. DELETE FROM RD_TEMP
    console.log("🗑️ Clearing RD_TEMP cache...");
    rd_temp.clearSession(session_id);

    // 5. COMMIT
    await transaction.commit();
    console.log("✅ Confirm All completed successfully");

    return {
      success: true,
      message: "All items confirmed successfully",
      items_processed: itemsToProcess.length,
      final_seq: v_seq,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ ERROR in confirmAllFromCache:", error);
    throw error;
  }
}
async function search(query, factory_code, language, limit, offset, is_max) {
  try {
    let replacements = {
      factory_code: factory_code || null,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
      language: language || "E",
      order_no: query?.order_no ? `%${query.order_no}%` : "%%",
      vend_no: query?.vend_no || null,
      s_date: query?.s_date_1 || null,
      e_date: query?.e_date_1 || null,
      item_no: query?.item_acno ? `%${query.item_acno}%` : "%%",
      item_no1: query?.ac_code ? `%${query.ac_code}%` : "%%",
      status: query?.status ?? null,
      item_acno: query?.item_acno || null,
      invoice_no: query?.invoice_no || null,
      is_item: query?.is_item || null,
      s_cfm: query?.s_date_2 || null,
      e_cfm: query?.e_date_2 || null,
      order_type: query?.order_type || null,
      is_max: is_max ?? "N",
    };

    const sql = `
SELECT distinct on(vw.id)
    vw.id,
    vw.type,
    vw.order_date,
    vw.order_no,
    vw.order_seq,
    vw.vr_cfmday,
    vw.ac_code,
    CASE
      WHEN :language = 'T' THEN ais.name_t
      WHEN :language = 'E' THEN ais.name_e
      ELSE ais.name_s
    END AS itemnm,
    "Customs".gf_code_name(:factory_code, '1108', vw.pr_unit, :language) AS unitnm,
    CASE
      WHEN :language = 'T' THEN aim.item_acname_t
      WHEN :language = 'E' THEN aim.item_acname_e
      ELSE aim.item_acname_l
    END AS itemnm1,
    "Customs".gf_code_name(:factory_code, '1108', aim.unit, :language) AS unitnm1,
    vw.item_acno,
    vw.order_qty,
    vw.chge_ordqty,
    CASE 
      WHEN :is_max = 'Y' THEN
        CASE 
          WHEN COALESCE(vw.plan_qty, 0) - (COALESCE(vw.order_qty, 0) - COALESCE(vw.chge_ordqty, 0)) < 0
          THEN COALESCE(vw.order_qty, 0) - COALESCE(vw.chge_ordqty, 0)
          ELSE COALESCE(vw.plan_qty, 0)
        END
      ELSE COALESCE(vw.plan_qty, 0)
    END AS plan_iqty,

    NULL AS bl_qty,
    NULL AS is_check,
    vw.cont_no,
    vw.order_acqty,
    vw.req_acqty,
    NULL AS ac_req,
    vw.plan_qty,
    vw.chge_qty,
    vw.factory_code,
    vw.ac_vend,
    vw.status,
    vw.order_type,
    vw.pr_unit
 from (select * from "Customs".vw_ac_srcorder where factory_code =:factory_code
    AND order_no LIKE :order_no
    AND ac_vend LIKE :vend_no) vw
  LEFT JOIN "Customs".ac_allitem_src ais
    ON ais.ac_code = vw.ac_code and ais.factory_code = vw.factory_code
  LEFT JOIN "Customs".ac_item_m aim
    ON aim.item_acno = vw.item_acno and aim.factory_code = vw.factory_code
  LEFT JOIN "Customs".ac_req_order aro
    ON aro.order_no = vw.order_no and aro.order_seq = vw.order_seq and aro.factory_code = vw.factory_code
  LEFT join (select * from "Customs".ac_req_m where factory_code=:factory_code and invoice_no = :invoice_no) arm
    ON aro.req_no = arm.req_no and aro.factory_code = arm.factory_code
  WHERE
    vw.factory_code = :factory_code
    AND vw.order_no LIKE :order_no
    AND (vw.ac_vend = :vend_no OR :vend_no IS NULL)
    AND (:s_date IS NULL OR DATE_TRUNC('day', vw.order_date) >= DATE_TRUNC('day', :s_date::timestamp))
    AND (:e_date IS NULL OR DATE_TRUNC('day', vw.order_date) <= DATE_TRUNC('day', :e_date::timestamp))
    AND vw.ac_code LIKE :item_no1 
    AND (:status IS NULL OR vw.status = :status)
    AND vw.item_acno LIKE :item_no
    --AND arm.invoice_no = :invoice_no
    AND (
      (:is_item = 'Y' AND vw.item_acno IS NOT NULL) OR
      (:is_item  = 'N' AND vw.item_acno IS NULL) OR
      :is_item IS NULL
    )
    AND (
      :s_cfm IS NULL OR
      vw.vr_cfmday >= DATE_TRUNC('day', :s_cfm::timestamp)
    )
    AND (
      :e_cfm IS NULL OR
      vw.vr_cfmday <= DATE_TRUNC('day', :e_cfm::timestamp)
    )
    AND vw.ac_vend IS NOT NULL
  ORDER BY vw.id
  LIMIT :limit
  OFFSET :offset;
`;
    const countSql = `
SELECT COUNT(*) as total
 from (select * from "Customs".vw_ac_srcorder where factory_code =:factory_code
    AND order_no LIKE '%%'
    AND ac_vend LIKE :vend_no) vw
  LEFT JOIN "Customs".ac_allitem_src ais
    ON ais.ac_code = vw.ac_code and ais.factory_code = vw.factory_code
  LEFT JOIN "Customs".ac_item_m aim
    ON aim.item_acno = vw.item_acno and aim.factory_code = vw.factory_code
  LEFT JOIN "Customs".ac_req_order aro
    ON aro.order_no = vw.order_no and aro.order_seq = vw.order_seq and aro.factory_code = vw.factory_code
  LEFT join (select * from "Customs".ac_req_m where factory_code=:factory_code and invoice_no = :invoice_no) arm
    ON aro.req_no = arm.req_no and aro.factory_code = arm.factory_code
  WHERE
    vw.factory_code = :factory_code
    AND vw.order_no LIKE :order_no
    AND (vw.ac_vend = :vend_no OR :vend_no IS NULL)
    AND (:s_date IS NULL OR DATE_TRUNC('day', vw.order_date) >= DATE_TRUNC('day', :s_date::timestamp))
    AND (:e_date IS NULL OR DATE_TRUNC('day', vw.order_date) <= DATE_TRUNC('day', :e_date::timestamp))
    AND vw.ac_code LIKE :item_no1
    AND (:status IS NULL OR vw.status = :status)
    AND vw.item_acno LIKE :item_no
    --AND arm.invoice_no = :invoice_no
    AND (
      (:is_item = 'Y' AND vw.item_acno IS NOT NULL) OR
      (:is_item  = 'N' AND vw.item_acno IS NULL) OR
      :is_item IS NULL
    )
    AND (
      :s_cfm IS NULL OR
      vw.vr_cfmday >= DATE_TRUNC('day', :s_cfm::timestamp)
    )
    AND (
      :e_cfm IS NULL OR
      vw.vr_cfmday <= DATE_TRUNC('day', :e_cfm::timestamp)
    )
    AND vw.ac_vend IS NOT NULL
`;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    // Count total records (chỉ khi offset = 0)
    let total = null;
    if (parseInt(offset) === 0) {
      const countResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.total) || 0;
    }

    // Check if has more records
    const hasMore = rows.length >= limit;

    return {
      rows: rows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in search function:", error);
    console.error("Error details:", error.message);
    throw error;
  }
}


module.exports = {
  getListOfAAS,
  getRDTemp,
  clearRDTemp,
  checkBoxLeft,
  updateBlQtyManual,
  getPlanIQty,
  updateCustom,
  confirmSelection,
  search,
};
