const ExcelJS = require("exceljs");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

async function generateAcSrcorderMExcel(filters) {
  const {
    order_no,
    vend_no,
    s_date,
    e_date,
    item_no,
    status,
    item_no1,
    invoice_no,
    is_item,
    s_cfm,
    e_cfm,
    factory_code,
  } = filters;

  // Main query - giống CURSOR GET_MONTH
  let sql = `
    SELECT 
      M.id,
      M.order_date AS ord_date,
      M.order_no,
      M.order_seq,
      M.ac_code,
      M.item_acno,
      M.order_acqty AS ord_acqty,
      M.chge_qty,
      M.pr_unit,
      M.order_qty AS ord_qty,
      M.chge_qty AS chg_qty1,
      M.rcpt_qty,
      M.pass_qty,
      M.ac_vend,
      M.chge_ordqty,
      CASE 
        WHEN M.status = 1 THEN '新單'
        WHEN M.status = 2 THEN '複核'
        WHEN M.status = 7 THEN '生效'
        WHEN M.status = 9 THEN '鎖定'
        ELSE '結案'
      END AS status,
      M.factory_code
    FROM "Customs".ac_srcorder_m M
    WHERE M.order_no LIKE :order_no
  `;

  const replacements = { 
    factory_code,
    order_no: order_no ? `${order_no}%` : '%'
  };

  // Apply filters - giống WHERE clause Oracle
  if (vend_no) {
    sql += ` AND M.ac_vend = :vend_no`;
    replacements.vend_no = vend_no;
  }

  if (s_date) {
    sql += ` AND DATE(M.order_date) >= DATE(:s_date)`;
    replacements.s_date = s_date;
  }

  if (e_date) {
    sql += ` AND DATE(M.order_date) <= DATE(:e_date)`;
    replacements.e_date = e_date;
  }

  if (item_no) {
    sql += ` AND M.ac_code = :item_no`;
    replacements.item_no = item_no;
  }

  if (status !== undefined && status !== null) {
    sql += ` AND M.status = :status`;
    replacements.status = status;
  }

  if (item_no1) {
    sql += ` AND M.item_acno = :item_no1`;
    replacements.item_no1 = item_no1;
  }

  if (invoice_no) {
    sql += ` AND (M.order_no, M.order_seq) IN (
      SELECT A.order_no, A.order_seq 
      FROM "Customs".ac_req_order A
      INNER JOIN "Customs".ac_req_m B ON A.factory_code = B.factory_code AND A.req_no = B.req_no
      WHERE B.invoice_no = :invoice_no
    )`;
    replacements.invoice_no = invoice_no;
  }

  if (is_item === "Y") {
    sql += ` AND M.item_acno IS NOT NULL`;
  } else if (is_item === "N") {
    sql += ` AND M.item_acno IS NULL`;
  }

  // s_cfm, e_cfm filter - logic phức tạp từ Oracle
  if (s_cfm) {
    sql += ` AND (
      M.vr_cfmday >= DATE(:s_cfm)
      OR (M.order_type = '2' AND M.vr_cfmday >= DATE(:s_cfm))
      OR (M.order_type = '1' AND (M.factory_code, M.order_no, M.order_seq) IN (
        SELECT X.factory_code, X.order_no, X.order_seq 
        FROM "Customs".ac_srcorder_d X
        WHERE DATE(X.vr_cfmday) >= DATE(:s_cfm)
      ))
    )`;
    replacements.s_cfm = s_cfm;
  }

  if (e_cfm) {
    sql += ` AND (
      M.vr_cfmday <= DATE(:e_cfm)
      OR (M.order_type = '2' AND M.vr_cfmday <= DATE(:e_cfm))
      OR (M.order_type = '1' AND (M.factory_code, M.order_no, M.order_seq) IN (
        SELECT X.factory_code, X.order_no, X.order_seq 
        FROM "Customs".ac_srcorder_d X
        WHERE DATE(X.vr_cfmday) <= DATE(:e_cfm)
      ))
    )`;
    replacements.e_cfm = e_cfm;
  }

  sql += ` ORDER BY M.ac_vend, M.order_date`;

  const results = await sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
  });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("採購單報關明細表");

  // WK_CNT = 1, WK_COL = 1 (row 1, col H)
  worksheet.mergeCells("A1:W1");
  worksheet.getCell("A1").value = "採購單報關明細表";
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // WK_CNT = 2 - Header row
  const headers = [
    "來源",
    "下單日期",
    "廠商名稱",
    "採購單號",
    "序",
    "材料代碼",
    "名稱",
    "單位",
    "採購數",
    "累計申請數",
    "材料管理編號",
    "名稱",
    "單位",
    "採購數",
    "累積已報關數",
    "累積收料數",
    "累積合格數",
    "採購單狀態",
    "欠報關數",
    "發票號碼",
    "報關日期",
    "報關單號",
    "報關數量",
  ];

  worksheet.getRow(2).values = headers;
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).alignment = { horizontal: "center" };

  // FOR M IN GET_MONTH LOOP - process each row
  for (const M of results) {
    // Get item name - giống BEGIN...SELECT...INTO V_ITEMNM
    let V_ITEMNM = "";
    try {
      const itemResult = await sequelize.query(
        `SELECT name_t FROM "Customs".ac_allitem_src WHERE ac_code = :ac_code`,
        {
          replacements: { ac_code: M.ac_code },
          type: QueryTypes.SELECT,
        }
      );
      V_ITEMNM = itemResult[0]?.name_t || "";
    } catch (error) {
      // EXCEPTION WHEN NO_DATA_FOUND THEN NULL
      V_ITEMNM = "";
    }

    // Get AC item info - giống BEGIN...SELECT...INTO V_ITEMNM1, V_UNITNM1
    let V_ITEMNM1 = "";
    let V_UNITNM1 = "";
    if (M.item_acno) {
      try {
        const acItemResult = await sequelize.query(
          `SELECT name_t, unit FROM "Customs".ac_item_m WHERE item_acno = :item_acno`,
          {
            replacements: { item_acno: M.item_acno },
            type: QueryTypes.SELECT,
          }
        );
        V_ITEMNM1 = acItemResult[0]?.name_t || "";

        // Get unit name for AC item
        if (acItemResult[0]?.unit) {
          try {
            const unitResult = await sequelize.query(
              `SELECT unit_name FROM "Customs".sys_unit WHERE unit_code = :unit_code`,
              {
                replacements: { unit_code: acItemResult[0].unit },
                type: QueryTypes.SELECT,
              }
            );
            V_UNITNM1 = unitResult[0]?.unit_name || "";
          } catch (error) {
            V_UNITNM1 = "";
          }
        }
      } catch (error) {
        // EXCEPTION WHEN NO_DATA_FOUND THEN NULL
        V_ITEMNM1 = "";
        V_UNITNM1 = "";
      }
    }

    // Get vendor name - GF_VEND_SHORTNM
    let VENDNM = "";
    try {
      const vendorResult = await sequelize.query(
        `SELECT vend_name FROM "Customs".ac_vend WHERE vend_code = :vend_code AND factory_code = :factory_code`,
        {
          replacements: {
            vend_code: M.ac_vend,
            factory_code: M.factory_code,
          },
          type: QueryTypes.SELECT,
        }
      );
      VENDNM = vendorResult[0]?.vend_name || "";
    } catch (error) {
      VENDNM = "";
    }

    // Get unit name for pr_unit - GF_CODE_NAME
    let UNITNM = "";
    try {
      const unitResult = await sequelize.query(
        `SELECT unit_name FROM "Customs".sys_unit WHERE unit_code = :unit_code`,
        {
          replacements: { unit_code: M.pr_unit },
          type: QueryTypes.SELECT,
        }
      );
      UNITNM = unitResult[0]?.unit_name || "";
    } catch (error) {
      UNITNM = "";
    }

    // Initialize variables - giống V_INV := '', V_CHGQTY := ''...
    let V_INV = "";
    let V_CHGQTY = "";
    let V_CHGNO1 = "";
    let V_CHGDATE1 = "";

    // FOR A IN(...) LOOP - invoice loop
    try {
      const invoices = await sequelize.query(
        `SELECT A.factory_code, A.invoice_no, A.ac_no, D.chge_qty
         FROM "Customs".ac_req_m A
         INNER JOIN "Customs".ac_req_order D ON A.factory_code = D.factory_code AND A.req_no = D.req_no
         WHERE D.factory_code = :factory_code 
           AND D.order_no = :order_no 
           AND D.order_seq = :order_seq
         ORDER BY A.invoice_no`,
        {
          replacements: {
            factory_code: factory_code,
            order_no: M.order_no,
            order_seq: M.order_seq,
          },
          type: QueryTypes.SELECT,
        }
      );

      for (const A of invoices) {
        // V_INV:=v_inv||a.invoice_no||';'
        V_INV += (A.invoice_no || "") + ";";
        V_CHGQTY += (A.chge_qty || 0) + ";";

        // Get chg_no - try vw_chg_imp first, then ac_proc_m
        let V_CHGNO = "";
        try {
          const chgResult = await sequelize.query(
            `SELECT ac_chgno FROM "Customs".vw_chg_imp 
             WHERE factory_code = :factory_code AND ac_no = :ac_no`,
            {
              replacements: {
                factory_code: A.factory_code,
                ac_no: A.ac_no,
              },
              type: QueryTypes.SELECT,
            }
          );
          V_CHGNO = chgResult[0]?.ac_chgno || "";
        } catch (error) {
          // EXCEPTION WHEN NO_DATA_FOUND - try ac_proc_m
          try {
            const procResult = await sequelize.query(
              `SELECT ac_chgeno FROM "Customs".ac_proc_m 
               WHERE factory_code = :factory_code AND ac_no = :ac_no`,
              {
                replacements: {
                  factory_code: A.factory_code,
                  ac_no: A.ac_no,
                },
                type: QueryTypes.SELECT,
              }
            );
            V_CHGNO = procResult[0]?.ac_chgeno || "";
          } catch (err) {
            V_CHGNO = "";
          }
        }
        V_CHGNO1 += V_CHGNO + ";";

        // Get chg_date - try ac_chg_m first, then ac_proc_m
        let V_CHGDATE = "";
        try {
          const dateResult = await sequelize.query(
            `SELECT out_date FROM "Customs".ac_chg_m 
             WHERE factory_code = :factory_code AND ac_no = :ac_no`,
            {
              replacements: {
                factory_code: A.factory_code,
                ac_no: A.ac_no,
              },
              type: QueryTypes.SELECT,
            }
          );

          if (dateResult[0]?.out_date) {
            const d = new Date(dateResult[0].out_date);
            V_CHGDATE = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
          }
        } catch (error) {
          // exception when no_data_found - try ac_proc_m
          try {
            const procDateResult = await sequelize.query(
              `SELECT ac_date FROM "Customs".ac_proc_m 
               WHERE factory_code = :factory_code AND ac_no = :ac_no`,
              {
                replacements: {
                  factory_code: A.factory_code,
                  ac_no: A.ac_no,
                },
                type: QueryTypes.SELECT,
              }
            );

            if (procDateResult[0]?.ac_date) {
              const d = new Date(procDateResult[0].ac_date);
              V_CHGDATE = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
            }
          } catch (err) {
            V_CHGDATE = "";
          }
        }
        V_CHGDATE1 += V_CHGDATE + ";";
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }

    // Format order date - TO_CHAR(M.ORD_DATE,'YYYY/MM/DD')
    let ordDate = "";
    if (M.ord_date) {
      const date = new Date(M.ord_date);
      ordDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    }

    // Get src (來源) - not in original M cursor, but from order_type
    let src = "";
    try {
      const srcResult = await sequelize.query(
        `SELECT CASE 
          WHEN order_type = '1' THEN '鞋廠'
          WHEN order_type = '2' THEN 'RB'
          ELSE 'RPU'
        END AS src
        FROM "Customs".ac_srcorder_m 
        WHERE id = :id`,
        {
          replacements: { id: M.id },
          type: QueryTypes.SELECT,
        }
      );
      src = srcResult[0]?.src || "";
    } catch (error) {
      src = "";
    }

    // Calculate outstanding qty - M.ORD_ACQTY-NVL(M.CHGE_QTY,0)
    const outstandingQty = (M.ord_acqty || 0) - (M.chge_qty || 0);

    // Add row to Excel - WK_CNT := WK_CNT + 1
    worksheet.addRow([
      src,
      ordDate,
      VENDNM,
      M.order_no,
      M.order_seq,
      M.ac_code,
      V_ITEMNM,
      UNITNM,
      M.ord_qty,
      M.chge_ordqty,
      M.item_acno ? `'${M.item_acno}` : "",
      V_ITEMNM1,
      V_UNITNM1,
      M.ord_acqty,
      M.chge_qty,
      M.pass_qty,
      M.chg_qty1,
      M.status,
      outstandingQty,
      V_INV,
      V_CHGDATE1,
      V_CHGNO1,
      V_CHGQTY,
    ]);
  }

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateAcSrcorderMExcel };
