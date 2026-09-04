const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");

async function getListOfVwApDueAll(
  vend_no,
  com_invoice,
  col6,
  col4,
  language,
  limit,
  offset,
) {
  try {
    const charset = {
      vi: "S",
      zh: "T",
      en: "E",
    };

    const replacements = {
      p_charset: charset[language] || "E",
      vend_no: vend_no || null,
      com_invoice: com_invoice || null,
      col6: col6 || null,
      col4: col4 || null,
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0,
    };

const sql = `
  SELECT DISTINCT ON (A.factory_code, A.ap_id, A.due_id)
    A.factory_code,
    A.ap_id,
    A.due_id,
    A.LAST_RCPTDATE, 
    A.AP_REFNO, 
    A.AP_REFSEQ, 
   B.ITEM_ACNO,
    A.RCPT_QTY, 
    ROUND(COALESCE(A.RCPT_QTY, 0) * B.FORMULA, 2) AS AC_QTY,
    A.AP_QTY, 
    A.PRICE, 
    A.EXCHG_RATE, 
    ROUND(A.PRICE * COALESCE(A.EXCHG_RATE, 1), 2) AS B_PRICE,
    A.AP_BMONEY, 
    ROUND(A.PRICE * A.AP_QTY, 2) AS B_APMONEY 
  FROM 
    "Customs".VW_APDUE_ALL A
    LEFT JOIN "Customs".AC_ITEM_REF B 
      ON A.FACTORY_CODE = B.FACTORY_CODE 
  WHERE 
    A.AC_VEND = :vend_no 
    AND A.COLUMN2 = :com_invoice 
    AND (:col6 IS NULL OR A.SRC = :col6)
    AND A.STATUS::NUMERIC > 1 
    AND (:col4 IS NULL OR A.INVOICE_ID = :col4)
  ORDER BY 
    A.factory_code,
    A.ap_id,
    A.due_id,
    A.AP_REFNO, 
    A.AP_REFSEQ
  LIMIT :limit 
  OFFSET :offset
`;
    const countSql = `
      SELECT COUNT(*) AS total
      FROM 
        "Customs".VW_APDUE_ALL A
        LEFT JOIN "Customs".AC_ITEM_REF B 
          ON A.FACTORY_CODE = B.FACTORY_CODE 
         AND A.ITEM_NO = B.ITEM_NO
      WHERE 
        A.AC_VEND = :vend_no 
        AND A.COLUMN2 = :com_invoice 
      AND (:col6 IS NULL OR A.SRC = :col6)
      AND A.STATUS::NUMERIC > 1 
      AND (:col4 IS NULL OR A.INVOICE_ID = :col4)
    `;
    const rows = await pool.query(sql, {
      replacements: replacements,
      type: pool.QueryTypes.SELECT,
    });
    let total = null;
    if (parseInt(offset) === 0) {
      const countResult = await pool.query(countSql, {
        replacements: replacements,
        type: pool.QueryTypes.SELECT,
      });
      total = parseInt(countResult[0]?.total) || 0;
    }
    return { rows: rows, count: total };
  } catch (error) {
    console.error("Error fetching VW_APDUE_ALL with AC_ITEM_REF:", error);
    throw error;
  }
}
async function listAllVwApDueAllWithDetails(
  vend_no,
  com_invoice,
  col6,
  col4,
  language,
) {
  try {
    const charset = {
      en: "E",
      vi: "L",
      zh: "T",
    };

    const p_charset = charset[language] || "E";
    const transferSql = `
      SELECT 
        TO_CHAR(A.LAST_RCPTDATE, 'YYYY/MM/DD') AS RCPT_DATE,
        A.AP_REFNO,
        A.AP_REFSEQ,
        A.ITEM_NO,
        "Customs".GF_ITEM_FULLNAME(A.FACTORY_CODE, A.ITEM_NO, :p_charset) AS ITEM_NAME,
       "Customs".GF_ITEM_UNITNAME(A.FACTORY_CODE, A.ITEM_NO, :p_charset) AS UNITNM,
        B.ITEM_ACNO,
        "Customs".GF_AC_ITEMNAME(A.FACTORY_CODE, B.ITEM_ACNO, :p_charset) AS ITEM_NAME1,
        "Customs".GF_AC_ITEMUNIT(A.FACTORY_CODE, B.ITEM_ACNO) AS UNIT1,
        "Customs".GF_CODE_NAME(
          A.FACTORY_CODE,
          '1105',
          "Customs".GF_AC_ITEMUNIT(A.FACTORY_CODE, B.ITEM_ACNO),
          :p_charset
        ) AS UNITNM1,
        A.RCPT_QTY,
        ROUND(COALESCE(A.RCPT_QTY, 0) * B.FORMULA, 2) AS AC_QTY,
        A.AP_QTY,
        A.PRICE,
        A.EXCHG_RATE,
        ROUND(A.PRICE * COALESCE(A.EXCHG_RATE, 1), 2) AS B_PRICE,
        A.AP_BMONEY,
        ROUND(A.PRICE * A.AP_QTY, 2) AS B_APMONEY
      FROM "Customs".VW_APDUE_ALL A
      LEFT JOIN "Customs".AC_ITEM_REF B 
        ON A.FACTORY_CODE = B.FACTORY_CODE 
        AND A.ITEM_NO = B.ITEM_NO
      WHERE A.AC_VEND = :vend_no
        AND A.COLUMN2 = :com_invoice
        AND A.SRC = :col6
        AND A.STATUS::NUMERIC > 1
        AND A.INVOICE_ID = :col4::NUMERIC
      ORDER BY A.AP_REFNO, A.AP_REFSEQ
    `;

    const transferData = await pool.query(transferSql, {
      replacements: {
        p_charset: p_charset,
        vend_no: vend_no,
        com_invoice: com_invoice,
        col6: col6,
        col4: col4,
      },
      type: pool.QueryTypes.SELECT,
    });

return { data: transferData };
  } catch (error) {
    console.error("Export Excel Transfer error:", error);
    throw error;
  }
}
module.exports = {
  getListOfVwApDueAll,
  listAllVwApDueAllWithDetails
};
