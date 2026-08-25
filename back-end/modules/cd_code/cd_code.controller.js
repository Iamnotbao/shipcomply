const cdCodeService = require("./cd_code.service");

async function getAllFieldDropdownn(req, res) {
  const { factory_code, rule_no, language, page, limit, search } = req.query;
  const result = await cdCodeService.getAllFieldDropdownn(
    factory_code,
    rule_no,
    language,
    page,
    limit,
    search,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "SE_CUST",
  });
}
async function getAllFieldByVendNo(req, res) {
  try {
    const {
      factory_code,
      field,
      category_code,
      vend_no,
      language,
      page,
      limit,
      search,
      isStatus,
    } = req.query;
    const result = await cdCodeService.getAllFieldByVendNo(
      factory_code,
      field,
      category_code,
      vend_no,
      language,
      page,
      limit,
      search,
      isStatus,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "SE_CUST",
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
  getAllFieldDropdownn,
  getAllFieldByVendNo,
};
