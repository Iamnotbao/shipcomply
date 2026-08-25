const vwAcChgService = require("./vw_ac_chg.service");
const fs = require("fs");

async function fetchFieldDropdown(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      field,
    } = req.query;
    const result = await vwAcChgService.fetchFieldDropdown(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      field,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "VW_AC_CHG ",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  fetchFieldDropdown,
};
