const rdSizeMService = require("./rd_size_m.service");

async function getAllSizeDataDropdown(req, res) {
  const { factory_code, field, language, page, limit, search,isStatus } = req.query;
  const result = await rdSizeMService.getAllSizeDataDropdown(
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
    tableName: "RD_SIZE_M",
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
    const result = await rdSizeMService.getAllFieldByVendNo(
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
      tableName: "RD_SIZE_M",
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
    const { factory_code, field, language, page, limit, search, extraField,is_status } =
      req.query;
      console.log("boooms",factory_code, field, language, page, limit, search, extraField,is_status);
      
    const result = await rdSizeMService.getAllFieldDropdown(
      factory_code,
      field,
      language,
      page,
      limit,
      search,
      extraField,
      is_status
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "RD_SIZE_M",
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
  getAllSizeDataDropdown,
  getAllFieldByVendNo,
  getAllFieldDropdown
};
