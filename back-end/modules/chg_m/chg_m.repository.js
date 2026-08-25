const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const { RdTempCache } = require("../rd_temp/rd_temp.js");
const seInvTempCache = new RdTempCache("SE_INV_TEMP", "SE_INV_TEMP");
async function getListOfChgM(factory_code, language, limit, offset) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };

    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };

    const sql = `
      SELECT
      m.factory_code,
        m.ac_no,
        v.ac_chgno,
        v.out_date,
        v.cont_no,
        v.curr_no,
        "Customs".gf_code_name(m.factory_code, '1105', v.curr_no, :p_charset) AS curr_name,
        v.sum_qty,
        v.sum_money,
        v.tax,
        v.status,
        CASE v.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name,
        m.chg_type,
        "Customs".gf_code_name(m.factory_code, 'ACTYPE', m.chg_type, :p_charset) AS chg_type_name
      FROM "Customs".ac_chg_m m
      LEFT JOIN "Customs".vw_chg_exp v
        ON v.factory_code = m.factory_code
        AND v.ac_no = m.ac_no
      WHERE m.factory_code = :factory_code
        AND m.ac_type = '2'
        AND m.status = 7
        AND m.ac_no NOT IN (
          SELECT DISTINCT ac_no
          FROM "Customs".se_inv_m
          WHERE factory_code = :factory_code
            AND status <> 0
        )
      ORDER BY v.out_date DESC, m.ac_no
      LIMIT :limit
      OFFSET :offset
    `;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > limit;
    const actualRows = hasMore ? rows.slice(0, limit) : rows;
    return { rows: actualRows, hasMore };
  } catch (error) {
    console.error("Error fetching AC_CHG_EXP list:", error);
    throw error;
  }
}
// Tương đương SQL "轉入" checkbox - thêm/xoá ac_no khỏi temp cache
async function checkSeInvTemp(
  factory_code,
  ac_no,
  is_check,
  session_id,
  filters = null,
  isAll = false,
  language,
) {
  try {
    const sessionKey = session_id;
    if (isAll) {
      const { rows } = await search(
        factory_code,
        language,
        filters,
        10,
        0,
        true,
      );
      if (is_check === "Y") {
        // Lưu toàn bộ vào cache
        rows.forEach((item) => {
          seInvTempCache.save(sessionKey, {
            code_no: "TMP_SE_INV",
            org_id: String(factory_code),
            ac_no: String(item?.ac_no),
          });
        });
      } else {
        // Xóa sạch cache của session
        seInvTempCache.cache.set(sessionKey, []);
      }

      const allItems = seInvTempCache.getAll(sessionKey);
      return {
        action: is_check === "Y" ? "SELECT_ALL" : "UNSELECT_ALL",
        total_selected: allItems.length,
        items: rows,
        message: is_check === "Y" ? "All items selected" : "All items cleared",
      };
    }
    if (is_check === "Y") {
      const item = {
        code_no: "TMP_SE_INV",
        org_id: String(factory_code),
        ac_no: String(ac_no),
      };

      seInvTempCache.save(sessionKey, item);
      const allItems = seInvTempCache.getAll(sessionKey);

      return {
        action: "CHECK",
        is_check: "Y",
        factory_code,
        ac_no,
        total_selected: allItems.length,
        message: "Item added to SE_INV_TEMP successfully",
      };
    } else {
      const sessionData = seInvTempCache.getAll(sessionKey);

      const filtered = sessionData.filter(
        (item) =>
          !(
            String(item.org_id) === String(factory_code) &&
            String(item.ac_no) === String(ac_no)
          ),
      );

      seInvTempCache.cache.set(sessionKey, filtered);

      return {
        action: "UNCHECK",
        is_check: "N",
        total_selected: filtered.length,
        deleted_item: { factory_code, ac_no },
        remaining_items: filtered,
        message: "Item removed from SE_INV_TEMP successfully",
      };
    }
  } catch (error) {
    console.error("ERROR in checkSeInvTemp:", error);
    throw error;
  }
}
// Tương đương SQL "報關單轉入" button - generate SE_INV_M + SE_INV_D
async function autoAddSeInvM(factory_code, language, user_code, session_id) {
  try {
    const charset = { en: "E", vi: "S", zh: "T" };
    const p_charset = charset[language] || "E";

    const allItems = seInvTempCache.getAll(session_id);
    if (!allItems || allItems.length === 0) {
      return {
        success: false,
        message: await gf_mesgnm("210619", p_charset),
      };
    }

    const results = [];

    for (const item of allItems) {
      try {
        const org_id = item.org_id;
        const ac_no = item.ac_no;

        // 1. Generate INVOICE_ID
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yy}${mm}${dd}`;
        const prefix = `IN${dateStr}`;

        const maxInvResult = await pool.query(
          `SELECT MAX(invoice_id) AS max_id
       FROM "Customs".se_inv_m
       WHERE factory_code = :factory_code
         AND invoice_id LIKE :prefix`,
          {
            replacements: { factory_code: factory_code, prefix: `${prefix}%` },
            type: pool.QueryTypes.SELECT,
          },
        );
        const maxId = maxInvResult?.[0]?.max_id ?? null;
        const nextSeq = String(
          parseInt(maxId ? maxId.substring(8) : "0") + 1,
        ).padStart(3, "0");
        const v_invid = `${prefix}${nextSeq}`;

        // 2. SE_ID
        const seIdResult = await pool.query(
          `SELECT COALESCE(MIN(se_id), '--') AS v_seid
       FROM "Customs".ac_plan_ord
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no`,
          {
            replacements: { factory_code: factory_code, ac_no },
            type: pool.QueryTypes.SELECT,
          },
        );
        const v_seid = seIdResult?.[0]?.v_seid ?? "--";

        // 3. FCR_DATE
        const fcrResult = await pool.query(
          `SELECT MIN(nlt) AS v_fcrdate
       FROM "pac".sd_ord_m
       WHERE org_id = :factory_code
         AND se_id IN (
           SELECT ori_se_id FROM "pac".sd_ord_m_c
           WHERE org_id = :factory_code AND se_id = :se_id
         )`,
          {
            replacements: { factory_code: factory_code, se_id: v_seid },
            type: pool.QueryTypes.SELECT,
          },
        );
        const v_fcrdate = fcrResult?.[0]?.v_fcrdate ?? null;

        // 4. CUST
        const custResult = await pool.query(
          `SELECT MIN(se_custid) AS v_cust
       FROM "pac".sd_ord_m_c
       WHERE org_id = :factory_code AND se_id = :se_id`,
          {
            replacements: { factory_code: factory_code, se_id: v_seid },
            type: pool.QueryTypes.SELECT,
          },
        );
        const v_cust = custResult?.[0]?.v_cust ?? null;

        // 5. SE_VER, SE_SEQ, PACK_GU, SHIP_SEQ
        let v_sever = null,
          v_seseq = null,
          v_packgu = null,
          v_shipseq = null;
        const planResult = await pool.query(
          `SELECT se_ver, se_seq, pack_gu, ship_seq
       FROM "Customs".ac_plan_ord
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no
         AND se_id = :se_id
       LIMIT 1`,
          {
            replacements: { factory_code: factory_code, ac_no, se_id: v_seid },
            type: pool.QueryTypes.SELECT,
          },
        );
        if (planResult?.[0]) {
          v_sever = planResult[0].se_ver;
          v_seseq = planResult[0].se_seq;
          v_packgu = planResult[0].pack_gu;
          v_shipseq = planResult[0].ship_seq;
        }

        // 6. SHIPMENT_NO, SUBMISSION_DATE, INVOICE_NO
        let v_shipment_no = null,
          v_submission_date = null,
          v_invno = null;
        const planOrdResult = await pool.query(
          `SELECT book_no, p_shipdate, column2
       FROM "Customs".se_plan_ord
       WHERE factory_code = :factory_code
         AND se_id = :se_id
         AND se_ver = :se_ver
         AND se_seq = :se_seq
         AND pack_gu = :pack_gu
         AND ship_seq = :ship_seq`,
          {
            replacements: {
              factory_code: factory_code,
              se_id: v_seid,
              se_ver: v_sever,
              se_seq: v_seseq,
              pack_gu: v_packgu,
              ship_seq: v_shipseq,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        if (planOrdResult?.[0]) {
          v_shipment_no = planOrdResult[0].book_no;
          v_submission_date = planOrdResult[0].p_shipdate;
          v_invno = planOrdResult[0].column2;
        }

        // 7. DEST_PORT
        let v_dest = null;
        if (factory_code === "2010" || factory_code === "2020") {
          const sendTypeResult = await pool.query(
            `SELECT DISTINCT
           CASE send_type
             WHEN '02' THEN '1' WHEN 'Z1' THEN '1'
             WHEN '03' THEN '2' WHEN 'Z2' THEN '2' WHEN 'Z3' THEN '2'
             WHEN 'Z4' THEN '2' WHEN 'Z5' THEN '2' WHEN 'Z6' THEN '2'
             WHEN 'Z9' THEN '3' WHEN 'ZA' THEN '3' WHEN 'ZB' THEN '3'
             WHEN 'Z7' THEN '4' WHEN 'Z8' THEN '4' WHEN 'ZC' THEN '4'
             WHEN 'ZD' THEN '4' WHEN 'ZE' THEN '4' WHEN 'ZF' THEN '4'
             WHEN 'ZG' THEN '4' WHEN 'ZH' THEN '4' WHEN 'ZI' THEN '4'
             ELSE send_type
           END AS si_type
         FROM "Customs".se_plan_ord
         WHERE factory_code = :factory_code
           AND se_id = :se_id
           AND se_ver = :se_ver
           AND se_seq = :se_seq
           AND pack_gu = :pack_gu
           AND ship_seq = :ship_seq`,
            {
              replacements: {
                factory_code: factory_code,
                se_id: v_seid,
                se_ver: v_sever,
                se_seq: v_seseq,
                pack_gu: v_packgu,
                ship_seq: v_shipseq,
              },
              type: pool.QueryTypes.SELECT,
            },
          );
          const si_type = sendTypeResult?.[0]?.si_type ?? null;

          const destResult = await pool.query(
            `SELECT MIN(p_adress) AS v_dest
         FROM "Customs".se_shiping_d
         WHERE factory_code = :factory_code
           AND cust_id = :cust_id
           AND si_type = :si_type`,
            {
              replacements: {
                factory_code: factory_code,
                cust_id: v_cust,
                si_type,
              },
              type: pool.QueryTypes.SELECT,
            },
          );
          v_dest = destResult?.[0]?.v_dest ?? null;
        } else {
          const destResult = await pool.query(
            `SELECT MIN(in_country) AS v_dest
         FROM "Customs".vw_chg_exp
         WHERE factory_code = :factory_code AND ac_no = :ac_no`,
            {
              replacements: { factory_code: factory_code, ac_no },
              type: pool.QueryTypes.SELECT,
            },
          );
          v_dest = destResult?.[0]?.v_dest ?? null;
        }

        // 8. Bank name
        const cityBankFactories = [
          "2000",
          "2010",
          "2020",
          "2030",
          "2040",
          "2050",
          "2060",
          "2070",
          "2080",
          "2090",
        ];
        const bank_name = cityBankFactories.includes(String(factory_code))
          ? "CITY BANK"
          : "";

        // 9. exp_port
        const factory3xxx = [
          "3000",
          "3010",
          "3020",
          "3030",
          "3040",
          "3050",
          "3060",
          "3070",
          "3080",
          "3090",
        ];
        const exp_port = factory3xxx.includes(String(factory_code))
          ? ""
          : "VN1";

        // 10. INSERT SE_INV_M
        await pool.query(
          `INSERT INTO "Customs".se_inv_m (
        factory_code, ac_no, invoice_id, invoice_no, invoice_date,
        account_addr, fcr_date, exp_port, dest_port, payment,
        trade, sort, status, grt_user, grt_date,
        submission_date, shipment_no, bank_name
      )
      SELECT
        factory_code, :ac_no, :invoice_id, :invoice_no, :fcr_date,
        rec_addr, :fcr_date, :exp_port, :dest_port, payment,
        trade, sort, 1, :grt_user, NOW(),
        :submission_date, :shipment_no, :bank_name
      FROM "Customs".ac_chg_m
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no`,
          {
            replacements: {
              factory_code: factory_code,
              ac_no,
              invoice_id: v_invid,
              invoice_no: v_invno,
              fcr_date: v_fcrdate,
              exp_port,
              dest_port: v_dest,
              grt_user: user_code,
              submission_date: v_submission_date,
              shipment_no: v_shipment_no,
              bank_name,
            },
            type: pool.QueryTypes.INSERT,
          },
        );

        // 11. INSERT SE_INV_D
        await pool.query(
          `INSERT INTO "Customs".se_inv_d (
        factory_code, ac_no, invoice_id,
        se_id, se_ver, se_seq, pack_gu, ship_seq, pk_seq,
        size_run, ctn_pairs, ctns,
        s_no, e_no, length, width, high, cbm,
        net_weight, gross_weight
      )
      SELECT
        s.factory_code, :ac_no, :invoice_id,
        s.se_id, s.se_ver, s.se_seq, s.pack_gu, s.ship_seq, s.pk_seq,
        s.sizerun, s.ctns_pairs, COALESCE(s.ctns, 0),
        m.s_no, m.e_no, m.length, m.width, m.high,
        m.cbm / NULLIF(COALESCE(m.ctns, 0), 0) * COALESCE(s.ctns, 0),
        ROUND(m.nw / NULLIF(COALESCE(m.ctns, 0), 0) * COALESCE(s.ctns, 0), 2),
        ROUND((m.nw / NULLIF(COALESCE(m.ctns, 0), 0) + COALESCE(ROUND(w.sap_nw, 2), 0)) * COALESCE(s.ctns, 0), 2)
      FROM "Customs".se_plan_size s
      JOIN "pac".sd_pack_m m
        ON s.factory_code = m.org_id
       AND s.se_id = m.se_id
       AND s.se_seq = m.se_seq::TEXT
       AND s.pack_gu = m.pack_gu
       AND s.pk_seq = m.pk_seq
      LEFT JOIN "public".mm_item w ON m.item_no = w.item_no
      WHERE (s.factory_code, s.se_id, s.se_ver, s.se_seq, s.pack_gu, s.ship_seq) IN (
        SELECT factory_code, se_id, se_ver, se_seq, pack_gu, ship_seq
        FROM "Customs".ac_plan_ord
        WHERE factory_code = :factory_code
          AND ac_no = :ac_no
      )`,
          {
            replacements: {
              factory_code: factory_code,
              ac_no,
              invoice_id: v_invid,
            },
            type: pool.QueryTypes.INSERT,
          },
        );

        // 12. Update NW, GW
        const nwGwResult = await pool.query(
          `SELECT ROUND(SUM(net_weight), 2) AS m_nw,
              ROUND(SUM(gross_weight), 2) AS m_gw
       FROM "Customs".se_inv_d
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no
         AND invoice_id = :invoice_id`,
          {
            replacements: {
              factory_code: factory_code,
              ac_no,
              invoice_id: v_invid,
            },
            type: pool.QueryTypes.SELECT,
          },
        );

        await pool.query(
          `UPDATE "Customs".se_inv_m
       SET nw = :m_nw, gw = :m_gw
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no
         AND invoice_id = :invoice_id`,
          {
            replacements: {
              factory_code: factory_code,
              ac_no,
              invoice_id: v_invid,
              m_nw: nwGwResult?.[0]?.m_nw ?? 0,
              m_gw: nwGwResult?.[0]?.m_gw ?? 0,
            },
            type: pool.QueryTypes.UPDATE,
          },
        );

        results.push({ ac_no, invoice_id: v_invid, success: true });
      } catch (itemError) {
        console.error(`ERROR processing ac_no ${item.ac_no}:`, itemError);
        results.push({
          ac_no: item.ac_no,
          success: false,
          error: itemError.message,
        });
      }
    }

    // 13. Xoá cache
    seInvTempCache.cache.delete(session_id);

    return {
      success: true,
      message: "Declaration transferred to invoice successfully",
      total_transferred: results.length,
      results,
    };
  } catch (error) {
    console.error("ERROR in autoAddSeInvM:", error);
    throw error;
  }
}

function getSeInvSelections(session_id) {
  return seInvTempCache.getAll(session_id);
}

function clearSeInvSession(session_id) {
  seInvTempCache.clearSession(session_id);
  return { action: "CLEAR", message: "SE_INV session cleared" };
}
async function gf_mesgnm(code, language) {
  try {
    const sql = `
     select * from "Customs".gf_mesgnm(:code,:language) as mesgnm
    `;
    const row = await pool.query(sql, {
      replacements: { code, language },
      type: pool.QueryTypes.SELECT,
    });
    return row[0]?.mesgnm;
  } catch (error) {
    console.error("Error in closeAcChg:", error);
    throw error;
  }
}
async function search(
  factory_code,
  language,
  filters = {},
  limit,
  offset,
  isAll = false,
) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };

    const replacements = {
      factory_code: factory_code || null,
      ac_no: filters.ac_no || null,
      ac_chgno: filters.ac_chgno || null,
      cont_no: filters.cont_no || null,
      chg_type: filters.chg_type || null,
      s_out_date: filters.s_date_1 || null,
      e_out_date: filters.e_date_1|| null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    const sql = `
      SELECT
      m.factory_code,
        m.ac_no,
        v.ac_chgno,
        v.out_date,
        v.cont_no,
        v.curr_no,
        "Customs".gf_code_name(m.factory_code, '1105', v.curr_no, :p_charset) AS curr_name,
        v.sum_qty,
        v.sum_money,
        v.tax,
        v.status,
        CASE v.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name,
        m.chg_type,
        "Customs".gf_code_name(m.factory_code, 'ACTYPE', m.chg_type, :p_charset) AS chg_type_name
      FROM "Customs".ac_chg_m m
      LEFT JOIN "Customs".vw_chg_exp v
        ON v.factory_code = m.factory_code
        AND v.ac_no = m.ac_no
      WHERE m.factory_code = :factory_code
        AND m.ac_type = '2'
        AND m.status = 7
        AND m.ac_no NOT IN (
          SELECT DISTINCT ac_no
          FROM "Customs".se_inv_m
          WHERE factory_code = :factory_code
            AND status <> 0
        )
        AND (:ac_no     IS NULL OR m.ac_no    ILIKE '%' || :ac_no    || '%')
        AND (:ac_chgno  IS NULL OR v.ac_chgno ILIKE '%' || :ac_chgno || '%')
        AND (:cont_no   IS NULL OR v.cont_no  ILIKE '%' || :cont_no  || '%')
        AND (:chg_type  IS NULL OR m.chg_type ILIKE '%' || :chg_type || '%')
        AND (:s_out_date IS NULL OR DATE_TRUNC('day', v.out_date) >= DATE_TRUNC('day', :s_out_date::timestamp))
        AND (:e_out_date IS NULL OR DATE_TRUNC('day', v.out_date) <= DATE_TRUNC('day', :e_out_date::timestamp))
      ORDER BY v.out_date DESC, m.ac_no
      ${isAll ? "" : "LIMIT  :limit OFFSET :offset"}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM "Customs".ac_chg_m m
      LEFT JOIN "Customs".vw_chg_exp v
        ON v.factory_code = m.factory_code
        AND v.ac_no = m.ac_no
      WHERE m.factory_code = :factory_code
        AND m.ac_type = '2'
        AND m.status = 7
        AND m.ac_no NOT IN (
          SELECT DISTINCT ac_no
          FROM "Customs".se_inv_m
          WHERE factory_code = :factory_code
            AND status <> 0
        )
        AND (:ac_no     IS NULL OR m.ac_no    ILIKE '%' || :ac_no    || '%')
        AND (:ac_chgno  IS NULL OR v.ac_chgno ILIKE '%' || :ac_chgno || '%')
        AND (:cont_no   IS NULL OR v.cont_no  ILIKE '%' || :cont_no  || '%')
        AND (:chg_type  IS NULL OR m.chg_type ILIKE '%' || :chg_type || '%')
        AND (:s_out_date IS NULL OR DATE_TRUNC('day', v.out_date) >= DATE_TRUNC('day', :s_out_date::timestamp))
        AND (:e_out_date IS NULL OR DATE_TRUNC('day', v.out_date) <= DATE_TRUNC('day', :e_out_date::timestamp))
    `;

    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countResult = await pool.query(countSql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total) || 0;
    const hasMore = rows.length === parseInt(limit);
    return { rows, total: total, hasMore };
  } catch (error) {
    console.error("Error searching AC_CHG_EXP:", error);
    throw error;
  }
}
module.exports = {
  getListOfChgM,
  checkSeInvTemp,
  autoAddSeInvM,
  getSeInvSelections,
  clearSeInvSession,
  search,
};
