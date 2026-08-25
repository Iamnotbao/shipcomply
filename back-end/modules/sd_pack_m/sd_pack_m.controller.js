const sdPackMService = require("./sd_pack_m.service");

async function getAllSeIdDataDropdown(req, res) {
  const { factory_code, field, language, page, limit, search,isStatus } = req.query;
  const result = await sdPackMService.getAllSeIdDataDropdown(
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
    tableName: "SD_PACK_M",
  });
}
module.exports = {
  getAllSeIdDataDropdown,
};
