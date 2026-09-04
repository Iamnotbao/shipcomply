const { Op } = require("sequelize");
const pool = require("../../config/db.js");
const FACTORY = require("../factories/factory.model.js");
const AC_ISSUE_M_T = require("./ac_issue_m_t.model.js");

async function listAcIssueM(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };

    let permissionCondition = "1=1";
    let replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
    };

    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }

    const sql = `
      SELECT
        a.factory_code,
        a.conf_seq,
        a.ac_no,
        a.conf_date,
        a.lock_date,
        a.lock_seq,
        a.acbom_no,
        a.col1,
        a.col2,
        a.col3,
        a.col4,
        a.col5,
        a.ac_shoeid,
        a.money,
        a.prod_money,
        a.percent,
        a.status,
        a.grt_dept,
        a.grt_user,
        a.grt_date,
        a.last_user,
        a.last_date,
        a.locked_information,
        "Customs".gf_chgid_chgno(a.factory_code, a.ac_no)                                          AS chg_no,
        "Customs".gf_chgid_contno(a.factory_code, a.ac_no)                                         AS cont_no,
        "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)                                         AS ac_date,
        "Customs".gf_code_name(a.factory_code, 'ACTYPE', "Customs".gf_chgid_actype(a.factory_code, a.ac_no), :p_charset) AS ac_typename,
        "Customs".gf_ac_yearno(a.factory_code, a.conf_seq)                                         AS year_no,
        'CHT' || SUBSTR(TO_CHAR(a.lock_date, 'YYYY'), 3) || '/' || a.lock_seq                      AS issue_seq,
        b.ac_chgs || '/' || a.col3                                                                  AS chgs_col3,
        b.old_no,
        b.d_type                                                                                     AS out_dtype,
        CASE a.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name
      FROM "Customs".ac_issue_m_t a
      LEFT JOIN "Customs".vw_chg_exp b
        ON a.factory_code = b.factory_code AND a.ac_no = b.ac_no
      WHERE a.factory_code = :factory_code
        AND ${permissionCondition}
      ORDER BY a.conf_seq
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
    console.error("Error fetching AC_ISSUE_M list:", error);
    throw error;
  }
}
async function listAllForExcelDetail({
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
} = {}) {
  const charset = { vi: "S", en: "E", zh: "T" };
  const p_charset = charset[language] || "E";
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code || null,
    p_charset,
    s_chgno: filters?.s_chgno || null,
    cont_no: filters?.cont_no || null,
    s_date: filters?.s_date || null,
    e_date: filters?.e_date || null,
    s_cdate: filters?.s_cdate || null,
    e_cdate: filters?.e_cdate || null,
    s_chgs: filters?.s_chgs || null,
    e_chgs: filters?.e_chgs || null,
    status: filters?.status ?? null,
    se_id: filters?.se_id || null,
    ship_seq: filters?.ship_seq || null,
  };

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "P.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "P.grt_dept = :permission_dept AND P.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "P.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }

  const sql = `
    SELECT
      P.conf_seq,
      P.ac_no,
      P.col3 AS y_seq,
      "Customs".GF_CHGID_CHGNO(P.factory_code, P.ac_no) AS chg_no,
      "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no) AS ac_date,
      C.src,
      C.in_acno,
      C.prod_no,
      C.matd_no,
      C.unit_qty,
      COALESCE(C.loss_per, 0) AS loss_per,
      COALESCE(C.qty, 0) AS qty,
      COALESCE(C.pairs, 0) AS pairs,
      C.price,
      C.matd_seq,
      C.issue_seq,
      -- IN_CHGNO: DECODE(SRC, 0='', 1=GF_CHGID_CHGNO, 9=GF_MVCHGID_CHGNO)
      CASE C.src
        WHEN '0' THEN ''
        WHEN '1' THEN "Customs".GF_CHGID_CHGNO(C.factory_code, C.in_acno)
        WHEN '9' THEN "Customs".GF_MVCHGID_CHGNO(C.factory_code, C.in_acno)
      END AS in_chgno,
      -- D_YEAR: ngày nhập của tờ khai nhập
    TO_CHAR("Customs".GF_CHGID_ACDATE(C.factory_code, C.in_acno), 'YYYY/MM/DD') AS d_year,
      -- NEW_UNIT_QTY: unit qty từ BOM
      "Customs".GF_BOM_UNIT_QTY(C.factory_code, C.prod_no, C.matd_no) AS new_unit_qty,
      -- SIZE_DESC: mô tả size sản phẩm
      "Customs".GF_AC_PROD_NOTE(C.factory_code, C.prod_no) AS size_desc,
      -- PROD_NAME: tên sản phẩm hải quan
      (
        SELECT "Customs".GF_AC_PRODNAME(m.factory_code, m.customs_shoe_id, :p_charset)
        FROM "Customs".ac_prod_m m
        WHERE m.factory_code = C.factory_code
          AND m.prod_acno = C.prod_no
        LIMIT 1
      ) AS prod_name,
      -- BOM_LOSS_PER: loss từ BOM
      COALESCE((
        SELECT loss_per
        FROM "Customs".ac_bom_m
        WHERE factory_code = C.factory_code
          AND prod_acno = C.prod_no
          AND item_acno = C.matd_no
        LIMIT 1
      ), 0) AS bom_loss_per,
      -- T_CHGS + T_INTYPE: nếu AC_PROC_M.MARK='B' thì dùng COM_INVOICE / 'Local VAT'
      --                     không thì dùng VW_PROC_CHG.AC_CHGS / GF_CODE_NAME ACTYPE
      CASE
        WHEN (
          SELECT mark FROM "Customs".ac_proc_m
          WHERE factory_code = C.factory_code AND ac_no = C.in_acno
          LIMIT 1
        ) = 'B'
        THEN (
          SELECT com_invoice FROM "Customs".ac_proc_m
          WHERE factory_code = C.factory_code AND ac_no = C.in_acno
          LIMIT 1
        )
        ELSE (
          SELECT ac_chgs FROM "Customs".vw_proc_chg
          WHERE factory_code = C.factory_code AND ac_no = C.in_acno
          LIMIT 1
        )
      END AS t_chgs,
      CASE
        WHEN (
          SELECT mark FROM "Customs".ac_proc_m
          WHERE factory_code = C.factory_code AND ac_no = C.in_acno
          LIMIT 1
        ) = 'B'
        THEN 'Local VAT'
        ELSE (
          SELECT "Customs".GF_CODE_NAME(factory_code, 'ACTYPE', ac_type, :p_charset)
          FROM "Customs".vw_proc_chg
          WHERE factory_code = C.factory_code AND ac_no = C.in_acno
          LIMIT 1
        )
      END AS t_intype
    FROM "Customs".ac_issue_m_t P
    JOIN "Customs".ac_chk_t C
      ON C.factory_code = P.factory_code
      AND C.conf_seq = P.conf_seq
    WHERE ${permissionCondition}
      AND P.factory_code = :factory_code
      AND (:s_chgno IS NULL OR "Customs".GF_CHGID_CHGNO(P.factory_code, P.ac_no) LIKE :s_chgno || '%')
      AND (:cont_no IS NULL OR "Customs".GF_CHGID_CONTNO(P.factory_code, P.ac_no) LIKE :cont_no || '%')
      AND (:s_date IS NULL OR DATE_TRUNC('day', "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no)) >= DATE_TRUNC('day', :s_date::timestamp))
      AND (:e_date IS NULL OR DATE_TRUNC('day', "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no)) <= DATE_TRUNC('day', :e_date::timestamp))
      AND (:s_cdate IS NULL OR DATE_TRUNC('day', P.col4) >= DATE_TRUNC('day', :s_cdate::timestamp))
      AND (:e_cdate IS NULL OR DATE_TRUNC('day', P.col4) <= DATE_TRUNC('day', :e_cdate::timestamp))
      AND (:s_chgs IS NULL OR P.col3 >= :s_chgs)
      AND (:e_chgs IS NULL OR P.col3 <= :e_chgs)
      AND (:status IS NULL OR P.status = :status)
      AND (
        (:se_id IS NULL AND :ship_seq IS NULL)
        OR P.ac_no IN (
          SELECT ac_no FROM "Customs".ac_plan_ord
          WHERE factory_code = :factory_code
            AND se_id LIKE :se_id || '%'
            AND (:ship_seq IS NULL OR ship_seq = :ship_seq)
        )
      )
    ORDER BY P.ac_no, P.conf_seq, C.matd_seq, C.issue_seq
  `;

  const rows = await pool.query(sql, {
    replacements,
    type: pool.QueryTypes.SELECT,
  });

  return rows;
}
async function listAllForExcelSummary({
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
} = {}) {
  const charset = { vi: "S", en: "E", zh: "T" };
  const p_charset = charset[language] || "E";
  let permissionCondition = "1=1";
  let replacements = {
    factory_code: factory_code || null,
    p_charset: p_charset || "E",
    s_chgno: filters?.s_chgno || null,
    cont_no: filters?.cont_no || null,
    s_date: filters?.s_date || null,
    e_date: filters?.e_date || null,
    s_cdate: filters?.s_cdate || null,
    e_cdate: filters?.e_cdate || null,
    s_chgs: filters?.s_chgs || null,
    e_chgs: filters?.e_chgs || null,
    status: filters?.status ?? null,
    se_id: filters?.se_id || null,
    ship_seq: filters?.ship_seq || null,
  };
  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      permissionCondition = "P.factory_code = :permission_factory";
      replacements.permission_factory = factory_code;
    } else if (query_level === "2" && department_code && factory_code) {
      permissionCondition =
        "P.grt_dept = :permission_dept AND P.factory_code = :permission_factory";
      replacements.permission_dept = department_code;
      replacements.permission_factory = factory_code;
    } else if (query_level === "3" && user_code) {
      permissionCondition = "P.grt_user = :permission_user";
      replacements.permission_user = user_code;
    }
  }
  const sql = `
    SELECT
      P.factory_code,
      P.conf_seq,
      P.ac_no,
      "Customs".GF_CHGID_CHGNO(P.factory_code, P.ac_no) AS chg_no,
      "Customs".GF_AC_YEARNO(P.factory_code, P.conf_seq) AS year_no,
      "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no) AS ac_date,
      P.conf_date,
      P.acbom_no,
      P.lock_seq,
      CASE P.status
        WHEN 9 THEN 'Locked'
        WHEN 7 THEN 'Confirmed'
        WHEN 0 THEN 'Canceled'
      END AS status,
      (
        SELECT MIN(matd.prod_no)
        FROM "Customs".ac_issue_matd_t matd
        WHERE matd.factory_code = P.factory_code
          AND matd.conf_seq = P.conf_seq
      ) AS min_prod_no,
      (
        SELECT "Customs".GF_ACPROD_NAME(P.factory_code, MIN(matd.prod_no), :p_charset)
        FROM "Customs".ac_issue_matd_t matd
        WHERE matd.factory_code = P.factory_code
          AND matd.conf_seq = P.conf_seq
      ) AS prod_name,
      (
        SELECT MAX(matd.prod_no)
        FROM "Customs".ac_issue_matd_t matd
        WHERE matd.factory_code = P.factory_code
          AND matd.conf_seq = P.conf_seq
      ) AS max_prod_no,
      (
        SELECT STRING_AGG(DISTINCT ord.se_id, ' ; ' ORDER BY ord.se_id)
        FROM "Customs".ac_plan_ord ord
        WHERE ord.factory_code = P.factory_code
          AND ord.ac_no = P.ac_no
      ) AS se_id_list
    FROM "Customs".ac_issue_m_t P
    WHERE P.factory_code = :factory_code
      AND (:s_chgno IS NULL OR "Customs".GF_CHGID_CHGNO(P.factory_code, P.ac_no) LIKE :s_chgno || '%')
      AND (:cont_no IS NULL OR "Customs".GF_CHGID_CONTNO(P.factory_code, P.ac_no) LIKE :cont_no || '%')
      AND (:s_date IS NULL OR DATE_TRUNC('day', "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no)) >= DATE_TRUNC('day', :s_date::timestamp))
      AND (:e_date IS NULL OR DATE_TRUNC('day', "Customs".GF_CHGID_ACDATE(P.factory_code, P.ac_no)) <= DATE_TRUNC('day', :e_date::timestamp))
      AND (:s_cdate IS NULL OR DATE_TRUNC('day', P.col4) >= DATE_TRUNC('day', :s_cdate::timestamp))
      AND (:e_cdate IS NULL OR DATE_TRUNC('day', P.col4) <= DATE_TRUNC('day', :e_cdate::timestamp))
      AND (:s_chgs IS NULL OR P.col3 >= :s_chgs)
      AND (:e_chgs IS NULL OR P.col3 <= :e_chgs)
      AND (:status IS NULL OR P.status = :status)
      AND (
        (:se_id IS NULL AND :ship_seq IS NULL)
        OR P.ac_no IN (
          SELECT ac_no FROM "Customs".ac_plan_ord
          WHERE factory_code = :factory_code
            AND se_id LIKE :se_id || '%'
            AND (:ship_seq IS NULL OR ship_seq = :ship_seq)
        )
      )
    ORDER BY COALESCE(P.lock_seq, P.conf_seq)
  `;

  const rows = await pool.query(sql, {
    replacements: replacements,
    type: pool.QueryTypes.SELECT,
  });

  return rows;
}
// ============================================
// F3: CONFIRM 確認核銷
// Status AC_ISSUE_M_T = 9 và AC_CHK_T = 9
// được xử lý BÊN TRONG GF_OUTCHGE_INCHGE khi P_MARK = 9
// ============================================
async function active(factory_code, user_code, conf_seq, language) {
  const transaction = await pool.transaction();
  try {
    // 1. Kiểm tra export declaration status = 7 (đã activate)
    const checkExpSql = `
      SELECT status, pass_date
      FROM "Customs".vw_chg_exp
      WHERE factory_code = :factory_code
        AND ac_no = (
          SELECT ac_no
          FROM "Customs".ac_issue_m_t
          WHERE factory_code = :factory_code
            AND conf_seq = :conf_seq
          LIMIT 1
        )
    `;
    const expResult = await pool.query(checkExpSql, {
      replacements: { factory_code, conf_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const v_status = expResult.length ? expResult[0].status : 1;
    if (v_status !== 7) {
      throw new Error("出口報關單狀態為生效時,才能做核銷!");
    }

    // 2. Kiểm tra AC_CHK_T.QTY == AC_ISSUE_MATD_T.ISSUE_QTY cho từng vật liệu
    const matdListSql = `
      SELECT *
      FROM "Customs".ac_issue_matd_t
      WHERE factory_code = :factory_code
        AND conf_seq = :conf_seq
    `;
    const matdList = await pool.query(matdListSql, {
      replacements: { factory_code, conf_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const mismatchList = [];
    for (const item of matdList) {
      const chkQtySql = `
        SELECT COALESCE(SUM(qty), 0) AS chk_qty
        FROM "Customs".ac_chk_t
        WHERE factory_code = :factory_code
          AND conf_seq = :conf_seq
          AND matd_seq = :matd_seq
          AND matd_no = :matd_no
      `;
      const chkResult = await pool.query(chkQtySql, {
        replacements: {
          factory_code,
          conf_seq,
          matd_seq: item.matd_seq,
          matd_no: item.matd_no,
        },
        type: pool.QueryTypes.SELECT,
        transaction,
      });

      const chkQty = parseFloat(chkResult[0].chk_qty);
      const issueQty = parseFloat(item.issue_qty);
      if (chkQty !== issueQty) {
        mismatchList.push(`${item.matd_no}`);
      }
    }

    if (mismatchList.length > 0) {
      const message = await gf_mesgnm(500112, language);
      throw new Error(`${message} ${mismatchList.join("; ")}`);
    }

    // 3. Kiểm tra không có CONF_SEQ nhỏ hơn chưa confirm (status = 7)
    const checkSeqSql = `
      SELECT COUNT(1) AS cnt
      FROM "Customs".ac_issue_m_t
      WHERE factory_code = :factory_code
        AND conf_seq < :conf_seq
        AND status = 7
    `;
    const seqResult = await pool.query(checkSeqSql, {
      replacements: { factory_code, conf_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (parseInt(seqResult[0].cnt) > 0) {
      const message = await gf_mesgnm(500104, language);
      throw new Error(message);
    }

    // 4. Gọi GF_OUTCHGE_INCHGE mode 9 = confirm chính thức
    // Function này tự xử lý:
    // - Tính OVER_QTY, MONEY, PRICE cho AC_CHK_T
    // - Trừ OVER_QTY trong AC_CHG_D / AC_PROC_D
    // - Update AC_ISSUE_M_T: STATUS = 9, LOCK_SEQ, LOCK_DATE
    // - Update AC_CHK_T: STATUS = 9
    const calcSql = `
      SELECT "Customs".GF_OUTCHGE_INCHGE(:factory_code, :conf_seq, 9, :user_code) AS result
    `;
    const calcResult = await pool.query(calcSql, {
      replacements: { factory_code, conf_seq, user_code },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const t_mesg2 = calcResult[0]?.result || null;

    // 進口料件數量不足時,提示無法核銷
    if (t_mesg2) {
      const message = await gf_mesgnm(500027, language);
      await transaction.rollback();
      throw new Error(`${message} ${t_mesg2}`);
    }

    // 5. Update AC_CHG_M hoặc AC_PROC_M status = 99 nếu hết over_qty
    const chkDistinctSql = `
      SELECT DISTINCT in_acno, src
      FROM "Customs".ac_chk_t
      WHERE factory_code = :factory_code
        AND conf_seq = :conf_seq
        AND src::INTEGER >= 1
    `;
    const chkDistinct = await pool.query(chkDistinctSql, {
      replacements: { factory_code, conf_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of chkDistinct) {
      if (row.src === "1") {
        const countResult = await pool.query(
          `SELECT COUNT(*) AS cnt
           FROM "Customs".ac_chg_d
           WHERE factory_code = :factory_code
             AND ac_no = :in_acno
             AND COALESCE(over_qty, 0) > 0`,
          {
            replacements: { factory_code, in_acno: row.in_acno },
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );
        if (parseInt(countResult[0].cnt) === 0) {
          await pool.query(
            `UPDATE "Customs".ac_chg_m
             SET status = 99, complete_type = '1'
             WHERE factory_code = :factory_code AND ac_no = :in_acno`,
            {
              replacements: { factory_code, in_acno: row.in_acno },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      } else if (row.src === "9") {
        const countResult = await pool.query(
          `SELECT COUNT(*) AS cnt
           FROM "Customs".ac_proc_d
           WHERE factory_code = :factory_code
             AND ac_no = :in_acno
             AND COALESCE(over_qty, 0) > 0`,
          {
            replacements: { factory_code, in_acno: row.in_acno },
            type: pool.QueryTypes.SELECT,
            transaction,
          },
        );
        if (parseInt(countResult[0].cnt) === 0) {
          await pool.query(
            `UPDATE "Customs".ac_proc_m
             SET status = 99, complete_type = '1'
             WHERE factory_code = :factory_code AND ac_no = :in_acno`,
            {
              replacements: { factory_code, in_acno: row.in_acno },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      }
    }

    await transaction.commit();
    return { success: true, message: "確認核銷 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in confirm AC_ISSUE_M:", error);
    throw error;
  }
}
async function fetchInvoiceDropdown(factory_code, page, limit, search) {
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
      SELECT DISTINCT invoice_no
      FROM "Customs".AC_ISSUE_M_T
      WHERE factory_code = :factory_code
      AND ${permissionCondition} 
      ${searchCondition}
      ORDER BY invoice_no
    `;
  const countSql = `
         SELECT COUNT(DISTINCT invoice_no) AS total
         FROM "Customs".AC_ISSUE_M_T
        WHERE 
        factory_code = :factory_code
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
async function getPackingSeidByInvoice(factory_code, invoice_no) {
  try {
    const sql = `
  SELECT COUNT(*) AS n, MIN(sub.ori_se_id) AS packing_seid
  FROM (
    SELECT DISTINCT sd.ori_se_id
    FROM "Customs".ac_plan_ord ac
    JOIN "pac".sd_ord_m_c sd
      ON ac.factory_code = sd.org_id
     AND ac.se_id        = sd.se_id
    JOIN "Customs".AC_ISSUE_M_T inv
      ON ac.factory_code = inv.factory_code
     AND ac.ac_no        = inv.ac_no
    WHERE inv.factory_code = :factory_code
      AND inv.invoice_no   = :invoice_no
  ) sub
`;
    const result = await pool.query(sql, {
      replacements: { factory_code, invoice_no },
      type: pool.QueryTypes.SELECT,
    });

    let packing_seid = result[0]?.packing_seid || "";
    const n = parseInt(result[0]?.n) || 0;

    // N > 1 → lấy 4 ký tự đầu của invoice_no (giống IF N>1 trong Oracle)
    if (n > 1) {
      packing_seid = invoice_no.substring(0, 4);
    }
    return packing_seid;
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
async function updateInvoiceDate(factory_code, ac_no, invoice_id, user_code) {
  try {
    const sql = `
      UPDATE "Customs".AC_ISSUE_M_T m
      SET
        invoice_date = (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = m.factory_code
            AND ac_no = m.ac_no
        ),
        last_user = :last_user,
        last_date = NOW()
      WHERE factory_code = :factory_code
        AND ac_no        = :ac_no
        AND invoice_id   = :invoice_id
        AND status       = 1
        AND EXISTS (
          SELECT out_date
          FROM "Customs".ac_chg_m
          WHERE factory_code = m.factory_code
            AND ac_no = m.ac_no
        )
    `;

    await pool.query(sql, {
      replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
      type: pool.QueryTypes.UPDATE,
    });

    const result = await pool.query(
      `SELECT invoice_date
       FROM "Customs".AC_ISSUE_M_T
       WHERE factory_code = :factory_code
         AND ac_no = :ac_no
         AND invoice_id = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      message: "Invoice date synced successfully",
    };
  } catch (error) {
    console.error("Error syncing invoice date:", error);
    throw error;
  }
}
async function updateHsCode(factory_code, ac_no, invoice_id, user_code) {
  try {
    // Lấy danh sách AC_PROD từ các bảng join
    const result = await pool.query(
      `SELECT DISTINCT c.customs_shoe_id
       FROM "Customs".ac_plan_ord a
       JOIN "pac".sd_ord_m_c b
         ON a.factory_code = b.org_id
        AND a.se_id = b.se_id
        AND a.se_seq = b.se_seq::TEXT
       JOIN "Customs".ac_shoe_ref d
         ON d.factory_code = b.org_id
        AND d.prod_no = b.prod_no
       JOIN "Customs".ac_shoe_m c
         ON c.factory_code = d.factory_code
        AND c.customs_shoe_id = d.customs_shoe_id
       WHERE c.status <> 0
         AND a.factory_code = :factory_code
         AND a.ac_no = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    // Ghép ac_prod lại giống Oracle LOOP, tổng <= 200 ký tự
    let v = null;
    for (const row of result) {
      const prod = row.ac_prod;
      if (!v) {
        v = prod;
      } else {
        if ((v + "/" + prod).length <= 200) {
          v = v + "/" + prod;
        }
      }
    }

    const hs_code = v ? `"W" ${v}` : null;

    // Update hs_code vào AC_ISSUE_M_T
    await pool.query(
      `UPDATE "Customs".AC_ISSUE_M_T
       SET hs_code   = :hs_code,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id
         AND status       = 1`,
      {
        replacements: {
          factory_code,
          ac_no,
          invoice_id,
          hs_code,
          last_user: user_code,
        },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return {
      success: true,
      message: "HS Code fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching HS Code:", error);
    throw error;
  }
}
async function updateNwGw(factory_code, ac_no, invoice_id, user_code) {
  try {
    // 1. Lấy MAX pk_seq
    const seqResult = await pool.query(
      `SELECT MAX(pk_seq) AS v_seq
       FROM "Customs".se_inv_d
       WHERE factory_code = :factory_code
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );
    const v_seq = parseInt(seqResult?.[0]?.v_seq) || 0;
    if (v_seq === 0) return { success: false, message: "No data in SE_INV_D" };

    // 2. Loop AC_PLAN_ORD
    const planRows = await pool.query(
      `SELECT factory_code, se_id, se_seq, pack_gu
       FROM "Customs".ac_plan_ord
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no`,
      {
        replacements: { factory_code, ac_no },
        type: pool.QueryTypes.SELECT,
      },
    );

    for (const w of planRows) {
      for (let x = 1; x <= v_seq; x++) {
        // 3. Lấy danh sách SD_PACK_D join SD_ORD_ITEM_C
        const packDRows = await pool.query(
          `SELECT m.se_id, k.prod_no, m.pk_seq, m.size_no, m.pairs,m.nw
           FROM "pac".sd_pack_d m
           JOIN "pac".sd_ord_m_c k
             ON m.org_id   = k.org_id
            AND m.se_id    = k.se_id
            AND m.se_seq   = k.se_seq
            AND m.pack_gu  = k.pack_gu
           WHERE m.org_id  = :org_id
             AND m.se_id   = :se_id
             AND m.pack_gu = :pack_gu
             AND m.se_seq  = :se_seq
             AND m.pk_seq  = :pk_seq`,
          {
            replacements: {
              org_id: w.factory_code,
              se_id: w.se_id,
              pack_gu: parseInt(w.pack_gu),
              se_seq: w.se_seq,
              pk_seq: x,
            },
            type: pool.QueryTypes.SELECT,
          },
        );

        // 4. Tính V_NWT = sum NW * pairs từ AC_CUST_SIZE
        let v_nwt = 0;
        for (const j of packDRows) {
          let v_nw = 0;
          const custSizeResult = await pool.query(
            `SELECT nw * :pairs AS nw_pairs
             FROM "pac".sd_pack_d
             WHERE factory_code = :factory_code
               AND prod_no      = :prod_no
               AND size_no      = :size_no`,
            {
              replacements: {
                factory_code,
                prod_no: j.prod_no,
                size_no: j.size_no,
                pairs: j.pairs,
              },
              type: pool.QueryTypes.SELECT,
            },
          );
          v_nw = parseFloat(custSizeResult?.[0]?.nw_pairs) || 0;
          v_nwt += Math.round(v_nw * 100) / 100;
        }

        // 5. Lấy V_GW từ SD_PACK_M join mm_item
        let v_gw = 0;
        const packMResult = await pool.query(
          `SELECT ROUND(COALESCE(b.sap_nw, 0), 2) AS v_gw
           FROM "pac".sd_pack_m a
           JOIN "public".mm_item b
             ON a.org_id   = b.org_id
            AND a.item_no  = b.item_no
           WHERE a.org_id  = :org_id
             AND a.se_id   = :se_id
             AND a.pack_gu = :pack_gu
             AND a.se_seq  = :se_seq
             AND a.pk_seq  = :pk_seq`,
          {
            replacements: {
              org_id: w.factory_code,
              se_id: w.se_id,
              pack_gu: parseInt(w.pack_gu),
              se_seq: w.se_seq,
              pk_seq: x,
            },
            type: pool.QueryTypes.SELECT,
          },
        );
        v_gw = parseFloat(packMResult?.[0]?.v_gw) || 0;

        // 6. Update SE_INV_D
        await pool.query(
          `UPDATE "Customs".se_inv_d
           SET net_weight   = ROUND(:v_nwt * ctns, 2),
               gross_weight = ROUND((:v_nwt + :v_gw) * ctns, 2)
           WHERE factory_code = :factory_code
             AND ac_no        = :ac_no
             AND invoice_id   = :invoice_id
             AND se_id        = :se_id
             AND se_seq       = :se_seq
             AND pk_seq       = :pk_seq`,
          {
            replacements: {
              factory_code,
              ac_no,
              invoice_id,
              se_id: w.se_id,
              se_seq: w.se_seq,
              pk_seq: x,
              v_nwt,
              v_gw,
            },
            type: pool.QueryTypes.UPDATE,
          },
        );
      }
    }

    // 7. Tính tổng NW/GW update lên AC_ISSUE_M_T
    const totalResult = await pool.query(
      `SELECT ROUND(SUM(COALESCE(net_weight, 0)), 2)   AS m_nw,
              ROUND(SUM(COALESCE(gross_weight, 0)), 2) AS m_gw
       FROM "Customs".se_inv_d
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id },
        type: pool.QueryTypes.SELECT,
      },
    );

    const m_nw = totalResult?.[0]?.m_nw || 0;
    const m_gw = totalResult?.[0]?.m_gw || 0;

    await pool.query(
      `UPDATE "Customs".AC_ISSUE_M_T
       SET nw        = :m_nw,
           gw        = :m_gw,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: {
          factory_code,
          ac_no,
          invoice_id,
          m_nw,
          m_gw,
          last_user: user_code,
        },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, m_nw, m_gw, message: "NW/GW updated successfully" };
  } catch (error) {
    console.error("Error updating NW/GW:", error);
    throw error;
  }
}

async function cancelActive(factory_code, ac_no, invoice_id, user_code) {
  try {
    await pool.query(
      `UPDATE "Customs".AC_ISSUE_M_T
       SET status    = 1,
           last_user = :last_user,
           last_date = NOW()
       WHERE factory_code = :factory_code
         AND ac_no        = :ac_no
         AND invoice_id   = :invoice_id`,
      {
        replacements: { factory_code, ac_no, invoice_id, last_user: user_code },
        type: pool.QueryTypes.UPDATE,
      },
    );

    return { success: true, message: "Invoice unconfirmed successfully" };
  } catch (error) {
    console.error("Error unconfirming AC_ISSUE_M_T:", error);
    throw error;
  }
}
// ============================================
// F5: REVERT 核銷復原
// ============================================
async function voidAll(factory_code, user_code, conf_seq, lock_seq, language) {
  const transaction = await pool.transaction();
  try {
    // 1. Kiểm tra có LOCK_SEQ lớn hơn đã confirm (status = 9) không
    const checkLockSql = `
      SELECT COUNT(1) AS cnt
      FROM "Customs".ac_issue_m_t
      WHERE factory_code = :factory_code
        AND lock_seq > :lock_seq
        AND status = 9
    `;
    const lockResult = await pool.query(checkLockSql, {
      replacements: { factory_code, lock_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    if (parseInt(lockResult[0].cnt) > 0) {
      const message = await gf_mesgnm(500110, language);
      throw new Error(message);
    }

    // 2. Gọi GF_INIT_ISSUE - hoàn nguyên核銷
    const initSql = `
      SELECT "Customs".GF_INIT_ISSUE(:factory_code, :conf_seq, :user_code) AS result
    `;
    await pool.query(initSql, {
      replacements: { factory_code, conf_seq, user_code },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    // 3. Hoàn nguyên trạng thái AC_CHG_M hoặc AC_PROC_M từ 99 về 7
    const chkDistinctSql = `
      SELECT DISTINCT in_acno, src
      FROM "Customs".ac_chk_t
      WHERE factory_code = :factory_code
        AND conf_seq = :conf_seq
        AND src::INTEGER >= 1
    `;
    const chkDistinct = await pool.query(chkDistinctSql, {
      replacements: { factory_code, conf_seq },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    for (const row of chkDistinct) {
      if (row.src === "1") {
        // Import declaration - kiểm tra còn over_qty không
        const countSql = `
          SELECT COUNT(1) AS cnt
          FROM "Customs".ac_chg_d
          WHERE factory_code = :factory_code
            AND ac_no = :in_acno
            AND COALESCE(over_qty, 0) > 0
        `;
        const countResult = await pool.query(countSql, {
          replacements: { factory_code, in_acno: row.in_acno },
          type: pool.QueryTypes.SELECT,
          transaction,
        });

        // Nếu còn over_qty thì hoàn nguyên status 99 -> 7
        if (parseInt(countResult[0].cnt) !== 0) {
          await pool.query(
            `UPDATE "Customs".ac_chg_m
             SET status = 7,
                 complete_type = NULL
             WHERE factory_code = :factory_code
               AND ac_no = :in_acno
               AND status = 99`,
            {
              replacements: { factory_code, in_acno: row.in_acno },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      } else if (row.src === "9") {
        // Process declaration - kiểm tra còn over_qty không
        const countSql = `
          SELECT COUNT(1) AS cnt
          FROM "Customs".ac_proc_d
          WHERE factory_code = :factory_code
            AND ac_no = :in_acno
            AND COALESCE(over_qty, 0) > 0
        `;
        const countResult = await pool.query(countSql, {
          replacements: { factory_code, in_acno: row.in_acno },
          type: pool.QueryTypes.SELECT,
          transaction,
        });

        // Nếu còn over_qty thì hoàn nguyên status 99 -> 7
        if (parseInt(countResult[0].cnt) !== 0) {
          await pool.query(
            `UPDATE "Customs".ac_proc_m
             SET status = 7,
                 complete_type = NULL
             WHERE factory_code = :factory_code
               AND ac_no = :in_acno
               AND status = 99`,
            {
              replacements: { factory_code, in_acno: row.in_acno },
              type: pool.QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      }
    }

    await transaction.commit();
    return { success: true, message: "核銷復原 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in revert AC_ISSUE_M:", error);
    throw error;
  }
}
// ============================================
// F4: CALCULATE 核銷試算
// ============================================
async function calculate(factory_code, user_code, conf_seq, language) {
  const transaction = await pool.transaction();
  try {
    // Gọi GF_OUTCHGE_INCHGE mode 1 = trial calculation (試算)
    const calcSql = `
      SELECT "Customs".GF_OUTCHGE_INCHGE(:factory_code, :conf_seq, 1, :user_code) AS result
    `;
    const calcResult = await pool.query(calcSql, {
      replacements: { factory_code, conf_seq, user_code },
      type: pool.QueryTypes.SELECT,
      transaction,
    });

    const t_mesg = calcResult[0]?.result || null;
    // Nếu có lỗi thì rollback
    if (t_mesg) {
      await transaction.rollback();
      throw new Error(t_mesg);
    }
    await transaction.commit();
    return { success: true, message: "核銷試算 thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in calculate AC_ISSUE_M:", error);
    throw error;
  }
}
function checkPermission(
  factory_code,
  department_code,
  user_code,
  query_level,
  tableAlias = "a",
) {
  const conditions = [];
  const replacements = {};

  if (factory_code) {
    conditions.push(`${tableAlias}.factory_code = :permission_factory_code`);
    replacements.permission_factory_code = factory_code;
  }

  if (query_level === "2" && department_code) {
    conditions.push(`${tableAlias}.grt_dept = :permission_dept`);
    replacements.permission_dept = department_code;
  }

  if (query_level === "3" && user_code) {
    conditions.push(`${tableAlias}.grt_user = :permission_user`);
    replacements.permission_user = user_code;
  }

  return {
    whereClause: conditions.length > 0 ? "AND " + conditions.join(" AND ") : "",
    replacements,
  };
}
async function getByID(factory_code, conf_seq) {
  const acImp = await AC_ISSUE_M_T.findOne({
    where: {
      factory_code: factory_code,
      conf_seq: conf_seq,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No import material tracking found!");
    return null;
  }
  return acImp;
}
async function getPosition(pageSize, t, permission = {}, conf_seq) {
  try {
    const { whereClause, replacements: permReplacements } = permission;
    const result = await pool.query(
      `
      WITH ranked AS (
        SELECT 
          a.conf_seq,
          ROW_NUMBER() OVER (ORDER BY a.conf_seq, a.ac_no) - 1 AS position
        FROM "Customs".AC_ISSUE_M_T a
        WHERE 1=1 ${whereClause}
      )
      SELECT position
      FROM ranked
      WHERE conf_seq = :conf_seq
      `,
      {
        replacements: { ...permReplacements, conf_seq },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      },
    );

    const position = parseInt(result[0]?.position ?? 0);
    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return { position, size, page, offset };
  } catch (error) {
    console.log("Cannot calculate position", error);
    throw error;
  }
}
async function add(
  factory_code,
  department_code,
  user_code,
  query_level,
  seShipingM,
  pageSize,
  t,
) {
  try {
    const addItemM = await AC_ISSUE_M_T.create(seShipingM, { transaction: t });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      pageSize,
      t,
      permission,
      addItemM.conf_seq,
    );
    return { data: addItemM, ...positionInfo };
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
    throw error;
  }
}

async function edit(
  factory_code,
  department_code,
  user_code,
  query_level,
  existAcInmM,
  editAcInmM,
  pageSize,
  t,
) {
  try {
    const editAIM = await existAcInmM.update(editAcInmM, { transaction: t });
    const permission = checkPermission(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const positionInfo = await getPosition(
      pageSize,
      t,
      permission,
      editAIM.conf_seq,
      editAIM.ac_no,
    );
    return { data: editAIM, ...positionInfo };
  } catch (error) {
    console.log("Cannot edit ac item m from db", error);
    throw error;
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
  department_code,
  user_code,
  query_level,
  language,
  filters,
  limit,
  offset,
) {
  try {
    const charset = { vi: "S", zh: "T", en: "E" };
    let permissionCondition = "1=1";
    const replacements = {
      factory_code: factory_code || null,
      p_charset: charset[language] || "E",
      limit: parseInt(limit) + 1,
      offset: parseInt(offset),
      s_chgno: filters.s_chgno || null,
      cont_no: filters.cont_no || null,
      s_date_1: filters.s_date_1 || null,
      e_date_1: filters.e_date_1 || null,
      s_date_2: filters.s_date_2 || null,
      e_date_2: filters.e_date_2 || null,
      s_chgs: filters.s_chgs || null,
      e_chgs: filters.e_chgs || null,
      status: filters.status ?? null,
      se_id: filters.se_id || null,
      ship_seq: filters.ship_seq || null,
      permission_dept: query_level === "2" ? department_code : null,
      permission_user: query_level === "3" ? user_code : null,
    };
    
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        permissionCondition = "a.factory_code = :permission_factory";
        replacements.permission_factory = factory_code;
      } else if (query_level === "2" && department_code && factory_code) {
        permissionCondition =
          "a.grt_dept = :permission_dept AND a.factory_code = :permission_factory";
        replacements.permission_dept = department_code;
        replacements.permission_factory = factory_code;
      } else if (query_level === "3" && user_code) {
        permissionCondition = "a.grt_user = :permission_user";
        replacements.permission_user = user_code;
      }
    }
    const sql = `
      SELECT
        a.factory_code,
        a.conf_seq,
        a.ac_no,
        a.conf_date,
        a.lock_date,
        a.lock_seq,
        a.acbom_no,
        a.col1,
        a.col2,
        a.col3,
        a.col4,
        a.col5,
        a.ac_shoeid,
        a.money,
        a.prod_money,
        a.percent,
        a.status,
        a.grt_dept,
        a.grt_user,
        a.grt_date,
        a.last_user,
        a.last_date,
        a.locked_information,
        "Customs".gf_chgid_chgno(a.factory_code, a.ac_no)                                                                AS chg_no,
        "Customs".gf_chgid_contno(a.factory_code, a.ac_no)                                                               AS cont_no,
        "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)                                                               AS ac_date,
        "Customs".gf_code_name(a.factory_code, 'ACTYPE', "Customs".gf_chgid_actype(a.factory_code, a.ac_no), :p_charset) AS ac_typename,
        "Customs".gf_ac_yearno(a.factory_code, a.conf_seq)                                                               AS year_no,
        'CHT' || SUBSTR(TO_CHAR(a.lock_date, 'YYYY'), 3) || '/' || a.lock_seq                                            AS issue_seq,
        b.ac_chgs || '/' || a.col3                                                                                        AS chgs_col3,
        b.old_no,
        b.d_type AS out_dtype,
        CASE a.status
          WHEN 1  THEN '1-New新單'
          WHEN 2  THEN '2-Check復核'
          WHEN 7  THEN '7-Confirm確認'
          WHEN 0  THEN '0-Cancel取消'
          WHEN 9  THEN '9-Locked'
          WHEN 99 THEN '99-Shipping'
        END AS status_name
      FROM "Customs".ac_issue_m_t a
      LEFT JOIN "Customs".vw_chg_exp b
        ON a.factory_code = b.factory_code AND a.ac_no = b.ac_no
      WHERE a.factory_code = :factory_code
        -- permission
        AND (:permission_dept IS NULL OR a.grt_dept = :permission_dept)
        AND (:permission_user IS NULL OR a.grt_user = :permission_user)
        -- filters
        AND (:s_chgno   IS NULL OR "Customs".gf_chgid_chgno(a.factory_code, a.ac_no) LIKE :s_chgno || '%')
        AND (:cont_no   IS NULL OR "Customs".gf_chgid_contno(a.factory_code, a.ac_no) LIKE :cont_no || '%')
        AND (:s_date_1 IS NULL OR "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)::date >= :s_date_1::date)
        AND (:e_date_1 IS NULL OR "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)::date <= :e_date_1::date)
        AND (:s_date_2 IS NULL OR a.col4::date >= :s_date_2::date)
        AND (:e_date_2 IS NULL OR a.col4::date <= :e_date_2::date)
        AND (:s_chgs    IS NULL OR a.col3 >= :s_chgs)
        AND (:e_chgs    IS NULL OR a.col3 <= :e_chgs)
        AND (:status    IS NULL OR a.status = :status)
        AND (
          (:se_id IS NULL AND :ship_seq IS NULL)
          OR a.ac_no IN (
            SELECT sub.ac_no
            FROM "Customs".ac_plan_ord sub
            WHERE sub.factory_code = :factory_code
              AND (:se_id    IS NULL OR sub.se_id    LIKE :se_id || '%')
              AND (:ship_seq IS NULL OR sub.ship_seq = :ship_seq)
          )
        )
        AND ${permissionCondition}
      ORDER BY a.conf_seq
      LIMIT  :limit
      OFFSET :offset
    `;

    const countSql = `
  SELECT COUNT(*) AS total
      FROM "Customs".ac_issue_m_t a
      LEFT JOIN "Customs".vw_chg_exp b
      ON a.factory_code = b.factory_code AND a.ac_no = b.ac_no
  WHERE a.factory_code = :factory_code
        -- permission
        AND (:permission_dept IS NULL OR a.grt_dept = :permission_dept)
        AND (:permission_user IS NULL OR a.grt_user = :permission_user)
        -- filters
        AND (:s_chgno   IS NULL OR "Customs".gf_chgid_chgno(a.factory_code, a.ac_no) LIKE :s_chgno || '%')
        AND (:cont_no   IS NULL OR "Customs".gf_chgid_contno(a.factory_code, a.ac_no) LIKE :cont_no || '%')
        AND (:s_date_1 IS NULL OR "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)::date >= :s_date_1::date)
        AND (:e_date_1 IS NULL OR "Customs".gf_chgid_acdate(a.factory_code, a.ac_no)::date <= :e_date_1::date)
        AND (:s_date_2 IS NULL OR a.col4::date >= :s_date_2::date)
        AND (:e_date_2 IS NULL OR a.col4::date <= :e_date_2::date)
        AND (:s_chgs    IS NULL OR a.col3 >= :s_chgs)
        AND (:e_chgs    IS NULL OR a.col3 <= :e_chgs)
        AND (:status    IS NULL OR a.status = :status)
        AND (
          (:se_id IS NULL AND :ship_seq IS NULL)
          OR a.ac_no IN (
            SELECT sub.ac_no
            FROM "Customs".ac_plan_ord sub
            WHERE sub.factory_code = :factory_code
              AND (:se_id    IS NULL OR sub.se_id    LIKE :se_id || '%')
              AND (:ship_seq IS NULL OR sub.ship_seq = :ship_seq)
          )
        )
    AND ${permissionCondition}
`;
    const rows = await pool.query(sql, {
      replacements,
      type: pool.QueryTypes.SELECT,
    });
    const countResult = await pool.query(countSql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });

    const hasMore = rows.length > parseInt(limit);
    const actualRows = hasMore ? rows.slice(0, parseInt(limit)) : rows;
    let total = null;
    if (parseInt(offset) === 0) {
      total = parseInt(countResult[0].total);
    }

    return { rows: actualRows, hasMore, total: total };
  } catch (error) {
    console.error("Error searching AC_ISSUE_M:", error);
    throw error;
  }
}

module.exports = {
  listAcIssueM,
  getByID,
  updateInvoiceDate,
  updateHsCode,
  updateNwGw,
  add,
  edit,
  calculate,
  deleteImp,
  search,
  active,
  cancelActive,
  voidAll,
  fetchInvoiceDropdown,
  getPackingSeidByInvoice,
  listAllForExcelDetail,
  listAllForExcelSummary,
};
