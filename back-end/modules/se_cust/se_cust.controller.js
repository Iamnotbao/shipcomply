const seCustService = require("./se_cust.service");

async function getAllCustDataDropdown(req, res) {
  const { factory_code, field, language, page, limit, search,isStatus } = req.query;
  const result = await seCustService.getAllCustDataDropdown(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    isStatus
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
    const result = await seCustService.getAllFieldByVendNo(
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
async function getAllFieldDropdown(req, res) {
  try {
    const { factory_code, field, language, page, limit, search, extraField,isStatus } =
      req.query;
    const result = await seCustService.getAllFieldDropdown(
      factory_code,
      field,
      language,
      page,
      limit,
      search,
      extraField,
      isStatus
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
  getAllCustDataDropdown,
  getAllFieldByVendNo,
  getAllFieldDropdown
};
