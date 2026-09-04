  const { Op } = require("sequelize");
  const pool = require("../../config/db.js");
  const { RdTempCache } = require("../rd_temp/rd_temp.js");
  const syTreeCache = new RdTempCache("SY_TREE", "SY_TREE");

  async function fetchFieldDropdown(
    factory_code,
    field = null,
    language,
    page,
    limit,
    search,
    extraField,
    conditionField,
  ) {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code,
      p_charset: language,
      limit: parseInt(limit) || 10,
      offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    };

    let searchCondition = "";
    if (search && search.trim() !== "") {
      if (field === "se_id") {
        searchCondition = `
          AND ssd.${field} ILIKE :search
        `;
        replacements.search = `%${search.trim()}%`;
      } else {
        searchCondition = `
        AND ${field === "send_addr" ? "ssm" : "spm"}.${field} = :search
      `;
        replacements.search = `${search.trim()}`;
      }
    }

    if (extraField && extraField !== "undefined" && extraField !== "null") {
      permissionCondition = `${permissionCondition} AND ssd.se_id = :extraField`;
      replacements.extraField = extraField;
    }
    if (
      conditionField &&
      conditionField !== "undefined" &&
      conditionField !== "null"
    ) {
      permissionCondition = `${permissionCondition} AND ssm.sales_date >= :conditionField`;
      replacements.conditionField = conditionField;
    }
    let sql;
    let countSql;

    if (field) {
      sql = `
        select distinct
          ${field === "send_addr" ? "ssm" : "spm"}.${field} as value,
          ssd.se_id,
          spm.se_ver,
          ssd.se_seq,
          spm.pack_gu,
          ssm.sales_date 
        FROM "pac".sd_sales_d ssd 
        join "pac".sd_sales_m ssm 
        on ssm.sales_id = ssd.sales_id
        and ssm.org_id= ssd.org_id
        join "pac".sd_pack_m spm
        on ssd.se_id = spm.se_id
        and ssd.org_id= spm.org_id
        and ssd.se_seq = spm.se_seq::TEXT 
        WHERE 
        ${permissionCondition} 
        ${searchCondition}
        ORDER BY ${field}
        LIMIT :limit
        OFFSET :offset
      `;

      countSql = `
        SELECT COUNT( distinct ${field === "send_addr" ? "ssm" : "spm"}.${field}) as total
        FROM "pac".sd_sales_d ssd 
        join "pac".sd_sales_m ssm 
        on ssm.sales_id = ssd.sales_id
        and ssm.org_id= ssd.org_id
        join "pac".sd_pack_m spm
        on ssd.se_id = spm.se_id
        and ssd.org_id= spm.org_id
        and ssd.se_seq = spm.se_seq::TEXT 
        WHERE 
        ${permissionCondition} 
        ${searchCondition}
      `;
    }

    try {
      const rows = await pool.query(sql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });

      const totalResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });

      const total = parseInt(totalResult[0]?.total || 0);

      return {
        data: rows,
        total: total,
        pageSize: parseInt(limit) || 10,
        currentPage: parseInt(page) || 1,
      };
    } catch (error) {
      console.error("Error in fetchFieldDropdown:", error);
      throw error;
    }
  }
  async function fetchPackingSeidDropdown(factory_code, page, limit, search) {
    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code,
      limit: parseInt(limit) || 10,
      offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    };
    let searchCondition = "";
    if (search && search.trim() !== "") {
      searchCondition = `
        AND (
          invoice_no ILIKE :search OR
        )
      `;
      replacements.search = `%${search.trim()}%`;
    }
    const sql = `
        SELECT
          a.se_id,
        --  b.se_seq,
        --  b.pack_gu,
          c.ship_seq,
        -- b.prod_no,
          a.se_custid
        FROM "pac".sd_ord_m_c a
      --  JOIN "pac".sd_ord_m_c b
      --   ON a.org_id = b.org_id 
      --  AND a.se_id = b.se_id 
        -- AND a.pack_gu = b.pack_gu
        JOIN "Customs".se_plan_ord c
        ON a.org_id = c.factory_code
        AND a.se_id  = c.se_id
      --  AND b.se_seq = c.se_seq::NUMERIC
      --  AND b.se_ver = c.se_ver::NUMERIC
        AND a.pack_gu = c.pack_gu

      --   ON b.org_id = c.factory_code
      --  AND b.se_id  = c.se_id
      --  AND b.se_seq = c.se_seq::NUMERIC
      --  AND b.se_ver = c.se_ver::NUMERIC
      --  AND b.pack_gu = c.pack_gu
        WHERE a.org_id = :factory_code
        AND ${permissionCondition} 
        ${searchCondition}
        ORDER BY a.se_id,
      --  b.se_seq, b.pack_gu,
      c.ship_seq
      `;
    const countSql = `
          SELECT COUNT(*) AS total
          FROM "pac".sd_ord_m_c a
      --  JOIN "pac".sd_ord_m_c b
      --   ON a.org_id = b.org_id 
      --  AND a.se_id = b.se_id 
        -- AND a.pack_gu = b.pack_gu
        JOIN "Customs".se_plan_ord c
        ON a.org_id = c.factory_code
        AND a.se_id  = c.se_id
      --  AND b.se_seq = c.se_seq::NUMERIC
      --  AND b.se_ver = c.se_ver::NUMERIC
        AND a.pack_gu = c.pack_gu

      --   ON b.org_id = c.factory_code
      --  AND b.se_id  = c.se_id
      --  AND b.se_seq = c.se_seq::NUMERIC
      --  AND b.se_ver = c.se_ver::NUMERIC
      --  AND b.pack_gu = c.pack_gu
        WHERE a.org_id = :factory_code
        AND ${permissionCondition} 
        ${searchCondition}
        `;
    try {
      const rows = await pool.query(sql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      const totalResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      const total = parseInt(totalResult[0]?.total || 0);
      return {
        data: rows,
        total: total,
        pageSize: parseInt(limit) || 10,
        currentPage: parseInt(page) || 1,
      };
    } catch (error) {
      console.error("Error in fetchFieldDropdown:", error);
      throw error;
    }
  }
  async function listAllSeOrdItem(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  ) {
    let charSet = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code,
      p_charset: charSet[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
    };

    // Permission conditions
    let permissionCondition = "A.ORG_ID = :factory_code";
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition += " AND A.GRT_DEPT = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition += " AND A.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    try {
      const sql = `
        SELECT 
        Distinct
          A.ORI_SE_ID AS SO,
          A.SE_ID,
          A.SE_SEQ,
          A.SE_CUSTID,
          A.PACK_GU,
          "Customs".GF_CUSTID_CUSTNO(A.ORG_ID, A.SE_CUSTID) AS CUST_NO,
          "Customs".GF_CUSTNM_J(A.ORG_ID, A.SE_CUSTID, :p_charset) AS CUSTNM,
          A.PROD_NO,
          C.SPG_NO AS SPG_NO,
          A.SE_QTY,
          A.NLT,
          A.PO,
          A.MER_PO,
          A.SE_DAY,
          B.STATUS,
          -- Additional info for planning
          COALESCE(A.SE_QTY, 0) - COALESCE("Customs".GF_SE_PLAN_SHIPQTY(A.org_id, A.SE_ID, A.PACK_GU, A.SE_SEQ::TEXT), 0) AS AVAILABLE_QTY
        FROM "pac".SD_ORD_M_C A
        INNER JOIN "pac".SD_PACK_M B
          ON A.org_id = B.ORG_ID 
          AND A.SE_ID = B.SE_ID 
          AND A.PACK_GU = B.PACK_GU 
          AND A.SE_SEQ = B.SE_SEQ
        INNER JOIN "public".MM_ITEM C
          ON A.PROD_NO = C.ITEM_NO
        WHERE 
          A.STATUS > 1
          AND B.STATUS >= 7
          AND COALESCE(A.SE_QTY, 0) - COALESCE("Customs".GF_SE_PLAN_SHIPQTY(A.ORG_ID, A.SE_ID, A.PACK_GU, A.SE_SEQ::TEXT), 0) > 0
        ORDER BY A.SE_ID, A.SE_SEQ, A.PACK_GU
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
      console.error("Error in listSeOrdItemForPlan:", error);
      throw error;
    }
  }
  async function search(
    query,
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
    isAll = false,
  ) {
    let charSet = {
      vi: "S",
      en: "E",
      zh: "T",
    };

    let replacements = {
      factory_code: factory_code,
      p_charset: charSet[language] || "E",
      limit: parseInt(limit) + 1 || 11,
      offset: parseInt(offset) || 0,
      se_id: query?.se_id || null,
      cust_id: query?.cust_id || null,
      s_date: query?.s_date_1 || null,
      e_date: query?.e_date_1 || null,
    };

    // Permission conditions
    let permissionCondition = "A.ORG_ID = :factory_code";
    if (user_code !== "admin") {
      if (query_level === "2" && department_code) {
        permissionCondition += " AND A.GRT_DEPT = :permission_dept";
        replacements.permission_dept = department_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition += " AND A.GRT_USER = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    try {
      const baseSelect = `
        SELECT DISTINCT
          A.ORI_SE_ID AS SO,
          A.SE_ID,
          A.SE_CUSTID,
          A.SE_SEQ,
          A.PACK_GU,
          "Customs".GF_CUSTID_CUSTNO(A.ORG_ID, A.SE_CUSTID) AS CUST_NO,
          "Customs".GF_CUSTNM_J(A.ORG_ID, A.SE_CUSTID, :p_charset) AS CUSTNM,
          A.PROD_NO,
          C.SPG_NO AS SPG_NO,
          A.SE_QTY,
          A.NLT,
          A.PO,
          A.MER_PO,
          A.SE_DAY,
          B.STATUS,
          COALESCE(A.SE_QTY, 0) - COALESCE("Customs".GF_SE_PLAN_SHIPQTY(A.ORG_ID, A.SE_ID, A.PACK_GU, A.SE_SEQ::TEXT), 0) AS AVAILABLE_QTY
        FROM "pac".SD_ORD_M_C A
        INNER JOIN "pac".SD_PACK_M B
          ON A.ORG_ID = B.ORG_ID 
          AND A.SE_ID = B.SE_ID 
          AND A.PACK_GU = B.PACK_GU 
          AND A.SE_SEQ = B.SE_SEQ
        INNER JOIN "public".mm_item C
          ON A.PROD_NO = C.ITEM_NO
        WHERE 
          ${permissionCondition}
          AND A.STATUS > 1
          AND B.STATUS >= 7
          AND COALESCE(A.SE_QTY, 0) - COALESCE("Customs".GF_SE_PLAN_SHIPQTY(A.ORG_ID, A.SE_ID, A.PACK_GU, A.SE_SEQ::TEXT), 0) > 0
          AND (
            :cust_id IS NULL 
            OR "Customs".GF_CUSTID_CUSTNO(A.ORG_ID, A.SE_CUSTID) ILIKE :cust_id || '%'
          )
          AND (
            :se_id IS NULL 
            OR (COALESCE(A.SE_ID, '')      ILIKE '%' || :se_id     || '%')
          )
          AND (
            :s_date IS NULL 
            OR DATE(A.NLT) >= DATE(:s_date)
          )
          AND (
            :e_date IS NULL 
            OR DATE(A.NLT) <= DATE(:e_date)
          )
      `;

      const sql = `
        ${baseSelect}
        ORDER BY A.SE_ID, A.SE_SEQ, A.PACK_GU
        ${isAll ? "" : "LIMIT :limit OFFSET :offset"}
      `;

      const countSql = `
        SELECT COUNT(*) AS total FROM (
          ${baseSelect}
        ) sub
      `;

      const rows = await pool.query(sql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      const countResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      const hasMore = rows.length > parseInt(limit);
      const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
      const total = parseInt(countResult[0].total);

      return {
        rows: actualRows,
        total: total,
        hasMore: hasMore,
      };
    } catch (error) {
      console.error("Error in listSeOrdItemForPlan:", error);
      throw error;
    }
  }

  async function checkPlanItem(
    se_id,
    se_seq,
    pack_gu,
    pack_status,
    is_check,
    session_id,
    filters = {},
    isAll = false,
    factory_code,
  ) {
    try {
      const sessionKey = session_id;
      if (isAll) {
        const { rows } = await search(
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
          rows.forEach((item) => {
            syTreeCache.save(sessionKey, {
              code_no: "SY_TREE",
              seq: parseFloat(item?.se_seq),
              col1: String(item?.se_id),
              col2: parseFloat(item?.pack_gu),
              col3: String(pack_status),
              col4: null,
              col5: null,
              col6: null,
            });
          });
        } else {
          // Xóa sạch cache của session
          syTreeCache.cache.set(sessionKey, []);
        }
        const allItems = syTreeCache.getAll(sessionKey);
        return {
          action: is_check === "Y" ? "SELECT_ALL" : "UNSELECT_ALL",
          total_selected: allItems.length,
          items: rows,
          message: is_check === "Y" ? "All items selected" : "All items cleared",
        };
      }
      if (is_check === "Y") {
        if (pack_status === 1 || pack_status === "1") {
          return {
            action: "CHECK_REJECTED",
            is_check: "N",
            should_uncheck: true,
            message: "Cannot select items with PACK_STATUS = 1 (大小包裝)",
          };
        } else {
          const item = {
            code_no: "SY_TREE",
            seq: parseFloat(se_seq),
            col1: String(se_id),
            col2: parseFloat(pack_gu),
            col3: String(pack_status),
            col4: null,
            col5: null,
            col6: null,
          };
          syTreeCache.save(sessionKey, item);
          const allItems = syTreeCache.getAll(sessionKey);
          const totalSelected = allItems.length;

          return {
            action: "CHECK",
            is_check: "Y",
            m_id: se_id,
            seq: se_seq,
            id: pack_gu,
            total_selected: totalSelected,
            message: "Item added to plan successfully",
          };
        }
      } else {
        console.log(" UNCHECK: Processing N branch...");
        const sessionData = syTreeCache.getAll(sessionKey);

        const seqToDelete = parseFloat(se_seq);
        const packGuToDelete = parseFloat(pack_gu);
        const packingSeIdToDelete = String(se_id);

        const filtered = sessionData.filter((item) => {
          const seqMatch = parseFloat(item.seq) === seqToDelete;
          const m_idMatch = String(item.col1) === packingSeIdToDelete;
          const idMatch = parseFloat(item.col2) === packGuToDelete;

          return !(seqMatch && m_idMatch && idMatch);
        });
        syTreeCache.cache.set(sessionKey, filtered);
        const sessionDataAfter = syTreeCache.getAll(sessionKey);
        const totalSelected = filtered.length;
        return {
          action: "UNCHECK",
          is_check: "N",
          total_selected: totalSelected,
          deleted_item: {
            M_ID: se_id,
            SEQ: se_seq,
            ID: pack_gu,
          },
          remaining_items: sessionDataAfter,
          message: "Item removed from plan successfully",
        };
      }
    } catch (error) {
      console.error(" ERROR in checkPlanItem:", error);
      throw error;
    }
  }

  async function selectAllPlan(items, is_select_all, session_id) {
    console.log("📋 selectAllPlan:", {
      itemCount: items.length,
      is_select_all,
      session_id,
    });

    try {
      const sessionKey = session_id;
      const results = {
        total: items.length,
        inserted: 0,
        skipped: 0,
        deleted: 0,
        errors: [],
      };

      if (is_select_all === "Y") {
        console.log("✅ SELECT ALL: Processing Y branch...");

        // DECLARE X NUMBER;
        // BEGIN
        //   GO_BLOCK('SE_ORD_ITEM');
        //   LAST_RECORD;
        //   X := :SYSTEM.TRIGGER_RECORD;
        //   FOR I IN 1..X LOOP
        //     GO_RECORD(I);
        //     GO_ITEM('SE_ORD_ITEM.SEL');
        //     :SE_ORD_ITEM.SEL := :CONTROL.SEL_ALL;
        //     EXECUTE_TRIGGER('WHEN-CHECKBOX-CHANGED');
        //   END LOOP;
        //   FIRST_RECORD;
        // END;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // EXECUTE_TRIGGER('WHEN-CHECKBOX-CHANGED')
          const checkResult = await checkPlanItem(
            item.packing_seid,
            item.se_seq,
            item.pack_gu,
            item.pack_status,
            "Y", // :SE_ORD_ITEM.SEL := :CONTROL.SEL_ALL
            sessionKey,
          );

          if (checkResult.action === "CHECK") {
            results.inserted++;
          } else if (checkResult.should_uncheck) {
            // PACK_STATUS = 1, cannot select
            results.skipped++;
            results.errors.push({
              index: i,
              item: item.pack_gu,
              reason: "PACK_STATUS = 1",
            });
          }
        }

        console.log(
          `✅ SELECT ALL completed: inserted=${results.inserted}, skipped=${results.skipped}`,
        );

        return {
          action: "SELECT_ALL",
          is_select_all: "Y",
          message: `Selected ${results.inserted} items, skipped ${results.skipped}`,
          results,
        };
      } else {
        console.log(" UNSELECT ALL: Processing N branch...");

        // Loop qua tất cả items và uncheck
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          await checkPlanItem(
            item.packing_seid,
            item.se_seq,
            item.pack_gu,
            item.pack_status,
            "N",
            sessionKey,
          );

          results.deleted++;
        }

        console.log(`🗑️ UNSELECT ALL completed: deleted=${results.deleted}`);

        return {
          action: "UNSELECT_ALL",
          is_select_all: "N",
          message: `Removed ${results.deleted} items from plan`,
          results,
        };
      }
    } catch (error) {
      console.error("❌ ERROR in selectAllPlan:", error);
      throw error;
    }
  }

  function getPlanSelections(session_id) {
    const sessionData = syTreeCache.getAll(session_id);
    return sessionData.map((item) => ({
      M_ID: item.col1,
      SEQ: item.seq,
      ID: item.col2,
      PACK_STATUS: item.col3,
    }));
  }
  function clearPlanSession(session_id) {
    syTreeCache.clearSession(session_id);
    console.log(`🧹 Cleared SY_TREE session: ${session_id}`);

    return {
      action: "CLEAR",
      message: "Plan session cleared",
    };
  }
  async function generatePlan(
    factory_code,
    plan_date,
    session_id,
    user_code,
    department_code,
    last_user,
  ) {
    // Validation
    if (!plan_date) {
      throw new Error("Plan Ship Date cannot be empty (PLAN_DATE不可為空值)");
    }

    const transaction = await pool.transaction();

    try {
      // ========================================
      // STEP 1: Check if there are selected items in SY_TREE
      // ========================================
      const selectedItems = syTreeCache.getAll(session_id);

      if (!selectedItems || selectedItems.length === 0) {
        throw new Error(
          "No items selected for plan generation (請先選擇要計劃的項目)",
        );
      }

      console.log(`📦 Found ${selectedItems.length} selected items in SY_TREE`);

      const results = {
        total_items: selectedItems.length,
        created_plans: 0,
        created_sizes: 0,
        errors: [],
      };

      // ========================================
      // STEP 2: Loop through each selected item
      // ========================================
      for (const treeItem of selectedItems) {
        try {
          const se_id = treeItem.col1;
          const se_seq = treeItem.seq;
          const pack_gu = treeItem.col2;

          // Get order info
          const orderDataSql = `
            SELECT 
              O.SE_ID,
              O.SE_SEQ,
              O.PACK_GU,
              O.SEND_ADDR,
              O.SEND_MODE,
              O.SE_CUSTID,
              O.SE_VER
            FROM "pac".SD_ORD_M_C O
            WHERE O.ORG_ID = :factory_code
              AND O.SE_ID = :se_id
              AND O.PACK_GU = :pack_gu
              AND O.SE_SEQ = :se_seq
          `;

          const orderRows = await pool.query(orderDataSql, {
            replacements: { factory_code, se_id, pack_gu, se_seq },
            type: pool.QueryTypes.SELECT,
            transaction,
          });

          if (!orderRows || orderRows.length === 0) {
            console.warn(` Order not found: ${se_id}/${se_seq}/${pack_gu}`);
            continue;
          }

          const orderData = orderRows[0];
          console.log("orderdadada", orderData);

          // ========================================
          // STEP 2.1: Calculate next SHIP_SEQ
          // ========================================
          const maxShipSeqSql = `
            SELECT COALESCE(MAX(SHIP_SEQ), 0) as max_seq
            FROM "Customs".SE_PLAN_ORD
            WHERE factory_code = :factory_code
              AND SE_ID = :se_id
              AND PACK_GU = :pack_gu
              AND SE_SEQ = :se_seq
              AND SE_VER = :se_ver
          `;

          const shipSeqResult = await pool.query(maxShipSeqSql, {
            replacements: {
              factory_code,
              se_id: orderData.se_id,
              pack_gu: orderData.pack_gu,
              se_seq: orderData.se_seq,
              se_ver: orderData.se_ver,
            },
            type: pool.QueryTypes.SELECT,
            transaction,
          });

          const nextShipSeq = parseInt(shipSeqResult[0]?.max_seq || 0) + 1;

          // ========================================
          // STEP 2.2: Get shipping address and agent
          // ========================================
          let t_addr = orderData.send_addr || null;
          let t_agent = null;

          // Try get from SE_SHIPING_D table
          try {
            await pool.query("SAVEPOINT sp_shipping_info", { transaction });

            const shippingInfoSql = `
              SELECT P_ADRESS, AGENT
              FROM "Customs".SE_SHIPING_D
              WHERE FACTORY_CODE = :factory_code
                AND CUST_ID = "Customs".GF_SE_SECUST(:factory_code, :se_id, :se_ver)
                AND SI_TYPE = 1::TEXT
              LIMIT 1
            `;

            const shippingRows = await pool.query(shippingInfoSql, {
              replacements: {
                factory_code,
                se_id: orderData.se_id,
                se_ver: orderData.se_ver,
              },
              type: pool.QueryTypes.SELECT,
              transaction,
            });

            if (shippingRows && shippingRows.length > 0) {
              t_addr = shippingRows[0].p_adress || t_addr;
              t_agent = shippingRows[0].agent || t_agent;
            }

            await pool.query("RELEASE SAVEPOINT sp_shipping_info", {
              transaction,
            });
          } catch (shippingErr) {
            console.log(" SE_SHIPING_D query failed:", shippingErr.message);
            try {
              await pool.query("ROLLBACK TO SAVEPOINT sp_shipping_info", {
                transaction,
              });
            } catch (e) {
              // Ignore rollback errors
            }
          }

          // Try get agent from function if still null
          if (!t_agent) {
            try {
              await pool.query("SAVEPOINT sp_agent_func", { transaction });

              const agentFunctionSql = `
                SELECT "Customs".GF_SE_SHIPING_AGENT(:factory_code, :se_custid) as agent
              `;

              const agentResult = await pool.query(agentFunctionSql, {
                replacements: {
                  factory_code,
                  se_custid: orderData.se_custid,
                },
                type: pool.QueryTypes.SELECT,
                transaction,
              });

              t_agent = agentResult[0]?.agent || t_agent;

              await pool.query("RELEASE SAVEPOINT sp_agent_func", {
                transaction,
              });
            } catch (agentErr) {
              console.log(" GF_SE_SHIPING_AGENT failed:", agentErr.message);
              try {
                await pool.query("ROLLBACK TO SAVEPOINT sp_agent_func", {
                  transaction,
                });
              } catch (e) {
                throw e;
                // Ignore
              }
            }
          }

          // ========================================
          // STEP 2.3: Get SE_QTY from SD_ORD_ITEM_C
          // ========================================
          let t_seqty = 0;
          try {
            const seQtySql = `
              SELECT SE_QTY
              FROM "pac".SD_ORD_M_C
              WHERE ORG_ID = :factory_code
                AND SE_ID = :se_id
                AND PACK_GU = :pack_gu
                AND SE_SEQ = :se_seq
            `;

            const qtyResult = await pool.query(seQtySql, {
              replacements: {
                factory_code,
                se_id: orderData.se_id,
                pack_gu: orderData.pack_gu,
                se_seq: orderData.se_seq,
              },
              type: pool.QueryTypes.SELECT,
              transaction,
            });

            t_seqty = qtyResult[0]?.se_qty || 0;
          } catch (err) {
            console.warn(" Cannot get SE_QTY:", err.message);
            t_seqty = 0;
          }

          // ========================================
          // STEP 2.4: Calculate P_SHIPQTY (with SAVEPOINT protection)
          // ========================================
          let alreadyPlannedQty = 0;

          try {
            await pool.query("SAVEPOINT sp_planned_qty", { transaction });

            const alreadyPlannedSql = `
              SELECT "Customs".GF_SE_PLAN_SHIPQTY(
                :factory_code, 
                :se_id, 
                :pack_gu, 
                :se_seq
              ) as planned_qty
            `;

            const plannedResult = await pool.query(alreadyPlannedSql, {
              replacements: {
                factory_code,
                se_id: orderData.se_id,
                pack_gu: orderData.pack_gu,
                se_seq: orderData.se_seq.toString(),
              },
              type: pool.QueryTypes.SELECT,
              transaction,
            });

            alreadyPlannedQty = plannedResult[0]?.planned_qty || 0;

            await pool.query("RELEASE SAVEPOINT sp_planned_qty", { transaction });
          } catch (funcErr) {
            console.warn(" GF_SE_PLAN_SHIPQTY failed, using 0:", funcErr.message);
            try {
              await pool.query("ROLLBACK TO SAVEPOINT sp_planned_qty", {
                transaction,
              });
            } catch (e) {
              // Ignore
            }
            alreadyPlannedQty = 0;
          }

          const p_shipqty = t_seqty - alreadyPlannedQty;

          // ========================================
          // STEP 2.5: Insert into SE_PLAN_ORD
          // ========================================
          const insertPlanSql = `
            INSERT INTO "Customs".SE_PLAN_ORD (
              factory_code, SE_ID, SE_VER, PACK_GU, SE_SEQ, SHIP_SEQ,
              P_SHIPDATE, P_SHIPQTY, 
              SEND_ADDR, SEND_TYPE,
              STATUS, EX_STATUS,
              COL5, COL6,
              GRT_USER, GRT_DEPT, LAST_USER, LAST_DATE,
              COLUMN2
            ) VALUES (
              :org_id, :se_id, :se_ver, :pack_gu, :se_seq, :ship_seq,
              :p_shipdate, :p_shipqty,
              :send_addr, :send_type,
              1, '1',
              :col5, :col6,
              :grt_user, :grt_dept, :last_user, NOW(),
              :column2
            )
          `;

          await pool.query(insertPlanSql, {
            replacements: {
              org_id: factory_code,
              se_id: orderData.se_id,
              se_ver: orderData.se_ver,
              pack_gu: orderData.pack_gu,
              se_seq: orderData.se_seq,
              ship_seq: nextShipSeq,
              p_shipdate: plan_date,
              p_shipqty: p_shipqty,
              send_addr: t_addr,
              send_type: orderData.send_mode,
              col5: t_agent,
              col6: t_addr,
              grt_user: user_code,
              grt_dept: department_code,
              last_user: last_user,
              column2: orderData.se_id,
            },
            transaction,
          });

          results.created_plans++;

          // ========================================
          // STEP 2.6: Insert size details into SE_PLAN_SIZE
          // ========================================
          const packSizesSql = `
            SELECT 
              PK_SEQ,
              SIZERUN,
              CTN_PAIRS,
              CTNS,
              CBM
            FROM "pac".SD_PACK_M
            WHERE ORG_ID = :factory_code
              AND SE_ID = :se_id
              AND PACK_GU = :pack_gu
              AND SE_SEQ = :se_seq
          `;

          const packSizes = await pool.query(packSizesSql, {
            replacements: {
              factory_code,
              se_id: orderData.se_id,
              pack_gu: orderData.pack_gu,
              se_seq: orderData.se_seq,
            },
            type: pool.QueryTypes.SELECT,
            transaction,
          });

          let totalCbm = 0;

          for (const sizeRow of packSizes) {
            let sizePlannedQty = 0;

            try {
              const savepointName = `sp_size_${String(sizeRow.pk_seq).replace(/\./g, "_")}`;

              await pool.query(`SAVEPOINT ${savepointName}`, { transaction });

              const sizePlannedSql = `
        SELECT "Customs".GF_SIZE_PLAN_SHIPQTY(
          :factory_code,
          :se_id,
          :pack_gu,
          :se_seq,
          :pk_seq
        ) as size_planned
      `;

              const sizePlannedResult = await pool.query(sizePlannedSql, {
                replacements: {
                  factory_code,
                  se_id: orderData.se_id,
                  pack_gu: parseInt(orderData.pack_gu),
                  se_seq: orderData.se_seq,
                  pk_seq: sizeRow.pk_seq,
                },
                type: pool.QueryTypes.SELECT,
                transaction,
              });

              sizePlannedQty = sizePlannedResult[0]?.size_planned || 0;

              await pool.query(`RELEASE SAVEPOINT ${savepointName}`, {
                transaction,
              });
            } catch (funcErr) {
              console.warn(
                ` GF_SIZE_PLAN_SHIPQTY failed for PK_SEQ ${sizeRow.pk_seq}:`,
                funcErr.message,
              );

              const savepointName = `sp_size_${String(sizeRow.pk_seq).replace(/\./g, "_")}`;
              try {
                await pool.query(`ROLLBACK TO SAVEPOINT ${savepointName}`, {
                  transaction,
                });
              } catch (e) {
                // Ignore
                throw e;
              }
              sizePlannedQty = 0;
            }

            const remainingCtns = (sizeRow.ctns || 0) - sizePlannedQty;

            // Calculate CBM for this size
            if (sizeRow.ctns && sizeRow.ctns !== 0) {
              const cbmPerCtn = sizeRow.cbm / sizeRow.ctns;
              totalCbm += remainingCtns * cbmPerCtn;
            }

            // Insert size detail
            const insertSizeSql = `
              INSERT INTO "Customs".SE_PLAN_SIZE (
                factory_code, SE_ID, SE_VER, PACK_GU, SE_SEQ, SHIP_SEQ,
                PK_SEQ, SIZERUN, CTNS_PAIRS, CTNS
              ) VALUES (
                :org_id, :se_id, :se_ver, :pack_gu, :se_seq, :ship_seq,
                :pk_seq, :sizerun, :ctns_pairs, :ctns
              )
            `;

            await pool.query(insertSizeSql, {
              replacements: {
                org_id: factory_code,
                se_id: orderData.se_id,
                se_ver: orderData.se_ver,
                pack_gu: orderData.pack_gu,
                se_seq: orderData.se_seq,
                ship_seq: nextShipSeq,
                pk_seq: sizeRow.pk_seq,
                sizerun: sizeRow.sizerun,
                ctns_pairs: sizeRow.ctn_pairs,
                ctns: remainingCtns,
              },
              transaction,
            });

            results.created_sizes++;
          }

          // ========================================
          // STEP 2.7: Update CBM in SE_PLAN_ORD
          // ========================================
          const updateCbmSql = `
            UPDATE "Customs".SE_PLAN_ORD
            SET CBM = :cbm
            WHERE factory_code = :org_id
              AND SE_ID = :se_id
              AND SE_SEQ = :se_seq
              AND SHIP_SEQ = :ship_seq
              AND PACK_GU = :pack_gu
          `;

          await pool.query(updateCbmSql, {
            replacements: {
              cbm: totalCbm * 1.03,
              org_id: factory_code,
              se_id: orderData.se_id,
              se_seq: orderData.se_seq,
              ship_seq: nextShipSeq,
              pack_gu: orderData.pack_gu,
            },
            transaction,
          });
        } catch (itemError) {
          const isDuplicateKey =
            itemError.original?.code === "23505" ||
            itemError.code === "23505" ||
            itemError.message?.includes("duplicate key") ||
            itemError.message?.includes("unique constraint");

          results.errors.push({
            se_id: treeItem.col1,
            se_seq: treeItem.seq,
            pack_gu: treeItem.col2,
            error: itemError.message,
            error_code: isDuplicateKey ? "DUPLICATE_KEY" : "UNKNOWN_ERROR",
            detail: itemError.original?.detail || itemError.detail || null,
          });
        }
      }
      // ========================================
      // STEP 3: Clear SY_TREE cache
      // ========================================
      syTreeCache.clearSession(session_id);

      // Commit transaction
      await transaction.commit();
      return {
        success: results.errors.length === 0,
        message:
          results.errors.length > 0
            ? results.errors
                .map((e) =>
                  e.error_code === "DUPLICATE_KEY"
                    ? `Duplicate: ${e.se_id}/${e.se_seq} already exists`
                    : `Error: ${e.se_id}/${e.se_seq} - ${e.error}`,
                )
                .join(", ")
            : `Generated ${results.created_plans} plans successfully`,
        results,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("ERROR in generatePlan:", error);
      throw error;
    }
  }
  async function updatePlanShipDate(factory_code, user_code, filters = {}) {
    const transaction = await pool.transaction();
    console.log("nhin cai filter ne ", filters);

    try {
      const updateSql = `
        UPDATE "Customs".SE_PLAN_ORD T
        SET 
          P_SHIPDATE = M.NLT,
          LAST_USER = :user_code,
          LAST_DATE = NOW()
        FROM "pac".SD_ORD_M M
        WHERE M.org_id = T.FACTORY_CODE
          AND M.SE_ID = T.SE_ID
          AND M.SE_VER = T.SE_VER
          AND M.SE_SEQ = T.SE_SEQ::NUMERIC
          AND M.NLT IS NOT NULL
          AND T.FACTORY_CODE = :factory_code
          AND (DATE(T.P_SHIPDATE) >= DATE(:p_sdate) OR :p_sdate IS NULL)
          AND (DATE(T.P_SHIPDATE) <= DATE(:p_edate) OR :p_edate IS NULL)
          AND (DATE(T.P_EXDATE) >= DATE(:s_sdate) OR :s_sdate IS NULL)
          AND (DATE(T.P_EXDATE) <= DATE(:s_edate) OR :s_edate IS NULL)
          AND (T.SE_ID ILIKE :se_id || '%' OR :se_id IS NULL)
          AND (T.STATUS = :status OR :status IS NULL)
          AND (T.COLUMN1 = :hg_stoc OR :hg_stoc IS NULL)
          AND (T.COL5 ILIKE :agent || '%' OR :agent IS NULL)
          AND (T.EX_STATUS = :ex_status OR :ex_status IS NULL)
      `;
      const result = await pool.query(updateSql, {
        replacements: {
          factory_code,
          user_code,
          p_sdate: filters.s_date_1 || null,
          p_edate: filters.e_date_1 || null,
          s_sdate: filters.s_date_2 || null,
          s_edate: filters.e_date_2 || null,
          se_id: filters.se_id || null,
          status: filters.status || null,
          hg_stoc: filters.hg_stoc || null,
          agent: filters.agent || null,
          ex_status: filters.ex_status || null,
        },
        type: pool.QueryTypes.UPDATE,
        transaction,
      });
      await transaction.commit();
      const affectedRows = result[1]?.rowCount || result[1] || 0;
      return {
        success: true,
        message: `Updated ${affectedRows} records`,
        affected_rows: affectedRows,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  module.exports = {
    listAllSeOrdItem,
    search,
    fetchFieldDropdown,
    checkPlanItem,
    selectAllPlan,
    getPlanSelections,
    clearPlanSession,
    generatePlan,
    updatePlanShipDate,
    fetchPackingSeidDropdown,
  };
