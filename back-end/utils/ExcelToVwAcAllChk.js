const ExcelJS = require("exceljs");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

async function generateVwAcAllChkExcel(filters) {
  const {
    factory_code,
    req_no,
    vend_no,
    s_date,
    e_date,
  } = filters;

  // Main query - giống CURSOR GET_MONTH
  let sql = `
    SELECT 
      D.factory_code,
      D.req_no,
      M.vend_no,
      C.invoice_no,
      D.order_date,
      D.order_no,
      D.order_seq,
      D.ac_code,
      D.item_acno,
      D.order_acqty,
      D.req_acqty,
      D.chge_qty,
      D.req_qc,
      D.ac_send,
      M.pr_unit,
      M.order_qty,
      M.chge_qty AS chg_qty1,
      M.rcpt_qty,
      M.pass_qty,
      M.chge_ordqty,
      D.req_qty,
      C.ac_no
    FROM "Customs".ac_req_order D
    INNER JOIN "Customs".ac_srcorder_m M 
      ON D.factory_code = M.factory_code 
      AND D.order_no = M.order_no 
      AND D.order_seq = M.order_seq
    INNER JOIN "Customs".ac_req_m C 
      ON D.factory_code = C.factory_code 
      AND D.req_no = C.req_no
    WHERE D.factory_code = :factory_code
  `;

  const replacements = { factory_code };

  // Apply filters - giống WHERE clause Oracle
  if (req_no) {
    sql += ` AND C.req_no = :req_no`;
    replacements.req_no = req_no;
  }

  if (vend_no) {
    sql += ` AND M.vend_no = :vend_no`;
    replacements.vend_no = vend_no;
  }

  if (s_date) {
    sql += ` AND DATE(C.req_date) >= DATE(:s_date)`;
    replacements.s_date = s_date;
  }

  if (e_date) {
    sql += ` AND DATE(C.req_date) <= DATE(:e_date)`;
    replacements.e_date = e_date;
  }

  sql += ` ORDER BY D.req_no, D.order_no, D.order_seq`;

  const results = await sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
  });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("報關申請明細表");

  // WK_CNT = 1 - Title row
  worksheet.mergeCells("A1:X1");
  worksheet.getCell("A1").value = "報關申請明細表";
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  let currentRow = 2;
  let OLD_REQ = "???";

// ✅ FOR M IN GET_MONTH LOOP
for (const M of results) {
  if (M.req_no !== OLD_REQ) {
    WK_CNT++;

    if (OLD_REQ !== "???") {
      WK_CNT++;
    }

    // Get vendor short name
    let VEND_SHORT_NM = "";
    try {
      const vendorResult = await sequelize.query(
        `SELECT short_nm FROM "Customs".ac_vend 
         WHERE factory_code = :factory_code AND vend_no = :vend_no`,
        {
          replacements: {
            factory_code: M.factory_code,
            vend_no: M.vend_no,
          },
          type: QueryTypes.SELECT,
        }
      );
      VEND_SHORT_NM = vendorResult[0]?.short_nm || "";
    } catch (error) {
      VEND_SHORT_NM = "";
    }

    // REQ_NO header row
    worksheet.getCell(`A${WK_CNT}`).value = "申請單號:";
    worksheet.getCell(`B${WK_CNT}`).value = M.req_no;
    worksheet.getCell(`C${WK_CNT}`).value = "廠商：";
    worksheet.getCell(`D${WK_CNT}`).value = VEND_SHORT_NM;
    worksheet.getCell(`E${WK_CNT}`).value = "發票號碼";
    worksheet.getCell(`F${WK_CNT}`).value = `'${M.invoice_no || ""}`;

    WK_CNT++;

    // ✅ Column headers - BỎ "來源"
    const headers = [
      "下單日期",       // WK_COL
      "採購單號",       // WK_COL+1
      "序",            // WK_COL+2
      "交貨方式",       // WK_COL+3
      "材料代碼",       // WK_COL+4
      "名稱",          // WK_COL+5
      "單位",          // WK_COL+6
      "採購數",         // WK_COL+7
      "累計申請數",     // WK_COL+8
      "本次申請數",     // WK_COL+9
      "材料管理編號",   // WK_COL+10
      "名稱",          // WK_COL+11
      "單位",          // WK_COL+12
      "採購數",         // WK_COL+13
      "本次申請報關數", // WK_COL+14
      "報關單號",       // WK_COL+15
      "本次報關數",     // WK_COL+16
      "累積已報關數",   // WK_COL+17
      "累積收料數",     // WK_COL+18
      "累積合格數",     // WK_COL+19
      "倉庫收料需報關", // WK_COL+20
      "收料單號",       // WK_COL+21
      "收料數量",       // WK_COL+22
    ];

    worksheet.getRow(WK_CNT).values = headers;
    worksheet.getRow(WK_CNT).font = { bold: true };
    worksheet.getRow(WK_CNT).alignment = { horizontal: "center" };

    OLD_REQ = M.req_no;
  }

  // ... [các query V_ITEMNM, V_ITEMNM1, etc. giữ nguyên] ...

  // Get AC_SEND name
  let AC_SEND_NM = "";
  try {
    const sendResult = await sequelize.query(
      `SELECT code_name FROM "Customs".sys_code 
       WHERE factory_code = :factory_code 
         AND code_type = 'ACSEND' 
         AND code = :ac_send`,
      {
        replacements: {
          factory_code: M.factory_code,
          ac_send: M.ac_send,
        },
        type: QueryTypes.SELECT,
      }
    );
    AC_SEND_NM = sendResult[0]?.code_name || "";
  } catch (error) {
    AC_SEND_NM = "";
  }

  // Get UNITNM
  let UNITNM = "";
  try {
    const unitResult = await sequelize.query(
      `SELECT code_name FROM "Customs".sys_code 
       WHERE factory_code = :factory_code 
         AND code_type = 'UNIT' 
         AND code = :unit`,
      {
        replacements: {
          factory_code: M.factory_code,
          unit: M.pr_unit,
        },
        type: QueryTypes.SELECT,
      }
    );
    UNITNM = unitResult[0]?.code_name || "";
  } catch (error) {
    UNITNM = "";
  }

  // Format order date
  let ordDate = "";
  if (M.order_date) {
    const date = new Date(M.order_date);
    ordDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  }

  WK_CNT++;
  worksheet.getRow(WK_CNT).values = [
    ordDate,                        
    M.order_no,                     
    M.order_seq,                  
    AC_SEND_NM,                    
    M.ac_code,                    
    V_ITEMNM,                     
    UNITNM,                       
    M.order_qty,                    
    M.chge_ordqty,                  
    M.req_qty,                    
    M.item_acno ? `'${M.item_acno}` : "",  
    V_ITEMNM1,                     
    V_UNITNM1,                    
    M.order_acqty,                  
    M.req_acqty,                  
    V_CHGNO,                        
    M.chge_qty,                    
    V_LCHGE,                    
    V_LRCPT,                       
    V_LPASS,                       
    M.req_qc,                       
    V_CHKNO,                        
    V_RCPTQTY,                     
  ];

  OLD_REQ = M.req_no;
}

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateVwAcAllChkExcel };