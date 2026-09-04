const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const { RdTempCache } = require("../rd_temp/rd_temp.js");

// Tạo instance riêng với strategy phù hợp
const allchkCache = new RdTempCache("VW_AC_ALLCHK", (item1, item2) => {
  return (
    parseFloat(item1.seq) === parseFloat(item2.seq) &&
    String(item1.code_no || "") === String(item2.code_no || "") &&
    String(item1.item_no || "") === String(item2.item_no || "") &&
    String(item1.col6 || "") === String(item2.col6 || "")
  );
});

async function getListOfALLCHK(
  factory_code,
  vend_no,
  order_no,
  chk_no,
  rs_date,
  re_date,
  s_cfm,
  e_cfm,
  is_item,
  ac_type,
  limit,
  offset,
  isAll = false,
) {
  try {
    // Xây dựng điều kiện permission
    let replacements = {
      factory_code: factory_code || null,
      vend_no: vend_no || null,
      order_no: order_no || null,
      chk_no: chk_no || null,
      rs_date: rs_date || null,
      re_date: re_date || null,
      s_cfm: s_cfm || null,
      e_cfm: e_cfm || null,
      is_item: is_item || null,
      ac_type: ac_type || null,
      limit: parseInt(limit) + 1 || 10,
      offset: parseInt(offset) || 0,
    };

    order_no = order_no === undefined || order_no === "" ? null : order_no;
    chk_no = chk_no === undefined || chk_no === "" ? null : chk_no;
    // SQL query hoàn chỉnh - giống như Oracle query
    const sql = `
     WITH filtered_base AS MATERIALIZED (
    SELECT 
      vw.*,
      "Customs".gf_orderseq_send(vw.FACTORY_CODE, vw.ORDER_NO, vw.ORDER_SEQ::NUMERIC) as ac_send_value,
      "Customs".gf_chkseq_req(vw.FACTORY_CODE, vw.CHK_NO, vw.CHK_SEQ::NUMERIC) as chk_req_value
    FROM "Customs".vw_ac_allchk vw
    WHERE vw.factory_code = :factory_code 
      AND vw.AC_VEND = :vend_no
  ),
  final_filtered AS (
    SELECT fb.*
    FROM filtered_base fb
    WHERE fb.ac_send_value IN (
      SELECT AC_SEND FROM "Customs".ac_send_base WHERE AC_TYPE = :ac_type
    )
    AND fb.chk_req_value = 'N'
  )
      SELECT 
        vw.RCPT_DATE,
        vw.CHK_NO,
        vw.CHK_SEQ,
        vw.ORDER_NO,
        vw.ORDER_SEQ,
        vw.AC_CODE,
        vw.FACTORY_CODE,
        vw.src,
        
        -- ITEMNM từ vw_ac_allitem (giống DECODE)
        (SELECT NAME_S FROM "Customs".ac_allitem_src
         WHERE AC_CODE = vw.AC_CODE) AS ITEMNM,
        
        -- UNITNM - GF_CODE_NAME(factory_code,'UNIT',PR_UNIT,:PARAMETER.P_CHARSET)
        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, '1108', sm.PR_UNIT, 'S')
         FROM "Customs".ac_srcorder_m sm
         WHERE sm.FACTORY_CODE = vw.FACTORY_CODE
         AND sm.ORDER_NO = vw.ORDER_NO
         AND sm.ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS UNITNM,
        
        -- SENDNM - GF_CODE_NAME(factory_code,'ACSEND',AC_SEND,:PARAMETER.P_CHARSET)
        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, 'ACSEND', sm.AC_SEND, 'S')
         FROM "Customs".ac_srcorder_m sm
         WHERE sm.FACTORY_CODE = vw.FACTORY_CODE
         AND sm.ORDER_NO = vw.ORDER_NO
         AND sm.ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS SENDNM,
        
       
        -- PR_FORMULA từ ac_srcorder_m
        (SELECT PR_FORMULA FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS PR_FORMULA,
        
   (SELECT AC_SEND FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS AC_SEND,
        
        -- V_FOR từ ac_item_ref và ac_item_m
        (SELECT A.FORMULA 
         FROM "Customs".ac_item_ref A
         INNER JOIN "Customs".ac_item_m B
           ON A.factory_code = B.factory_code
           AND A.ITEM_ACNO = B.ITEM_ACNO
         WHERE A.factory_code = vw.FACTORY_CODE
         AND A.ITEM_NO = vw.AC_CODE
         AND B.STATUS = 7
         LIMIT 1) AS V_FOR,
        
        vw.ITEM_ACNO,
        
        -- ITEMNM1 từ ac_item_m (giống DECODE)
        (SELECT item_acname_l FROM "Customs".ac_item_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ITEM_ACNO = vw.ITEM_ACNO) AS ITEMNM1,
        
        -- UNITNM1 - GF_CODE_NAME(factory_code,'UNIT',UNIT,:PARAMETER.P_CHARSET)
        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, '1108', im.UNIT, 'S')
         FROM "Customs".ac_item_m im
         WHERE im.FACTORY_CODE = vw.FACTORY_CODE
         AND im.ITEM_ACNO = vw.ITEM_ACNO
         LIMIT 1) AS UNITNM1,
        
        -- order_qty từ ac_srcorder_m
        (SELECT order_qty FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS order_qty,
        
        -- Y_RCPT từ ac_srcorder_m (có điều kiện SRC)
        (SELECT SUM(COALESCE(REQ_QTY,0)) as Y_RCPT FROM "Customs".ac_req_order
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND order_no = vw.order_no
         AND order_seq = vw.order_seq::NUMERIC
         LIMIT 1) AS Y_RCPT,
        
        vw.RCPT_QTY,
        
        NULL AS BL_QTY,
        NULL AS IS_CHECK,
        
        -- CONT_NO từ ac_srcorder_m
        (SELECT CONT_NO FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS CONT_NO,
        
        -- order_acqty từ ac_srcorder_m
        (SELECT order_acqty FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS order_acqty,
        
        -- REQ_ACQTY1 từ ac_srcorder_m
        (SELECT SUM(COALESCE(REQ_ACQTY,0)) AS REQ_ACQTY FROM "Customs".ac_req_order
         WHERE 
         ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS REQ_ACQTY1,
        
        NULL AS AC_REQ
        
      FROM final_filtered vw
       WHERE
    (:order_no IS NULL OR vw.ORDER_NO ILIKE :order_no || '%') AND
    (vw.CHK_NO = :chk_no OR :chk_no IS NULL) AND
    (DATE_TRUNC('day', vw.RCPT_DATE) >= DATE_TRUNC('day', :rs_date::timestamp) OR :rs_date IS NULL) AND
    (DATE_TRUNC('day', vw.RCPT_DATE) <= DATE_TRUNC('day', :re_date::timestamp) OR :re_date IS NULL) AND
    ((:is_item = 'Y' AND vw.ITEM_ACNO IS NOT NULL) OR 
     (:is_item = 'N' AND vw.ITEM_ACNO IS NULL) OR 
     :is_item IS NULL) AND
    (:s_cfm IS NULL OR 
     (SELECT VR_CFMDAY FROM "Customs".ac_srcorder_m
      WHERE FACTORY_CODE = vw.FACTORY_CODE
        AND ORDER_NO = vw.ORDER_NO 
        AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
      LIMIT 1) >= DATE_TRUNC('day', :s_cfm::timestamp)) AND
    (:e_cfm IS NULL OR 
     (SELECT VR_CFMDAY FROM "Customs".ac_srcorder_m
      WHERE FACTORY_CODE = vw.FACTORY_CODE
        AND ORDER_NO = vw.ORDER_NO 
        AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
      LIMIT 1) <= DATE_TRUNC('day', :e_cfm::timestamp))
     ORDER BY vw.RCPT_DATE DESC, vw.CHK_NO, vw.CHK_SEQ
   ${!isAll ? "LIMIT :limit OFFSET :offset" : ""}
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    // Tính toán order_acqty theo công thức Oracle
    // :VW_AC_ALLCHK.order_acqty:=:VW_AC_ALLCHK.order_qty*NVL(V_FOR,1)*NVL(:VW_AC_ALLCHK.PR_FORMULA,1);
    rows.forEach((row) => {
      if (row.order_qty !== null) {
        const vFor = row.V_FOR || 1;
        const prFormula = row.PR_FORMULA || 1;
        row.CALCULATED_order_acqty = row.order_qty * vFor * prFormula;
      }
    });
    let total = null;
    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    return { rows: actualRows, count: total, hasMore: hasMore };
  } catch (error) {
    console.error("Error fetching ALLCHK list:", error);
    throw error;
  }
}
async function checkBox(
  factory_code,
  is_check,
  session_id,
  gridData,
  all_items = null,
) {
  // ── SELECT ALL / UNSELECT ALL ──
  if (all_items !== null) {
    const { rows } = await getListOfALLCHK(
      factory_code,
      all_items?.vend_no,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      all_items?.ac_type,
      10,
      1,
      true,
    );
    if (is_check === "N") {
      allchkCache.cache.set(session_id, []);
      return { action: "UNSELECT_ALL", is_check: "N", ttl_qty: 0 };
    }

    // ── BATCH: Lấy tất cả item_acno + formula 1 lần ──
    const acCodes = [...new Set(rows.map((i) => `'${i.ac_code}'`))].join(",");
    const allItemRefs = await pool.query(
      `
      SELECT A.item_acno, A.formula, A.item_no as ac_code
      FROM "Customs".ac_item_ref A
      INNER JOIN "Customs".ac_item_m B
        ON A.factory_code = B.factory_code AND A.item_acno = B.item_acno
      WHERE A.factory_code = :factory_code
        AND A.item_no IN (${acCodes})
        AND B.status = 7
    `,
      { replacements: { factory_code }, type: pool.QueryTypes.SELECT },
    );
    const processedItems = [];
    // ── Loop lưu vào cache (không cần DB) ──
    for (const item of rows) {
      // Validate
      if (!item.item_acno || (item.rcpt_qty || 0) === 0) continue;

      const itemRef = allItemRefs.find((r) => r.ac_code === item.ac_code);
      const v_for = itemRef?.formula || 1;

      const bl_qty = item.rcpt_qty;
      const ac_req =
        Math.round(bl_qty * v_for  * 10000) / 10000;

      allchkCache.save(session_id, {
        seq: item.src,
        col4: ac_req,
        item_no: item.chk_no,
        col5: bl_qty,
        col6: item.chk_seq,
        code_no: item.ac_send,
        col1: item.order_no,
        factory_code: item.order_seq,
        name_s: item.ac_code,
        name_t: item.item_acno,
        col2: null,
      });
      processedItems.push({
        chk_no: item.chk_no,
        chk_seq: item.chk_seq,
        bl_qty,
        ac_req,
      });
    }
    const ttl_qty = allchkCache.getTotalCol5(session_id);
    return {
      action: "SELECT_ALL",
      is_check: "Y",
      ttl_qty,
      total_processed: rows.length,
      items: processedItems,
    };
  }
  let transaction;
  try {
    transaction = await pool.transaction();

    // ========================================
    // NHÁNH 1: IS_CHECK = 'Y' (TICK CHECKBOX)
    // ========================================
    if (is_check === "Y") {
      // ───────────────────────────────────────
      // BƯỚC 1: TÌM ITEM_ACNO VÀ FORMULA
      // ───────────────────────────────────────
      // SELECT A.ITEM_ACNO, A.FORMULA
      // INTO V_NO, V_FOR
      // FROM AC_ITEM_REF A, AC_ITEM_M B
      // WHERE A.FACTORY_CODE=:PARAMETER.P_ORGID
      //   AND A.ITEM_NO=:VW_AC_ALLCHK.AC_CODE
      //   AND A.FACTORY_CODE=B.FACTORY_CODE
      //   AND A.ITEM_ACNO=B.ITEM_ACNO
      //   AND B.STATUS=7

      let v_no = null;
      let v_for = null;

      try {
        const itemRefResult = await pool.query(
          `
          SELECT A.item_acno, A.formula 
          FROM "Customs".ac_item_ref A
          INNER JOIN "Customs".ac_item_m B 
            ON A.factory_code = B.factory_code 
            AND A.item_acno = B.item_acno
          WHERE A.factory_code = :factory_code 
            AND A.item_no = :ac_code
            AND B.status = 7
          `,
          {
            replacements: {
              factory_code: factory_code,
              ac_code: gridData.ac_code,
            },
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );
        console.log("du", itemRefResult);

        if (itemRefResult && itemRefResult.length > 0) {
          v_no = itemRefResult[0].item_acno;
          v_for = itemRefResult[0].formula;
        }
      } catch (err) {
        v_no = null;
        v_for = null;
      }

      // ───────────────────────────────────────
      // BƯỚC 2: VALIDATE - KIỂM TRA HỢP LỆ
      // ───────────────────────────────────────
      // IF :VW_AC_ALLCHK.ITEM_ACNO IS NULL OR NVL(:VW_AC_ALLCHK.RCPT_QTY,0)=0 THEN
      //     SET_ALERT_PROPERTY('MESSAGE',ALERT_MESSAGE_TEXT,Customs.gf_mesgnm(960038,:PARAMETER.P_CHARSET));
      //     N:=SHOW_ALERT('MESSAGE');
      //     :VW_AC_ALLCHK.IS_CHECK:='N';

      if (
        gridData.item_acno === null ||
        gridData.item_acno === undefined ||
        (gridData.rcpt_qty || 0) === 0
      ) {
        console.log("VALIDATION FAILED: ITEM_ACNO is NULL or RCPT_QTY = 0");

        await transaction.commit();

        return {
          action: "CHECK_INVALID",
          is_check: "N",
          bl_qty: null,
          ac_req: null,
          ttl_qty: null,
          message: "ITEM_ACNO is NULL or RCPT_QTY is 0",
          message_code: 960038,
          show_alert: true,
          success: false,
        };
      }
      const bl_qty = gridData.rcpt_qty- gridData.y_rcpt;
      console.log("van lun v thoi", gridData.rcpt_qty,gridData.y_rcpt);
      
      const ac_req =
        Math.round(
          gridData.rcpt_qty *
            (v_for || 1) *
            10000,
        ) / 10000;

      allchkCache.save(session_id, {
        seq: gridData.src, // :VW_AC_ALLCHK.SRC (ID record)
        col4: ac_req, // :VW_AC_ALLCHK.AC_REQ (Số lượng hải quan)
        item_no: gridData.chk_no, // :VW_AC_ALLCHK.CHK_NO (Mã kiểm tra)
        col5: bl_qty, // :VW_AC_ALLCHK.BL_QTY (Số lượng B/L)
        col6: gridData.chk_seq, // :VW_AC_ALLCHK.CHK_SEQ (Sequence kiểm tra)
        code_no: gridData.ac_send, // :VW_AC_ALLCHK.AC_SEND (Mã gửi)
        col1: gridData.order_no, // :VW_AC_ALLCHK.ORDER_NO (Số đơn hàng)
        factory_code: gridData.order_seq, // :VW_AC_ALLCHK.ORDER_SEQ (Sequence đơn hàng)
        name_s: gridData.ac_code, // :VW_AC_ALLCHK.AC_CODE (Mã AC)
        name_t: gridData.item_acno, // :VW_AC_ALLCHK.ITEM_ACNO (Mã hải quan)
        col2: null, // col2 để match với cache logic
      });

      // ───────────────────────────────────────
      // BƯỚC 5: TÍNH TỔNG TTL_QTY
      // ───────────────────────────────────────
      // SELECT SUM(NVL(COL5,0)) INTO :COND1.TTL_QTY FROM RD_TEMP

      const ttl_qty = allchkCache.getTotalCol5(session_id);
      await transaction.commit();
      return {
        action: "CHECK",
        is_check: "Y",
        bl_qty,
        ac_req,
        ttl_qty,
        v_no,
        v_for,
        message: "Item checked successfully",
        success: true,
      };

      // ========================================
      // NHÁNH 2: IS_CHECK = 'N' (UNTICK CHECKBOX)
      // ========================================
    } else {
      console.log("UNTICK: Processing N branch...");

      // Xóa theo đúng 3 điều kiện như Oracle:
      // DELETE WHERE SEQ=SRC AND ITEM_NO=CHK_NO AND COL6=CHK_SEQ
      const sessionData = allchkCache.getAll(session_id);
      const filtered = sessionData.filter(
        (item) =>
          !(
            parseFloat(item.seq) === parseFloat(gridData.src) &&
            String(item.item_no) === String(gridData.chk_no) &&
            String(item.col6) === String(gridData.chk_seq)
          ),
      );
      allchkCache.cache.set(session_id, filtered);

      const ttl_qty = allchkCache.getTotalCol5(session_id);
      console.log(`Total TTL_QTY after delete: ${ttl_qty}`);

      await transaction.commit();

      return {
        action: "UNCHECK",
        is_check: "N",
        bl_qty: null,
        ac_req: null,
        ttl_qty,
        message: "Item unchecked successfully",
        success: true,
      };
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(" ERROR in checkBoxLeft:", error);
    throw error;
  }
}

async function getPlanIQty(factory_code, order_no, order_seq, is_max = false) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT plan_qty, order_qty, chge_ordqty
      FROM "Customs".vw_ac_srcorder
      WHERE factory_code = $1 
        AND order_no = $2 
        AND order_seq = $3
    `,
      [factory_code, order_no, order_seq],
    );

    if (result.rows.length === 0) {
      return 0;
    }

    const { plan_qty, order_qty, chge_ordqty } = result.rows[0];

    // Logic: IF NVL(:COND.IS_MAX,'N') = 'Y' THEN
    if (is_max) {
      const adjusted_order_qty = (order_qty || 0) - (chge_ordqty || 0);
      if ((plan_qty || 0) < adjusted_order_qty) {
        return adjusted_order_qty;
      }
    }

    return plan_qty || 0;
  } catch (error) {
    console.error("ERROR in getPlanIQty:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function updateBlQty(
  factory_code,
  order_no,
  order_seq,
  item_id,
  new_bl_qty,
  is_max = false,
  right_items = [],
  other_left_items = [],
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lấy thông tin đơn hàng
    const orderResult = await client.query(
      `
      SELECT 
        plan_iqty, plan_qty, order_acqty, order_qty, 
        chge_ordqty, req_acqty1
      FROM "Customs".vw_ac_srcorder
      WHERE factory_code = $1 
        AND order_no = $2 
        AND order_seq = $3
    `,
      [factory_code, order_no, order_seq],
    );

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderResult.rows[0];

    // 2. Tính V_PLANQTY
    let v_planqty = order.plan_qty || 0;

    if (is_max) {
      const adjusted_order_qty =
        (order.order_qty || 0) - (order.chge_ordqty || 0);
      if (v_planqty < adjusted_order_qty) {
        v_planqty = adjusted_order_qty;
      }
    }

    // 3. Tính V_PO từ RIGHT items
    const v_po = right_items
      .filter(
        (item) =>
          item.order_no === order_no &&
          item.order_seq === order_seq &&
          item.code_no === "IV_TRANS_D_TW",
      )
      .reduce((sum, item) => sum + (parseFloat(item.out_qty) || 0), 0);

    // 4. Tính V_AC từ LEFT items khác
    const v_ac = other_left_items
      .filter(
        (item) =>
          item.order_no === order_no &&
          item.order_seq === order_seq &&
          item.id !== item_id,
      )
      .reduce((sum, item) => sum + (parseFloat(item.ac_req) || 0), 0);

    // 5. Tính V_LEFTPO và V_LEFTAC
    const v_leftpo = (v_planqty || 0) - (order.chge_ordqty || 0) - v_po;
    const v_leftac = (order.order_acqty || 0) - (order.req_acqty1 || 0) - v_ac;

    // 6. Kiểm tra vượt quá không
    if ((new_bl_qty || 0) > v_leftpo) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "EXCEED_LIMIT",
        message: "BL_QTY exceeds V_LEFTPO (message 960036)",
        bl_qty: 0,
        ac_req: null,
      };
    }

    // 7. Tính lại AC_REQ
    let ac_req;

    if ((new_bl_qty || 0) === v_leftpo) {
      ac_req = v_leftac;
    } else {
      // ROUND(NVL(BL_QTY,0)/DECODE(NVL(V_PLANQTY,0),0,1,V_PLANQTY)*NVL(order_acqty,0),4)
      ac_req =
        Math.round(
          ((new_bl_qty || 0) / (v_planqty || 1)) *
            (order.order_acqty || 0) *
            10000,
        ) / 10000;
    }

    await client.query("COMMIT");

    return {
      success: true,
      bl_qty: new_bl_qty,
      ac_req: ac_req,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR in updateBlQty:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function confirm(
  factory_code,
  user_code,
  department_code,
  req_no,
  vend_no,
  session_id,
) {
  let transaction;
  try {
    transaction = await pool.transaction();

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 1: LẤY MAX SEQ HIỆN CÓ
    // ═══════════════════════════════════════════════════════════
    // SELECT NVL(MAX(SEQ),0) INTO V_SEQ FROM AC_REQ_ORDER
    // WHERE FACTORY_CODE=:PARAMETER.P_ORGID AND REQ_NO=:AC_REQ_M.REQ_NO

    const maxSeqResult = await pool.query(
      `
      SELECT COALESCE(MAX(req_seq), 0) as max_seq
      FROM "Customs".ac_req_order
      WHERE factory_code = :factory_code
        AND req_no = :req_no
      `,
      {
        replacements: { factory_code, req_no },
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    let v_seq = parseInt(maxSeqResult[0]?.max_seq) || 0;
    console.log(` Current MAX SEQ: ${v_seq}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 2: LẤY TẤT CẢ ITEMS TỪ RD_TEMP (Cache)
    // ═══════════════════════════════════════════════════════════
    // SELECT SEQ SRC, COL4, ITEM_NO CHK_NO, COL5, COL6 CHK_SEQ,
    //        CODE_NO ITEM_NO, COL1, FACTORY_CODE COL6,
    //        NAME_S AC_CODE, NAME_T ITEM_ACNO
    // FROM RD_TEMP
    // ORDER BY SEQ, ITEM_NO, COL6

    const rdTempItems = allchkCache.getLeftItems(session_id); // Chỉ lấy LEFT items

    if (!rdTempItems || rdTempItems.length === 0) {
      console.log(" No items in RD_TEMP to confirm");
      await transaction.commit();
      return {
        success: false,
        message: "No items to confirm",
      };
    }

    console.log(` Found ${rdTempItems.length} items in RD_TEMP`);

    // Sort theo SEQ, ITEM_NO, COL6
    rdTempItems.sort((a, b) => {
      if (a.seq !== b.seq) return a.seq - b.seq;
      if (a.item_no !== b.item_no) return a.item_no.localeCompare(b.item_no);
      return (a.col6 || "").localeCompare(b.col6 || "");
    });

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 3: DUYỆT QUA TỪNG ITEM VÀ XỬ LÝ
    // ═══════════════════════════════════════════════════════════
    const processedItems = [];
    const errors = [];

    for (const item of rdTempItems) {
      try {
        console.log(
          `\n Processing item: SEQ=${item.seq}, CHK_NO=${item.item_no}`,
        );

        // ───────────────────────────────────────────────────────
        // 3.1: TÌM REQ_QC (Quality Control Flag)
        // ───────────────────────────────────────────────────────
        // SELECT REQ_QC INTO V_QC FROM AC_VEND_BASE
        // WHERE FACTORY_CODE=:PARAMETER.P_ORGID
        //   AND VEND_NO=:AC_REQ_M.VEND_NO
        //   AND AC_SEND=I.ITEM_NO

        let v_qc = "N"; // Default
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
                ac_send: item.code_no, // CODE_NO = AC_SEND
              },
              type: pool.QueryTypes.SELECT,
              transaction,
            },
          );

          if (qcResult && qcResult.length > 0) {
            v_qc = qcResult[0].req_qc || "N";
          }
        } catch (err) {
          console.log(" No REQ_QC found, using default 'N'");
          v_qc = "N";
        }

        console.log(` REQ_QC: ${v_qc}`);

        // ───────────────────────────────────────────────────────
        // 3.2: KIỂM TRA ITEM ĐÃ TỒN TẠI CHƯA
        // ───────────────────────────────────────────────────────
        // SELECT COUNT(1) INTO X FROM AC_REQ_ORDER
        // WHERE FACTORY_CODE = :AC_REQ_M.FACTORY_CODE
        //   AND REQ_NO = :AC_REQ_M.REQ_NO
        //   AND CHK_NO = I.CHK_NO
        //   AND CHK_SEQ = I.CHK_SEQ

        const existResult = await pool.query(
          `
          SELECT COUNT(*) as count
          FROM "Customs".ac_req_order
          WHERE factory_code = :factory_code
            AND req_no = :req_no
            AND chk_no = :chk_no
            AND chk_seq = :chk_seq
          `,
          {
            replacements: {
              factory_code,
              req_no,
              chk_no: item.item_no, // ITEM_NO = CHK_NO
              chk_seq: item.col6, // COL6 = CHK_SEQ
            },
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );

        const exists = existResult[0]?.count > 0;

        if (exists) {
          // ───────────────────────────────────────────────────────
          // CASE A: ĐÃ TỒN TẠI → UPDATE (Cộng dồn số lượng)
          // ───────────────────────────────────────────────────────
          // UPDATE AC_REQ_ORDER
          // SET REQ_ACQTY = REQ_ACQTY + NVL(I.COL4,0),
          //     REQ_QTY = REQ_QTY + NVL(I.COL5,0)
          // WHERE FACTORY_CODE = :AC_REQ_M.FACTORY_CODE
          //   AND REQ_NO = :AC_REQ_M.REQ_NO
          //   AND CHK_NO = I.CHK_NO
          //   AND CHK_SEQ = I.CHK_SEQ

          console.log(`🔄 Item exists, updating (adding quantities)...`);

          await pool.query(
            `
            UPDATE "Customs".ac_req_order
            SET req_acqty = req_acqty + :add_acqty,
                req_qty = req_qty + :add_qty,
                amount = ROUND((req_qty + :add_qty) * COALESCE(price, 0), 2)
            WHERE factory_code = :factory_code
              AND req_no = :req_no
              AND chk_no = :chk_no
              AND chk_seq = :chk_seq
            `,
            {
              replacements: {
                add_acqty: item.col4 || 0, // COL4 = AC_REQ
                add_qty: item.col5 || 0, // COL5 = BL_QTY
                factory_code,
                req_no,
                chk_no: item.item_no,
                chk_seq: item.col6,
              },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );

          processedItems.push({
            action: "UPDATE",
            chk_no: item.item_no,
            chk_seq: item.col6,
            added_acqty: item.col4,
            added_qty: item.col5,
          });
        } else {
          // ───────────────────────────────────────────────────────
          // CASE B: CHƯA TỒN TẠI → INSERT (Tạo mới)
          // ───────────────────────────────────────────────────────

          v_seq += 1; // Tăng sequence
          console.log(` Item not exists, inserting with SEQ=${v_seq}...`);

          // Tìm T_ID từ AC_SRCORDER_M
          // SELECT MAX(ID) INTO T_ID FROM AC_SRCORDER_M
          // WHERE SRC = I.SRC
          //   AND ORDER_NO = I.COL1
          //   AND ORDER_SEQ = I.COL6

          const srcIdResult = await pool.query(
            `
            SELECT MAX(id) as t_id
            FROM "Customs".ac_srcorder_m
            WHERE 
               order_no = :order_no
              AND order_seq = :order_seq
            `,
            {
              replacements: {
                order_no: item.col1, // COL1 = ORDER_NO
                order_seq: item.factory_code, // FACTORY_CODE field trong RD_TEMP = ORDER_SEQ
              },
              type: pool.QueryTypes.SELECT,
              transaction,
            },
          );

          const t_id = srcIdResult[0]?.t_id;

          if (!t_id) {
            console.error(` Cannot find SRC_ID for item: ${item.seq}`);
            errors.push({
              item: item.item_no,
              error: "SRC_ID not found in AC_SRCORDER_M",
            });
            continue;
          }

          // INSERT vào AC_REQ_ORDER
          // INSERT INTO AC_REQ_ORDER(...)
          // SELECT ... FROM AC_SRCORDER_M WHERE ID = T_ID

          await pool.query(
            `
            INSERT INTO "Customs".ac_req_order (
              factory_code, req_no, req_seq,  order_type, src_id,
              order_date, order_no, order_seq, ac_send, cont_no,
              ac_code, item_acno, order_acqty, req_acqty, req_qc,
              req_qty, currency, price, amount, chk_no, chk_seq, grt_date,grt_user,grt_dept
            )
            SELECT 
              :factory_code,
              :req_no,
              :seq,
              order_type,
              id,
              order_date,
              :order_no,
              :order_seq,
              ac_send,
              cont_no,
              :ac_code,
              :item_acno,
              order_acqty,
              :req_acqty,
              :req_qc,
              :req_qty,
              currency,
              price,
              ROUND(COALESCE(:req_qty, 0) * COALESCE(price, 0), 2),
              :chk_no,
              :chk_seq,
              :grt_date,
              :grt_user,
              :grt_dept
            FROM "Customs".ac_srcorder_m
            WHERE id = :t_id
            `,
            {
              replacements: {
                factory_code,
                req_no,
                seq: v_seq,
                src: item.seq,
                order_no: item.col1,
                order_seq: item.factory_code,
                ac_code: item.name_s,
                item_acno: item.name_t,
                req_acqty: item.col4 || 0,
                req_qc: v_qc,
                req_qty: parseInt(item.col5) || 0,
                chk_no: item.item_no,
                chk_seq: item.col6,
                t_id,
                grt_dept: department_code,
                grt_user: user_code,
                grt_date: new Date(),
              },
              type: pool.QueryTypes.INSERT,
              transaction,
            },
          );

          processedItems.push({
            action: "INSERT",
            seq: v_seq,
            chk_no: item.item_no,
            chk_seq: item.col6,
            req_acqty: item.col4,
            req_qty: item.col5,
          });
        }
      } catch (itemError) {
        console.error(`❌ Error processing item ${item.seq}:`, itemError);
        errors.push({
          item: item.item_no,
          error: itemError.message,
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 4: XÓA TOÀN BỘ RD_TEMP
    // ═══════════════════════════════════════════════════════════
    // DELETE FROM RD_TEMP

    allchkCache.clearSession(session_id);
    console.log(`🧹 Cleared RD_TEMP for session: ${session_id}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 5: COMMIT TRANSACTION
    // ═══════════════════════════════════════════════════════════

    await transaction.commit();

    console.log(`\n✅ CONFIRM ALL completed successfully`);
    console.log(`📊 Processed: ${processedItems.length} items`);
    console.log(`❌ Errors: ${errors.length} items`);

    return {
      processed: processedItems.length,
      errors: errors.length > 0 ? errors : null,
      items: processedItems,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ ERROR in confirmAll:", error);
    throw error;
  }
}
async function approveContract(factory_code, req_no, invoice_no, user_code) {
  let transaction;
  try {
    transaction = await pool.transaction();

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 1: VALIDATE - Kiểm tra CONT_NO và ITEM_ACNO
    // ═══════════════════════════════════════════════════════════
    // for c in (select ORDER_NO, CONT_NO, ITEM_ACNO from AC_REQ_ORDER ...)

    const validationResult = await pool.query(
      `
      SELECT order_no, cont_no, item_acno
      FROM "Customs".ac_req_order
      WHERE factory_code = $1
        AND req_no = $2
      `,
      {
        bind: [factory_code, req_no],
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    const errors = [];

    for (const row of validationResult) {
      if (!row.cont_no) {
        errors.push(`Order ${row.order_no}: Contract is empty`);
      }
      if (!row.item_acno) {
        errors.push(`Order ${row.order_no}: Item ACNO is empty`);
      }
    }

    if (errors.length > 0) {
      console.error("❌ Validation failed:", errors);
      await transaction.rollback();
      return {
        success: false,
        message: "Contract No. is empty Or Customs Material No. is empty",
        errors: errors,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 2: Kiểm tra có items không
    // ═══════════════════════════════════════════════════════════
    // SELECT COUNT(ORG_ID) INTO N FROM AC_REQ_ORDER

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as count
      FROM "Customs".ac_req_order
      WHERE factory_code = $1
        AND req_no = $2
      `,
      {
        bind: [factory_code, req_no],
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    const itemCount = parseInt(countResult[0]?.count || 0);

    if (itemCount === 0) {
      const error = new Error("No items to approve");
      error.code = 540124;
      error.type = "VALIDATION_ERROR";
      throw error;
    }

    console.log(`✅ Found ${itemCount} items to approve`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 3: Lấy AC_NO (Số tờ khai hải quan)
    // ═══════════════════════════════════════════════════════════
    // SELECT AC_NO INTO V_AC FROM VW_CHG_IMP
    // WHERE ORG_ID=... AND COM_INVOICE=...
    // EXCEPTION WHEN NO_DATA_FOUND THEN
    //   SELECT AC_NO INTO V_AC FROM AC_PROC_M

    let v_ac = "";

    try {
      // Thử tìm trong VW_CHG_IMP trước
      const chgResult = await pool.query(
        `
        SELECT ac_no
        FROM "Customs".vw_chg_imp
        WHERE factory_code = $1
          AND com_invoice = $2
        LIMIT 1
        `,
        {
          bind: [factory_code, invoice_no],
          type: pool.QueryTypes.SELECT,
          transaction,
        },
      );

      if (chgResult && chgResult.length > 0) {
        v_ac = chgResult[0].ac_no;
        console.log(`📋 Found AC_NO in VW_CHG_IMP: ${v_ac}`);
      }
    } catch (err) {
      console.log("⚠️ AC_NO not found in VW_CHG_IMP, trying AC_PROC_M...");
    }

    if (!v_ac) {
      try {
        // Nếu không có, tìm trong AC_PROC_M
        const procResult = await pool.query(
          `
          SELECT ac_no
          FROM "Customs".ac_proc_m
          WHERE factory_code = $1
            AND com_invoice = $2
          LIMIT 1
          `,
          {
            bind: [factory_code, invoice_no],
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );

        if (procResult && procResult.length > 0) {
          v_ac = procResult[0].ac_no;
          console.log(`📋 Found AC_NO in AC_PROC_M: ${v_ac}`);
        }
      } catch (err) {
        console.log("⚠️ AC_NO not found in AC_PROC_M");
      }
    }

    console.log(`📋 Final AC_NO: ${v_ac || "(empty)"}`);

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 4: Loop qua AC_REQ_ORDER và xử lý
    // ═══════════════════════════════════════════════════════════
    // FOR A IN (SELECT M.ORG_ID, CHK_NO, CHK_SEQ, ORDER_NO, ORDER_SEQ, M.SEQ, M.REQ_NO
    //           FROM AC_REQ_ORDER M, AC_REQ_M D ...)

    const reqOrderItems = await pool.query(
      `
      SELECT 
        m.factory_code,
        m.chk_no,
        m.chk_seq,
        m.order_no,
        m.order_seq,
        m.req_seq,
        m.req_no
      FROM "Customs".ac_req_order m
      INNER JOIN "Customs".ac_req_m d
        ON d.factory_code = m.factory_code
        AND d.req_no = m.req_no
      WHERE d.factory_code = $1
        AND d.req_no = $2
      `,
      {
        bind: [factory_code, req_no],
        type: pool.QueryTypes.SELECT,
        transaction,
      },
    );

    console.log(`🔄 Processing ${reqOrderItems.length} items...`);

    for (const item of reqOrderItems) {
      // ───────────────────────────────────────────────────────
      // 4.1: INSERT/UPDATE PO_RCPT_AC (chỉ khi có CHK_NO)
      // ───────────────────────────────────────────────────────
      // IF A.CHK_NO IS NOT NULL THEN
      //   INSERT INTO PO_RCPT_AC(...) VALUES(...)
      //   EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
      //     UPDATE PO_RCPT_AC SET AC_NO=V_AC

      if (item.chk_no) {
        await pool.query(
          `
    INSERT INTO "Customs".po_rcpt_ac 
      (factory_code, chk_no, chk_seq, ac_no, order_no, order_seq)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (factory_code, chk_no, chk_seq)
    DO UPDATE SET ac_no = EXCLUDED.ac_no
    `,
          {
            bind: [
              item.factory_code,
              item.chk_no,
              item.chk_seq,
              v_ac,
              item.order_no,
              item.order_seq,
            ],
            type: pool.QueryTypes.INSERT,
            transaction,
          },
        );
      }

      // ───────────────────────────────────────────────────────
      // 4.2: UPDATE CHGE_QTY = REQ_ACQTY
      // ───────────────────────────────────────────────────────
      // UPDATE AC_REQ_ORDER SET CHGE_QTY=REQ_ACQTY
      // WHERE ORG_ID=A.ORG_ID AND REQ_NO=A.REQ_NO AND SEQ=A.SEQ

      await pool.query(
        `
        UPDATE "Customs".ac_req_order
        SET chge_qty = req_acqty
        WHERE factory_code = $1
          AND req_no = $2
          AND req_seq = $3
        `,
        {
          bind: [item.factory_code, item.req_no, item.req_seq],
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      console.log(`✅ Updated CHGE_QTY for SEQ=${item.req_seq}`);
    }

    // ═══════════════════════════════════════════════════════════
    // BƯỚC 5: UPDATE AC_REQ_M - Set STATUS = 7 (Approved)
    // ═══════════════════════════════════════════════════════════
    // UPDATE AC_REQ_M
    // SET STATUS = 7,
    //     LAST_USER = :PARAMETER.P_EMPID,
    //     LAST_DATE = SYSDATE,
    //     AC_NO = V_AC
    // WHERE ORG_ID=... AND REQ_NO=...

    // await pool.query(
    //   `
    //   UPDATE "Customs".ac_req_m
    //   SET status = 7,
    //       last_user = $1,
    //       last_date = NOW(),
    //       ac_no = $2
    //   WHERE factory_code = $3
    //     AND req_no = $4
    //   `,
    //   {
    //     bind: [user_code, v_ac, factory_code, req_no],
    //     type: pool.QueryTypes.UPDATE,
    //     transaction,
    //   },
    // );

    // console.log(`✅ Updated AC_REQ_M: STATUS=7, AC_NO=${v_ac}`);

    // ═══════════════════════════════════════════════════════════
    // COMMIT TRANSACTION
    // ═══════════════════════════════════════════════════════════

    await transaction.commit();

    console.log(`\n✅ APPROVE completed successfully`);

    return {
      req_no: req_no,
      status: 7,
      ac_no: v_ac,
      processed_items: reqOrderItems.length,
      message: `Successfully approved requisition ${req_no}`,
      success: true,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ ERROR in approve:", error);
    throw error;
  }
}
async function revertApproveContract(factory_code,user_code, req_no, invoice_no) {
  let transaction;
  try {
    transaction = await pool.transaction();

    let v_ac = "";
    try {
      const chgResult = await pool.query(
        `
        SELECT ac_no
        FROM "Customs".vw_chg_imp
        WHERE factory_code = $1 AND com_invoice = $2
        LIMIT 1
        `,
        { bind: [factory_code, invoice_no], type: pool.QueryTypes.SELECT, transaction },
      );
      if (chgResult && chgResult.length > 0) v_ac = chgResult[0].ac_no;
    } catch (err) {
      console.log(" AC_NO not found in VW_CHG_IMP, trying AC_PROC_M...");
    }

    if (!v_ac) {
      const procResult = await pool.query(
        `
        SELECT ac_no
        FROM "Customs".ac_proc_m
        WHERE factory_code = $1 AND com_invoice = $2
        LIMIT 1
        `,
        { bind: [factory_code, invoice_no], type: pool.QueryTypes.SELECT, transaction },
      );
      if (procResult && procResult.length > 0) v_ac = procResult[0].ac_no;
    }

    if (!v_ac) {
      await transaction.rollback();
      return { success: false, message: "Không tìm thấy AC_NO để revert" };
    }

    console.log(`Reverting with AC_NO: ${v_ac}`);

    // BƯỚC 2: Lấy lại danh sách req_seq đã approve
    const reqOrderItems = await pool.query(
      `
      SELECT m.factory_code, m.chk_no, m.chk_seq, m.req_seq, m.req_no
      FROM "Customs".ac_req_order m
      INNER JOIN "Customs".ac_req_m d
        ON d.factory_code = m.factory_code
        AND d.req_no = m.req_no
      WHERE d.factory_code = $1
        AND d.req_no = $2
      `,
      { bind: [factory_code, req_no], type: pool.QueryTypes.SELECT, transaction },
    );

    console.log(`Reverting ${reqOrderItems.length} items...`);

    for (const item of reqOrderItems) {
      // 2.1: Xóa PO_RCPT_AC nếu khớp đúng chk_no + ac_no vừa approve
      if (item.chk_no) {
        const deleted = await pool.query(
          `
          DELETE FROM "Customs".po_rcpt_ac
          WHERE factory_code = $1
            AND chk_no = $2
            AND chk_seq = $3
            AND ac_no = $4
          `,
          {
            bind: [item.factory_code, item.chk_no, item.chk_seq, v_ac],
            type: pool.QueryTypes.DELETE,
            transaction,
          },
        );
        console.log(`Deleted PO_RCPT_AC for chk_no=${item.chk_no}, chk_seq=${item.chk_seq}`);
      }
  // 2.2: Reset status ac_req_m về 1
      await pool.query(
        `
        UPDATE "Customs".ac_req_m
        SET status = 1,
            last_user = $3,
            last_date = NOW()
        WHERE factory_code = $1
          AND req_no = $2
        `,
        {
          bind: [item.factory_code, item.req_no, user_code],
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );
      // 2.2: Reset CHGE_QTY về 0
      await pool.query(
        `
        UPDATE "Customs".ac_req_order
        SET chge_qty = 0,
            status = 1,
            last_user = NULL,
            last_date = NULL
        WHERE factory_code = $1
          AND req_no = $2
          AND req_seq = $3
        `,
        {
          bind: [item.factory_code, item.req_no, item.req_seq],
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      console.log(`Reset CHGE_QTY for SEQ=${item.req_seq}`);
    }

    await transaction.commit();

    console.log(`REVERT completed successfully`);

    return {
      req_no,
      status: 1, // hoặc trạng thái trước khi approve — chỉnh theo status flow thật của bạn
      processed_items: reqOrderItems.length,
      message: `Đã hoàn tác duyệt yêu cầu ${req_no}`,
      success: true,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("ERROR in revert:", error);
    throw error;
  }
}
async function addContractNumber(
  factory_code,
  req_no,
  vend_no,
  req_date,
  ac_type,
) {
  let transaction;
  try {
    transaction = await pool.transaction();
    let str_cont = null;
    try {
      const contractResult = await pool.query(
        `
        SELECT cont_no
        FROM (
          SELECT cont_no, issued_date
          FROM "Customs".vw_cont_imp
          WHERE factory_code = :factory_code
            AND vend_no = :vend_no
            AND status = 7
            AND cont_category = '2'
            AND :req_date::date BETWEEN issued_date AND expire_date
            AND d_type = :ac_type
            AND issued_date = (
              SELECT MIN(issued_date)
              FROM "Customs".vw_cont_imp
              WHERE factory_code = :factory_code
                AND vend_no = :vend_no
                AND status = 7
                AND cont_category = '2'
                AND :req_date::date BETWEEN issued_date AND expire_date
                AND d_type = :ac_type
            )
        ) sub
        LIMIT 1
        `,
        {
          replacements: {
            factory_code: factory_code,
            vend_no: vend_no,
            req_date: req_date,
            ac_type: ac_type,
          },
          type: pool.QueryTypes.SELECT,
          transaction,
        },
      );

      if (contractResult && contractResult.length > 0) {
        str_cont = contractResult[0].cont_no;
        console.log(` Found contract: ${str_cont}`);
      } else {
        console.log(" No valid contract found");
      }
    } catch (err) {
      console.error(" Error finding contract:", err);
      str_cont = null;
    }

    if (str_cont) {
      const updateResult = await pool.query(
        `
        UPDATE "Customs".ac_req_order
        SET cont_no = :cont_no
        WHERE factory_code = :factory_code
          AND req_no = :req_no
          AND (cont_no IS NULL OR cont_no = '')
        `,
        {
          replacements: {
            cont_no: str_cont,
            factory_code: factory_code,
            req_no: req_no,
          },
          type: pool.QueryTypes.UPDATE,
          transaction,
        },
      );

      const updatedCount = updateResult[1] || 0;

      await transaction.commit();

      return {
        contract_no: str_cont,
        updated_rows: updatedCount,
        message: `Successfully added contract ${str_cont} to ${updatedCount} items`,
      };
    } else {
      const error = new Error("No data to approve");
      error.code = 540124;
      error.type = "No valid contract found for this vendor and date range";
      throw error;
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ ERROR in addContractNumber:", error);
    throw error;
  }
}
async function getDropdownByF(factory_code, field, page, limit, search = "") {
  try {
    const whereClause = {
      factory_code: factory_code,
      limit: parseInt(limit) || 10,
      offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    };

    if (search && search.trim() !== "") {
        whereClause[field] = { [Op.iLike]: `%${search}%` };
    }
    const sql = `SELECT chk_no,chk_seq,${field} from "Customs".vw_ac_allchk WHERE factory_code = :factory_code limit :limit offset :offset`;
    const countSql = `SELECT COUNT(*) as count FROM (${sql}) as subquery`;
   const result = await pool.query(sql, { replacements: whereClause, type: pool.QueryTypes.SELECT });
   const countResult = await pool.query(countSql, { replacements: whereClause, type: pool.QueryTypes.SELECT });
    return {
      data: result,
      total: countResult,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(countResult / limit),
    };
  } catch (error) {
    console.error("Error from basic data dropdown:", error);
    throw error;
  }
}
async function search(query, factory_code, limit, offset) {
  try {
    const parsedLimit = parseInt(limit) || 10;
    const parsedOffset = parseInt(offset) || 0;

    const order_no = query?.order_no === "" ? null : query?.order_no || null;
    const chk_no = query?.chk_no === "" ? null : query?.chk_no || null;

    const replacements = {
      factory_code: factory_code || null,
      vend_no: query?.vend_no || null,
      order_no,
      chk_no,
      rs_date: query?.s_date_1 || null,
      re_date: query?.e_date_1 || null,
      s_cfm: query?.s_date_2 || null,
      e_cfm: query?.e_date_2 || null,
      is_item: query?.is_item || null,
      ac_type: query?.ac_type || null,
      limit: parsedLimit + 1,
      offset: parsedOffset,
    };

    // Phần CTE + WHERE dùng chung cho cả query data và query count
    const cteAndWhere = `
     WITH filtered_base AS MATERIALIZED (
    SELECT 
      vw.*,
      "Customs".gf_orderseq_send(vw.FACTORY_CODE, vw.ORDER_NO, vw.ORDER_SEQ::NUMERIC) as ac_send_value,
      "Customs".gf_chkseq_req(vw.FACTORY_CODE, vw.CHK_NO, vw.CHK_SEQ::NUMERIC) as chk_req_value
    FROM "Customs".vw_ac_allchk vw
    WHERE vw.factory_code = :factory_code 
      AND vw.AC_VEND = :vend_no
  ),
  final_filtered AS (
    SELECT fb.*
    FROM filtered_base fb
    WHERE fb.ac_send_value IN (
      SELECT AC_SEND FROM "Customs".ac_send_base WHERE AC_TYPE = :ac_type
    )
    AND fb.chk_req_value = 'N'
  )
    `;

    const whereClause = `
    WHERE
    (:order_no IS NULL OR vw.ORDER_NO ILIKE '%' || :order_no || '%') AND
    (vw.CHK_NO ILIKE '%' || :chk_no || '%' OR :chk_no IS NULL) AND
    (DATE_TRUNC('day', vw.RCPT_DATE) >= DATE_TRUNC('day', :rs_date::timestamp) OR :rs_date IS NULL) AND
    (DATE_TRUNC('day', vw.RCPT_DATE) <= DATE_TRUNC('day', :re_date::timestamp) OR :re_date IS NULL) AND
    ((:is_item = 'Y' AND vw.ITEM_ACNO IS NOT NULL) OR 
     (:is_item = 'N' AND vw.ITEM_ACNO IS NULL) OR 
     :is_item IS NULL) AND
    (:s_cfm IS NULL OR 
     (SELECT VR_CFMDAY FROM "Customs".ac_srcorder_m
      WHERE FACTORY_CODE = vw.FACTORY_CODE
        AND ORDER_NO = vw.ORDER_NO 
        AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
      LIMIT 1) >= DATE_TRUNC('day', :s_cfm::timestamp)) AND
    (:e_cfm IS NULL OR 
     (SELECT VR_CFMDAY FROM "Customs".ac_srcorder_m
      WHERE FACTORY_CODE = vw.FACTORY_CODE
        AND ORDER_NO = vw.ORDER_NO 
        AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
      LIMIT 1) <= DATE_TRUNC('day', :e_cfm::timestamp))
    `;

    const sql = `
      ${cteAndWhere}
      SELECT 
        vw.RCPT_DATE,
        vw.CHK_NO,
        vw.CHK_SEQ,
        vw.ORDER_NO,
        vw.ORDER_SEQ,
        vw.AC_CODE,
        vw.FACTORY_CODE,
        vw.src,

        (SELECT NAME_S FROM "Customs".ac_allitem_src
         WHERE AC_CODE = vw.AC_CODE) AS ITEMNM,

        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, '1108', sm.PR_UNIT, 'S')
         FROM "Customs".ac_srcorder_m sm
         WHERE sm.FACTORY_CODE = vw.FACTORY_CODE
         AND sm.ORDER_NO = vw.ORDER_NO
         AND sm.ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS UNITNM,

        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, 'ACSEND', sm.AC_SEND, 'S')
         FROM "Customs".ac_srcorder_m sm
         WHERE sm.FACTORY_CODE = vw.FACTORY_CODE
         AND sm.ORDER_NO = vw.ORDER_NO
         AND sm.ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS SENDNM,

        (SELECT PR_FORMULA FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS PR_FORMULA,

        (SELECT AC_SEND FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS AC_SEND,

        (SELECT A.FORMULA 
         FROM "Customs".ac_item_ref A
         INNER JOIN "Customs".ac_item_m B
           ON A.factory_code = B.factory_code
           AND A.ITEM_ACNO = B.ITEM_ACNO
         WHERE A.factory_code = vw.FACTORY_CODE
         AND A.ITEM_NO = vw.AC_CODE
         AND B.STATUS = 7
         LIMIT 1) AS V_FOR,

        vw.ITEM_ACNO,

        (SELECT item_acname_l FROM "Customs".ac_item_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ITEM_ACNO = vw.ITEM_ACNO) AS ITEMNM1,

        (SELECT "Customs".gf_code_name(vw.FACTORY_CODE, '1108', im.UNIT, 'S')
         FROM "Customs".ac_item_m im
         WHERE im.FACTORY_CODE = vw.FACTORY_CODE
         AND im.ITEM_ACNO = vw.ITEM_ACNO
         LIMIT 1) AS UNITNM1,

        (SELECT order_qty FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS order_qty,

        (SELECT SUM(COALESCE(REQ_QTY,0)) as Y_RCPT FROM "Customs".ac_req_order
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND order_no = vw.order_no
         AND order_seq = vw.order_seq::NUMERIC
         LIMIT 1) AS Y_RCPT,

        vw.RCPT_QTY,

        NULL AS BL_QTY,
        NULL AS IS_CHECK,

        (SELECT CONT_NO FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS CONT_NO,

        (SELECT order_acqty FROM "Customs".ac_srcorder_m
         WHERE FACTORY_CODE = vw.FACTORY_CODE
         AND ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS order_acqty,

        (SELECT SUM(COALESCE(REQ_ACQTY,0)) AS REQ_ACQTY FROM "Customs".ac_req_order
         WHERE 
         ORDER_NO = vw.ORDER_NO
         AND ORDER_SEQ = vw.ORDER_SEQ::NUMERIC
         LIMIT 1) AS REQ_ACQTY1,

        NULL AS AC_REQ

      FROM final_filtered vw
      ${whereClause}
      ORDER BY vw.RCPT_DATE DESC, vw.CHK_NO, vw.CHK_SEQ
      LIMIT :limit OFFSET :offset
    `;

    const countSql = `
      ${cteAndWhere}
      SELECT COUNT(*) AS total
      FROM final_filtered vw
      ${whereClause}
    `;

    const [rows, countResult] = await Promise.all([
      pool.query(sql, {
        replacements,
        type: pool.QueryTypes.SELECT,
      }),
      pool.query(countSql, {
        replacements,
        type: pool.QueryTypes.SELECT,
      }),
    ]);

    const total = parseInt(countResult[0]?.total, 10) || 0;

    rows.forEach((row) => {
      if (row.order_qty !== null) {
        const vFor = row.V_FOR || 1;
        const prFormula = row.PR_FORMULA || 1;
        row.CALCULATED_order_acqty = row.order_qty * vFor * prFormula;
      }
    });

    const hasMore = rows.length > parsedLimit;
    const data = hasMore ? rows.slice(0, parsedLimit) : rows;

    return { rows: data, count: total, hasMore };
  } catch (error) {
    console.error("Error in search:", error.message);
    throw error;
  }
}
module.exports = {
  getListOfALLCHK,
  approveContract,
  revertApproveContract,
  checkBox,
  getPlanIQty,
  updateBlQty,
  confirm,
  search,
  addContractNumber,
  getDropdownByF
};
