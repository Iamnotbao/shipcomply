const ExcelJS = require("exceljs");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

async function generateCustomsDeclarationExcel(filters) {
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

  // Main query
  let sql = `
    SELECT 
      M.id,
      CASE 
        WHEN M.order_type = '1' THEN '鞋廠'
        WHEN M.order_type = '2' THEN 'RB'
        ELSE 'RPU'
      END AS src,
      M.order_date AS ord_date,
      M.order_no,
      M.order_seq,
      M.ac_code,
      M.item_acno,
      M.order_acqty AS ord_acqty,
      M.chge_qty,
      M.pr_unit,
      M.order_qty AS ord_qty,
      M.rcpt_qty,
      M.pass_qty,
      M.chge_ordqty,
      M.ac_vend,
      CASE 
        WHEN M.status = 1 THEN '新單'
        WHEN M.status = 2 THEN '複核'
        WHEN M.status = 7 THEN '生效'
        WHEN M.status = 9 THEN '鎖定'
        ELSE '結案'
      END AS status,
      M.factory_code
    FROM "Customs".ac_srcorder_m M
    WHERE 1=1
  `;

  const replacements = { factory_code };

  // Apply filters
  if (order_no) {
    sql += ` AND M.order_no LIKE :order_no`;
    replacements.order_no = `${order_no}%`;
  }

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

  if (status) {
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
      FROM ac_req_order A
      INNER JOIN ac_req_m B ON A.factory_code = B.factory_code AND A.req_no = B.req_no
      WHERE B.invoice_no = :invoice_no
    )`;
    replacements.invoice_no = invoice_no;
  }

  if (is_item === "Y") {
    sql += ` AND M.item_acno IS NOT NULL`;
  } else if (is_item === "N") {
    sql += ` AND M.item_acno IS NULL`;
  }

  sql += ` ORDER BY M.order_type, M.ac_vend, M.order_date`;

  const results = await sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
  });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("採購單報關明細表");

  // Header row 1 - Title
  worksheet.mergeCells("A1:W1");
  worksheet.getCell("A1").value = "採購單報關明細表";
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // Header row 2 - Column names
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

  // Process data rows
  for (const row of results) {
    // Format date
    let ordDate = "";
    if (row.ord_date) {
      const date = new Date(row.ord_date);
      ordDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}/${String(date.getDate()).padStart(2, "0")}`;
    }

    // Get item name
    let itemName = "";
    try {
      const [itemResult] = await sequelize.query(
        `SELECT name_t FROM ac_allitem_src WHERE ac_code = :ac_code`,
        {
          replacements: { ac_code: row.ac_code },
          type: QueryTypes.SELECT,
        }
      );
      itemName = itemResult?.name_t || "";
    } catch (error) {
      console.error("Error fetching item name:", error);
    }

    // Get vendor name
    let vendorName = "";
    try {
      const [vendorResult] = await sequelize.query(
        `SELECT vend_name FROM ac_vend WHERE vend_code = :vend_code AND factory_code = :factory_code`,
        {
          replacements: {
            vend_code: row.ac_vend,
            factory_code: row.factory_code,
          },
          type: QueryTypes.SELECT,
        }
      );
      vendorName = vendorResult?.vend_name || "";
    } catch (error) {
      console.error("Error fetching vendor name:", error);
    }

    // Get unit name
    let unitName = "";
    try {
      const [unitResult] = await sequelize.query(
        `SELECT unit_name FROM sys_unit WHERE unit_code = :unit_code`,
        {
          replacements: { unit_code: row.pr_unit },
          type: QueryTypes.SELECT,
        }
      );
      unitName = unitResult?.unit_name || "";
    } catch (error) {
      console.error("Error fetching unit name:", error);
    }

    // Get AC item info
    let itemAcName = "";
    let unitName1 = "";
    if (row.item_acno) {
      try {
        const [acItemResult] = await sequelize.query(
          `SELECT name_t, unit FROM ac_item_m WHERE item_acno = :item_acno`,
          {
            replacements: { item_acno: row.item_acno },
            type: QueryTypes.SELECT,
          }
        );
        itemAcName = acItemResult?.name_t || "";

        if (acItemResult?.unit) {
          const [unitResult] = await sequelize.query(
            `SELECT unit_name FROM sys_unit WHERE unit_code = :unit_code`,
            {
              replacements: { unit_code: acItemResult.unit },
              type: QueryTypes.SELECT,
            }
          );
          unitName1 = unitResult?.unit_name || "";
        }
      } catch (error) {
        console.error("Error fetching AC item info:", error);
      }
    }

    // Get invoice data
    let invoiceList = [];
    let chgQtyList = [];
    let chgNoList = [];
    let chgDateList = [];

    try {
      const invoices = await sequelize.query(
        `SELECT a.factory_code, a.invoice_no, a.ac_no, d.chge_qty
         FROM ac_req_m a
         INNER JOIN ac_req_order d ON a.factory_code = d.factory_code AND a.req_no = d.req_no
         WHERE d.factory_code = :factory_code 
           AND d.order_no = :order_no 
           AND d.order_seq = :order_seq
         ORDER BY a.invoice_no`,
        {
          replacements: {
            factory_code: row.factory_code,
            order_no: row.order_no,
            order_seq: row.order_seq,
          },
          type: QueryTypes.SELECT,
        }
      );

      for (const inv of invoices) {
        invoiceList.push(inv.invoice_no);
        chgQtyList.push(inv.chge_qty || 0);

        let chgNo = "";
        try {
          const [chgResult] = await sequelize.query(
            `SELECT ac_chgno FROM vw_chg_imp 
             WHERE factory_code = :factory_code AND ac_no = :ac_no`,
            {
              replacements: {
                factory_code: inv.factory_code,
                ac_no: inv.ac_no,
              },
              type: QueryTypes.SELECT,
            }
          );
          chgNo = chgResult?.ac_chgno || "";
        } catch (error) {
          try {
            const [procResult] = await sequelize.query(
              `SELECT ac_chgeno FROM ac_proc_m 
               WHERE factory_code = :factory_code AND ac_no = :ac_no`,
              {
                replacements: {
                  factory_code: inv.factory_code,
                  ac_no: inv.ac_no,
                },
                type: QueryTypes.SELECT,
              }
            );
            chgNo = procResult?.ac_chgeno || "";
          } catch (err) {
            chgNo = "";
          }
        }
        chgNoList.push(chgNo);

        let chgDate = "";
        try {
          const [dateResult] = await sequelize.query(
            `SELECT out_date FROM ac_chg_m 
             WHERE factory_code = :factory_code AND ac_no = :ac_no`,
            {
              replacements: {
                factory_code: inv.factory_code,
                ac_no: inv.ac_no,
              },
              type: QueryTypes.SELECT,
            }
          );

          if (dateResult?.out_date) {
            const d = new Date(dateResult.out_date);
            chgDate = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}/${String(d.getDate()).padStart(2, "0")}`;
          }
        } catch (error) {
          try {
            const [procDateResult] = await sequelize.query(
              `SELECT ac_date FROM ac_proc_m 
               WHERE factory_code = :factory_code AND ac_no = :ac_no`,
              {
                replacements: {
                  factory_code: inv.factory_code,
                  ac_no: inv.ac_no,
                },
                type: QueryTypes.SELECT,
              }
            );

            if (procDateResult?.ac_date) {
              const d = new Date(procDateResult.ac_date);
              chgDate = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}/${String(d.getDate()).padStart(2, "0")}`;
            }
          } catch (err) {
            chgDate = "";
          }
        }
        chgDateList.push(chgDate);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }

    const outstandingQty = (row.ord_acqty || 0) - (row.chge_qty || 0);

    worksheet.addRow([
      row.src,
      ordDate,
      vendorName,
      row.order_no,
      row.order_seq,
      row.ac_code,
      itemName,
      unitName,
      row.ord_qty,
      row.chge_ordqty,
      row.item_acno ? `'${row.item_acno}` : "",
      itemAcName,
      unitName1,
      row.ord_acqty,
      row.chge_qty,
      row.pass_qty,
      row.chge_qty,
      row.status,
      outstandingQty,
      invoiceList.join(";"),
      chgDateList.join(";"),
      chgNoList.join(";"),
      chgQtyList.join(";"),
    ]);
  }

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateCustomsDeclarationExcel };
