const vwAcSumService = require("./vw_ac_sum.service");
const fs = require("fs");

async function getAllVwAcSum(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
  } = req.query;
  const result = await vwAcSumService.getAllVwAcSum(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_AC_CHGSUM ",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.data,
    hasMore: result.hasMore,
    total: result.count,
    tableName: "VW_AC_CHGSUM ",
  });
}
async function exportExcel(req, res) {
  try {
    const filename = "VW_AC_SUM.xlsx";
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
    } = req.query;
    const workbook = await vwAcSumService.exportExcel(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=VW_AC_CONT_IMP_${Date.now()}.xlsx`,
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
async function searchVwAcSum(req, res) {
  const { search } = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  try {
    const shoes = await vwAcSumService.searchVwAcSum(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
      language,
      limit,
      offset,
    );
    return res.json({
      message: "search vw cont imp successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  getAllVwAcSum,
  exportExcel,
  searchVwAcSum,
};
