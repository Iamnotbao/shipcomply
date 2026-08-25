const pool = require("../../config/db.js");
const { RdTempCache } = require("../rd_temp/rd_temp.js");
const acPlanCache = new RdTempCache("AC_PLAN", "AC_PLAN");

async function listAllPlanOrd(
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "a.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "a.grt_dept = :permission_dept AND a.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "a.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
      a.factory_code,
        a.se_id,
        a.se_seq,
        a.se_ver,
        a.pack_gu,
        a.ship_seq,
        a.p_shipdate,
        a.p_shipqty,
        b.po,
        b.prod_no,
        "Customs".gf_custid_custno(a.factory_code, b.se_custid) AS cust_no,
        "Customs".gf_custnm_j(a.factory_code, b.se_custid, :p_charset) AS custnm,
        CASE :p_charset
          WHEN 'T' THEN c.name_t
          WHEN 'S' THEN c.name_s
          ELSE c.name_e
        END AS prod_name,
        CASE :p_charset
          WHEN 'T' THEN c.color_t
          WHEN 'S' THEN c.color_s
          ELSE c.color_e
        END AS color,
        CASE a.ex_status
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS ex_status
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE
        a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
      ORDER BY a.se_id, a.se_seq, a.pack_gu, a.ship_seq
      LIMIT :limit
      OFFSET :offset
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;

    return {
      rows: actualRows,
      count: null,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in listAllSePlanOrd:", error);
    throw error;
  }
}
async function searchPlanOrd(
  filters = {},
  factory_code,
  department_code,
  user_code,
  query_level,
  language = "en",
  limit,
  offset,
  isAll = false,
) {
  let charSet = { vi: "S", en: "E", zh: "T" };

  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code,
    p_charset: charSet[language] || "E",
    limit: parseInt(limit) + 1 || 11,
    offset: parseInt(offset) || 0,
    se_custid: filters.se_custid ? `${filters.se_custid}%` : null,
    agent: filters.agent ? `${filters.agent}%` : null,
    p_sdate: filters.s_date_1 || null,
    p_edate: filters.e_date_1 || null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "a.factory_code = :factory_code";
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "a.grt_dept = :permission_dept AND a.factory_code = :factory_code";
      replacements.permission_dept = department_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "a.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  try {
    const sql = `
      SELECT
      a.factory_code,
        a.se_id,
        a.se_ver,
        a.se_seq,
        a.pack_gu,
        a.ship_seq,
        a.p_shipdate,
        a.p_shipqty,
        b.po,
        b.prod_no,
        "Customs".gf_custid_custno(a.factory_code, b.se_custid) AS cust_no,
        "Customs".gf_custnm_j(a.factory_code, b.se_custid, :p_charset) AS custnm,
        CASE :p_charset
          WHEN 'T' THEN c.name_t 
          WHEN 'S' THEN c.name_s
          ELSE c.name_e
        END AS prod_name,
        CASE :p_charset
          WHEN 'T' THEN c.color_t
          WHEN 'S' THEN c.color_s
          ELSE c.color_e
        END AS color,
        CASE a.ex_status
          WHEN '1' THEN '1-Waitting'
          WHEN '2' THEN '2-PASS'
          WHEN '9' THEN '9-NG'
        END AS ex_status
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE 
         a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND (b.se_custid LIKE :se_custid OR :se_custid IS NULL)
        AND ("Customs".gf_seid_cust_agent(a.factory_code, b.ori_se_id) LIKE :agent OR :agent IS NULL)
        AND (date_trunc('day', a.p_shipdate) >= date_trunc('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (date_trunc('day', a.p_shipdate) <= date_trunc('day', :p_edate::timestamp) OR :p_edate IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
      ORDER BY a.se_id, a.se_seq, a.pack_gu, a.ship_seq
      ${isAll ? "" : "LIMIT :limit OFFSET :offset"} 
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM "Customs".se_plan_ord a
      INNER JOIN "pac".sd_ord_m_c b
        ON a.factory_code = b.org_id
       AND a.se_id = b.se_id
       AND a.pack_gu = b.pack_gu
      INNER JOIN "Customs".vw_rd_prod c
        ON b.prod_no = c.prod_no
      WHERE ${permissionCondition}
        AND a.factory_code = :factory_code
        AND a.status = 7
        AND (a.col7 = '7' OR a.col7 IS NULL)
        AND (b.se_custid LIKE :se_custid OR :se_custid IS NULL)
        AND ("Customs".gf_seid_cust_agent(a.factory_code, b.ori_se_id) LIKE :agent OR :agent IS NULL)
        AND (date_trunc('day', a.p_shipdate) >= date_trunc('day', :p_sdate::timestamp) OR :p_sdate IS NULL)
        AND (date_trunc('day', a.p_shipdate) <= date_trunc('day', :p_edate::timestamp) OR :p_edate IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM "Customs".ac_plan_ord x
          INNER JOIN "Customs".vw_chg_exp y
            ON x.factory_code = y.factory_code
           AND x.ac_no = y.ac_no
          WHERE a.se_id = x.se_id
            AND a.se_seq = x.se_seq
            AND a.pack_gu = x.pack_gu
            AND a.ship_seq = x.ship_seq
            AND y.factory_code = :factory_code
            AND y.status <> 0
        )
    `;

    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const countRows = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    const total = parseInt(countRows[0]?.total);

    return {
      rows: actualRows,
      count: null,
      total: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error("Error in search:", error);
    throw error;
  }
}
// SQL "Transfer" - check/uncheck item vào TMP_AC_PLAN
async function checkPlanItem(
  ac_no,
  se_id,
  se_seq,
  ship_seq,
  se_ver,
  pack_gu,
  is_check,
  session_id,
  filters = {},
  factory_code,
  isAll = false,
) {
  try {
console.log("isAll value:", isAll, "| type:", typeof isAll)
    
    const sessionKey = session_id;
    // ── SELECT ALL / UNSELECT ALL ──
    if (isAll) {
      const { rows } = await searchPlanOrd(
        filters,
        factory_code,
        "",
        "",
        "",
        "en",
        10,
        0,
        true,
      );
      if (is_check === "Y") {
        // Lưu toàn bộ vào cache
        rows.forEach((item) => {
          acPlanCache.save(sessionKey, {
            code_no: "TMP_AC_PLAN",
            ac_no: String(item.ac_no),
            m_id: String(item.se_id),
            seq: parseFloat(item.se_seq),
            id: parseFloat(item.ship_seq),
            se_ver: String(item.se_ver),
            pack_gu: parseFloat(item.pack_gu),
          });
        });
      } else {
        // Xóa sạch cache của session
        acPlanCache.cache.set(sessionKey, []);
      }
      const allItems = acPlanCache.getAll(sessionKey);
      return {
        action: is_check === "Y" ? "SELECT_ALL" : "UNSELECT_ALL",
        total_selected: allItems.length,
        items: rows,
        message: is_check === "Y" ? "All items selected" : "All items cleared",
      };
    }
    if (is_check === "Y") {
      const item = {
        code_no: "TMP_AC_PLAN",
        ac_no: String(ac_no),
        m_id: String(se_id),
        seq: parseFloat(se_seq),
        id: parseFloat(ship_seq),
        se_ver: String(se_ver),
        pack_gu: parseFloat(pack_gu),
      };
      acPlanCache.save(sessionKey, item);
      const allItems = acPlanCache.getAll(sessionKey);
      return {
        action: "CHECK",
        is_check: "Y",
        ac_no: ac_no,
        m_id: se_id,
        seq: se_seq,
        id: ship_seq,
        se_ver: se_ver,
        pack_gu: pack_gu,
        total_selected: allItems.length,
        message: "Item added to plan successfully",
      };
    } else {
      const sessionData = acPlanCache.getAll(sessionKey);

      const filtered = sessionData.filter((item) => {
        return !(
          String(item.m_id) === String(se_id) &&
          parseFloat(item.seq) === parseFloat(se_seq) &&
          parseFloat(item.id) === parseFloat(ship_seq) &&
          String(item.se_ver) === String(se_ver) &&
          parseFloat(item.pack_gu) === parseFloat(pack_gu)
        );
      });

      acPlanCache.cache.set(sessionKey, filtered);

      return {
        action: "UNCHECK",
        is_check: "N",
        total_selected: filtered.length,
        deleted_item: {
          ac_no: ac_no,
          m_id: se_id,
          seq: se_seq,
          id: ship_seq,
          se_ver: se_ver,
          pack_gu: pack_gu,
        },
        remaining_items: filtered,
        message: "Item removed from plan successfully",
      };
    }
  } catch (error) {
    console.error("ERROR in checkPlanItem:", error);
    throw error;
  }
}
async function confirmPlanOrd(
  factory_code,
  ac_no,
  language,
  cont_no,
  status1,
  session_id,
) {
  try {
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };
    if (String(status1) !== "1") {
      return { action: "CONFIRM_REJECTED", message: "No Permission!" };
    }

    const sessionKey = session_id;
    const allItems = acPlanCache.getAll(sessionKey);

    if (!allItems || allItems.length === 0) {
      return {
        success: false,
        message: gf_mesgnm("210619", charset[language]),
      };
    }
    // Build IN clause trực tiếp từ allItems
    const inClause = allItems
      .map(
        (i) => `('${i.m_id}', '${i.seq}', ${i.id}, ${i.se_ver}, ${i.pack_gu})`,
      )
      .join(", ");

    // 1. Tính tổng P_SHIPQTY
    const shipQtyResult = await pool.query(
      `
      SELECT COALESCE(SUM(COALESCE(m.p_shipqty, 0)), 0) AS v_shipqty
      FROM "Customs".se_plan_ord m
      WHERE m.factory_code = :factory_code
        AND (m.se_id, m.se_seq, m.ship_seq, m.se_ver, m.pack_gu) IN (${inClause})
      `,
      {
        replacements: { factory_code },
        type: pool.QueryTypes.SELECT,
      },
    );

    // 2. Tính tổng stock qty của contract
    const stocQtyResult = await pool.query(
      `
      SELECT COALESCE(SUM(COALESCE(d.stock_qty, 0)), 0) AS v_stocqty
      FROM "Customs".vw_cont_exp m
      INNER JOIN "Customs".ac_cont_d d
        ON m.factory_code = d.factory_code
       AND m.cont_no = d.cont_no
      WHERE m.factory_code = :factory_code
        AND m.cont_no = :cont_no
      `,
      {
        replacements: { factory_code, cont_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    // 3. Tính tổng qty đã dùng của các AC khác
    const useQtyResult = await pool.query(
      `
      SELECT COALESCE(SUM(COALESCE(d.qty, 0)), 0) AS v_useqty
      FROM "Customs".vw_chg_exp m
      INNER JOIN "Customs".ac_chg_d d
        ON m.factory_code = d.factory_code
       AND m.ac_no = d.ac_no
      WHERE m.factory_code = :factory_code
        AND m.cont_no = :cont_no
        AND m.ac_no != :ac_no
        AND m.status = 1
      `,
      {
        replacements: { factory_code, cont_no, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    // 4. Tính tổng qty của AC hiện tại
    const bQtyResult = await pool.query(
      `
      SELECT COALESCE(SUM(COALESCE(d.qty, 0)), 0) AS v_bqty
      FROM "Customs".vw_chg_exp m
      INNER JOIN "Customs".ac_chg_d d
        ON m.factory_code = d.factory_code
       AND m.ac_no = d.ac_no
      WHERE m.factory_code = :factory_code
        AND m.ac_no = :ac_no
        AND m.cont_no = :cont_no
        AND m.status = 1
      `,
      {
        replacements: { factory_code, ac_no, cont_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    const v_shipqty = parseFloat(shipQtyResult[0]?.v_shipqty || 0);
    const v_stocqty = parseFloat(stocQtyResult[0]?.v_stocqty || 0);
    const v_useqty = parseFloat(useQtyResult[0]?.v_useqty || 0);
    const v_bqty = parseFloat(bQtyResult[0]?.v_bqty || 0);

    // 5. Kiểm tra qty có vượt contract không
    if (v_useqty + v_bqty + v_shipqty > v_stocqty) {
      const v_yqty = Math.abs(v_stocqty - (v_useqty + v_bqty + v_shipqty));
      const v_hqty = v_stocqty - (v_useqty + v_bqty);
      return {
        success: false,
        message: `Quantity exceeded: ${v_shipqty} - ${v_hqty} = ${v_yqty}`,
        v_shipqty,
        v_hqty,
        v_yqty,
      };
    }

    // 6. Gọi function chuyển sang báo quan
    await gf_ac_pack(factory_code, ac_no, allItems);

    // 7. Update COL7 = 12
    await pool.query(
      `
      UPDATE "Customs".se_plan_ord
      SET col7 = 12
      WHERE factory_code = :factory_code
        AND (se_id, se_seq, ship_seq, se_ver, pack_gu) IN (${inClause})
      `,
      {
        replacements: { factory_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    // 8. Update PEICE, GROSS
    await pool.query(
      `
      UPDATE "Customs".vw_chg_exp t
      SET (peice, gross) = (
        SELECT
          SUM(COALESCE(y.ctns, 0)) AS ctns,
          SUM(COALESCE(x.nw, 0) + COALESCE(y.ctns, 0) * ROUND(COALESCE(z.sap_nw, 0), 2)) AS gw
        FROM "pac".sd_pack_m x
        INNER JOIN (
          SELECT s.factory_code, s.se_id, s.se_seq, s.pack_gu, s.pk_seq,
                 SUM(COALESCE(s.ctns, 0)) AS ctns
          FROM "Customs".ac_plan_ord m
          INNER JOIN "Customs".se_plan_size s
            ON m.factory_code = s.factory_code
           AND m.se_id = s.se_id
           AND m.se_seq = s.se_seq
           AND m.pack_gu = s.pack_gu
           AND m.ship_seq = s.ship_seq
          WHERE m.factory_code = :factory_code
            AND m.ac_no = :ac_no
          GROUP BY s.factory_code, s.se_id, s.se_seq, s.pack_gu, s.pk_seq
        ) y ON x.org_id = y.factory_code
           AND x.se_id = y.se_id
           AND x.se_seq = y.se_seq::NUMERIC
           AND x.pack_gu = y.pack_gu
           AND x.pk_seq = y.pk_seq::NUMERIC
        LEFT JOIN "public".mm_item z ON x.item_no = z.item_no
      )
      WHERE t.factory_code = :factory_code
        AND t.ac_no = :ac_no
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.UPDATE,
      },
    );

    // 9. Update SUM_QTY, SUM_MONEY, TAX
    const sumResult = await pool.query(
      `
      SELECT
        SUM(COALESCE(qty, 0)) AS v_sumqty,
        SUM(COALESCE(money, 0)) AS v_summoney,
        SUM(COALESCE(tax, 0)) AS v_sumtax
      FROM "Customs".ac_chg_d
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      `,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    await pool.query(
      `
      UPDATE "Customs".vw_chg_exp
      SET sum_qty = :v_sumqty,
          sum_money = :v_summoney,
          tax = ROUND(:v_sumtax, 2)
      WHERE factory_code = :factory_code
        AND ac_no = :ac_no
      `,
      {
        replacements: {
          factory_code,
          ac_no,
          v_sumqty: parseFloat(sumResult[0]?.v_sumqty || 0),
          v_summoney: parseFloat(sumResult[0]?.v_summoney || 0),
          v_sumtax: parseFloat(sumResult[0]?.v_sumtax || 0),
        },
        type: pool.QueryTypes.UPDATE,
      },
    );

    // 10. Xoá cache
    acPlanCache.cache.delete(sessionKey);

    return {
      success: true,
      message: "Plan transferred to export declaration successfully",
      ac_no: ac_no,
      total_transferred: allItems.length,
    };
  } catch (error) {
    console.error("ERROR in confirmPlanOrd:", error);
    throw error;
  }
}

async function gf_ac_pack(factory_code, ac_no, tempTable) {
  try {
    console.log("adadada", tempTable);

    //p loop tmp_ac_plan
    for (const item of tempTable) {
      let km_id = null;
      const k = item.m_id.indexOf("-");
      if (k > 0) {
        km_id = item.m_id.substring(0, k - 1);
      }
      const maxSeq = await pool.query(
        `SELECT COALESCE(MAX(SEQ),0)+1 as max_seq
      FROM "Customs".ac_plan_se
      where factory_code = :factory_code
      `,
        {
          replacements: { factory_code: factory_code },
          type: pool.QueryTypes.SELECT,
        },
      );
      const v_seq = maxSeq[0]?.max_seq || 1;
      await pool.query(
        `
      Insert into "Customs".ac_plan_se(factory_code, ac_no, seq, se_id, se_seq, ship_seq, se_ver, pack_gu)
      values(:factory_code, :acno, :v_seq, :m_id ,:se_seq, :ship_seq, :se_ver, :pack_gu)
      `,
        {
          replacements: {
            factory_code: factory_code,
            acno: ac_no,
            v_seq: v_seq,
            m_id: item.m_id,
            se_seq: item.seq,
            ship_seq: item.id,
            se_ver: item.se_ver,
            pack_gu: item.pack_gu,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      const t_seid = await pool.query(
        `
        Select se_id from "Customs".ac_plan_ord as t_seid
        where factory_code = :factory_code
        and ac_no = :ac_no
        and se_id = :se_id
        and se_seq = :se_seq
        and ship_seq = :ship_seq
        limit 1
        `,
        {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            se_id: item.m_id,
            se_seq: item.seq.toString(),
            ship_seq: item.id,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      console.log("km_id",km_id,t_seid);
      
      if (t_seid[0]?.se_id === null || t_seid[0]?.se_id === undefined) {
        if (km_id !== null) {
          await pool.query(
            `
              INSERT INTO "Customs".AC_PLAN_ORD(FACTORY_CODE, AC_NO, SE_ID, SE_SEQ, SHIP_SEQ,
							  									PROD_NO, SE_CUST, SE_VER, PACK_GU)
              values(:factory_code, :acno, :m_id, :seq, :id, "Customs".GF_SE_PROD(:factory_code, :km_id,1, :seq),
              "Customs".GF_SE_SECUST(:factory_code, :km_id,1), :se_ver, :pack_gu)
              `,
            {
              replacements: {
                factory_code: factory_code,
                acno: ac_no,
                m_id: item.m_id,
                seq: item.seq.toString(),
                id: item.id,
                prod_no: item.prod_no,
                se_cust: item.se_cust,
                se_ver: item.se_ver,
                pack_gu: item.pack_gu,
                km_id: km_id,
              },
            },
          );
        } else {
          await pool.query(
            `
              INSERT INTO "Customs".AC_PLAN_ORD(FACTORY_CODE, AC_NO, SE_ID, SE_SEQ, SHIP_SEQ,
							  									PROD_NO, SE_CUST, SE_VER, PACK_GU)
			  	VALUES(:factory_code, :ac_no, :m_id, :seq, :id,
					  		 "Customs".GF_SE_PROD(:factory_code, :m_id,1, :seq),"Customs".GF_SE_SECUST(:factory_code, :m_id,1), :se_ver , :pack_gu);
              `,
            {
              replacements: {
                factory_code: factory_code,
                ac_no: ac_no,
                m_id: item.m_id,
                seq: item.seq.toString(),
                id: item.id,
                se_ver: item.se_ver,
                pack_gu: item.pack_gu,
              },
              type: pool.QueryTypes.SELECT,
            },
          );
        }
      }
      let v_recaddr = "";
      let v_country = "";
      if (km_id !== null) {
        const selectRows = await pool.query(
          `
         SELECT D.BL_ADRESS,D.COL1 
		  	FROM   "Customs".SE_SHIPING_M M, "Customs".SE_SHIPING_D D
		  	WHERE  M.FACTORY_CODE = :factory_code
		  	AND    M.CUST_ID = "Customs".GF_SE_SECUST(:factory_code, :km_id,1)
		  	AND    M.FACTORY_CODE = D.FACTORY_CODE
		  	AND    M.SI_SEQ = D.SI_SEQ
		  	AND    M.CUST_ID = D.CUST_ID
		  	AND    D.SI_TYPE = '1'
          `,
          {
            replacements: {
              factory_code: factory_code,
              km_id: km_id,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_recaddr = selectRows[0]?.bl_adress || "";
        v_country = selectRows[0]?.col1 || "";
      } else {
        const selectRows = await pool.query(
          `SELECT D.BL_ADRESS,D.COL1 
		  	FROM   "Customs".SE_SHIPING_M M, "Customs".SE_SHIPING_D D
		  	WHERE  M.FACTORY_CODE = :factory_code
		  	AND    M.CUST_ID = "Customs".GF_SE_SECUST(:factory_code, :m_id,1)
		  	AND    M.FACTORY_CODE = D.FACTORY_CODE
		  	AND    M.SI_SEQ = D.SI_SEQ
		  	AND    M.CUST_ID = D.CUST_ID
		  	AND    D.SI_TYPE = '1'`,
          {
            replacements: { factory_code, m_id: item.m_id },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_recaddr = selectRows[0]?.bl_adress || "";
        v_country = selectRows[0]?.col1 || "";
      }
      //update vw_chg_exp
      await pool.query(
        ` UPDATE "Customs".VW_CHG_EXP SET REC_ADDR = COALESCE(REC_ADDR, :v_recaddr),
		                        IN_COUNTRY =  COALESCE(IN_COUNTRY, :v_country)
	    WHERE  FACTORY_CODE = :factory_code
	    AND    AC_NO = :ac_no;`,
        {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            v_recaddr: v_recaddr,
            v_country: v_country,
          },
          type: pool.QueryTypes.UPDATE,
        },
      ); 

      //insert into ac_plan_pack
      await pool.query(
        `INSERT INTO "Customs".AC_PLAN_PACK(FACTORY_CODE, AC_NO, SE_ID, SE_SEQ, PK_SEQ, SHIP_SEQ,
		                         SIZERUN, CTNS, CTNS_PAIRS, PAIRS, SE_VER, PACK_GU)
	   SELECT :factory_code, :ac_no, SE_ID, SE_SEQ, PK_SEQ, SHIP_SEQ,
	          SIZERUN, CTNS, CTNS_PAIRS, ROUND(COALESCE(CTNS,0) * COALESCE(CTNS_PAIRS,0),4), SE_VER, PACK_GU
	   FROM   "Customs".SE_PLAN_SIZE
	   WHERE  FACTORY_CODE = :factory_code
	   AND    SE_ID = :m_id
	   AND    SE_SEQ = :seq
	   AND    SHIP_SEQ = :id;`,
        {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            m_id: item.m_id,
            seq: item.seq.toString(),
            id: item.id,
          },
          type: pool.QueryTypes.INSERT,
        },
      );

      //gf_plan_size
       await pool.query(
        `SELECT "Customs".gf_plan_size(:factory_code, :ac_no, :m_id, :seq, :pack_gu, :id);`,
         {
           replacements: {
             factory_code: factory_code,
             ac_no: ac_no,
             m_id: item.m_id,
             seq: item.seq.toString(),
             pack_gu: item.pack_gu,
             id: item.id,
           },
           type: pool.QueryTypes.SELECT,
         },
       );
    }
    // update ac_chg_d
    await pool.query(
      `UPDATE "Customs".AC_CHG_D SET QTY = NULL,MONEY = NULL
	WHERE  FACTORY_CODE = :factory_code
	AND    AC_NO = :ac_no
	AND    IS_REF = 'Y';`,
      {
        replacements: {
          factory_code: factory_code,
          ac_no: ac_no,
        },
        type: pool.QueryTypes.UPDATE,
      },
    );
    const acPlansizeItems = await pool.query(
      `
      SELECT 
      PROD_ACNO, 
                    ROUND("Customs".GF_SEORD_PRICE_NOVER(FACTORY_CODE, SE_ID, SE_SEQ::NUMERIC),4) AS PRICE, 
                    SUM(COALESCE(PAIRS,0)) AS QTY, 
                    ROUND(SUM(COALESCE(PAIRS,0)*COALESCE("Customs".GF_SEORD_PRICE_NOVER(FACTORY_CODE, SE_ID, SE_SEQ::NUMERIC),0)),2) AS MONEY
	         FROM   "Customs".AC_PLAN_SIZE
	         WHERE  FACTORY_CODE = :factory_code
	         AND    AC_NO = :ac_no
	         GROUP BY PROD_ACNO, ROUND("Customs".GF_SEORD_PRICE_NOVER(FACTORY_CODE, SE_ID, SE_SEQ::NUMERIC),4)
             ORDER BY PROD_ACNO, ROUND("Customs".GF_SEORD_PRICE_NOVER(FACTORY_CODE, SE_ID, SE_SEQ::NUMERIC),4)`,
      {
        replacements: {
          factory_code: factory_code,
          ac_no: ac_no,
        },
        type: pool.QueryTypes.SELECT,
      },
    );

    //t loop ac_plan_size
    for (const item of acPlansizeItems) {
      const selectRows = await pool.query(
        `
        SELECT AC_ITEMNO 
			FROM   "Customs".AC_CHG_D
			WHERE  FACTORY_CODE = :factory_code
			AND    AC_NO = :ac_no
			AND    AC_ITEMNO = :prod_acno
			AND    PRICE = :price
      limit 1
        `,
        {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            prod_acno: item.prod_acno || "1",
            price: item.price || 0,
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      const v_itemacno = selectRows[0]?.ac_itemno || null;
      let y = 1;
      if (v_itemacno !== null) {
        await pool.query(
          `UPDATE "Customs".AC_CHG_D SET QTY =  COALESCE(QTY,0) + COALESCE(:qty,0),
	  	                    MONEY = COALESCE(MONEY,0) + COALESCE(:money,0),
	  	                    IS_REF = 'Y'
			WHERE  FACTORY_CODE = :factory_code
			AND    AC_NO = :ac_no
			AND    AC_ITEMNO = :prod_acno
			AND    PRICE = :price;`,
          {
            replacements: {
              factory_code: factory_code,
              ac_no: ac_no,
              prod_acno: item.prod_acno || "1",
              price: item.price,
              qty: item.qty,
              money: item.money,
            },
            type: pool.QueryTypes.UPDATE,
          },
        );
      } else {
        const maxSeqResult = await pool.query(
          `
          SELECT COALESCE(MAX(SEQ),0)+1 as max_seq
			FROM   "Customs".AC_CHG_D
			WHERE  FACTORY_CODE = :factory_code
			AND    AC_NO = :ac_no;
          `,
          {
            replacements: {
              factory_code: factory_code,
              ac_no: ac_no,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        y = parseInt(maxSeqResult[0]?.max_seq) || 1;
      }

      const v_unit = await pool.query(
        `SELECT "Customs".gf_ac_prod_unit(:factory_code, "Customs".GF_AC_SHOEID(:factory_code,:prod_acno)) as unit;`,
        {
          replacements: {
            factory_code: factory_code,
            prod_acno: item.prod_acno || "1",
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      const v_shoeid = await pool.query(
        `SELECT "Customs".GF_AC_SHOEID(:factory_code,:prod_acno) as shoe_id;`,
        {
          replacements: {
            factory_code: factory_code,
            prod_acno: item.prod_acno || "1",
          },
          type: pool.QueryTypes.SELECT,
        },
      );
      //insert into ac_chg_d
      await pool.query(
        `INSERT INTO "Customs".AC_CHG_D(FACTORY_CODE, AC_NO, SEQ, AC_ITEMNO, SHOE_ID,
			                     UNIT, PRICE, QTY, MONEY, TAX, TAX_RATE, IS_REF)
			VALUES (:factory_code, :ac_no, :seq, :prod_acno, :shoe_id,
			        :unit, :price, :qty, ROUND(COALESCE(:price,0) * COALESCE(:qty,0),2), 0, 0,'Y');`,
        {
          replacements: {
            factory_code: factory_code,
            ac_no: ac_no,
            prod_acno: item.prod_acno || "1",
            price: item.price,
            qty: parseFloat(item.qty) || 0, 
            seq: y,
            unit: v_unit[0]?.unit || null,
            shoe_id: v_shoeid[0]?.shoe_id || null,
          },
          type: pool.QueryTypes.INSERT,
        },
      );
    }
  } catch (error) {
    console.error("Error in gf_ac_pack:", error);
    throw error;
  }
}
function getPlanSelections(session_id) {
  const sessionData = acPlanCache.getAll(session_id);
  return sessionData;
}
function clearPlanSession(session_id) {
  acPlanCache.clearSession(session_id);
  console.log(`🧹 Cleared SY_TREE session: ${session_id}`);
  return {
    action: "CLEAR",
    message: "Plan session cleared",
  };
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
module.exports = {
  listAllPlanOrd,
  searchPlanOrd,
  checkPlanItem,
  confirmPlanOrd,
  getPlanSelections,
  clearPlanSession,
};
