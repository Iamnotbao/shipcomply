const vwApdueAllService = require("./vw_apdue_all.service");
const fs = require("fs");

async function getListOfVApA(req, res) {
  const { vend_no, com_invoice, col6, col4, language, limit, offset } =
    req.query;
  const result = await vwApdueAllService.getListOfVApA(
    vend_no,
    com_invoice,
    col6,
    col4,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_CHG_M",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    tableName: "VW_CHG_M",
  });
}
async function exportVApAExcel(req, res) {
  try {
    const filename = "VW_APDUE_ALL";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await vwApdueAllService.exportVApAExcel(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=VW_APDUE_ALL_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(" Export Excel error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
module.exports = {
  getListOfVApA,
  exportVApAExcel,
};
