const vwAcShoeBomService = require("./vw_ac_shoebom.service");
const fs = require("fs");

async function getListOfASB(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await vwAcShoeBomService.getListOfAcShoeBom(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of ac shoebom!",
      success: false,
      tableName: "VW_AC_SHOEBOM",
    });
  }
  return res.status(200).json({
    message: "Get  ac shoebom by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "VW_AC_SHOEBOM",
  });
}

async function searchVwAcShoeBom(req, res) {
  const keyword = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  console.log(keyword);
  try {
    const shoes = await vwAcShoeBomService.searchVwAcShoeBom(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset
    );
    return res.json({
      message: "search ac_bom_m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "VW_AC_SHOEBOM",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFVwAcShoeBom(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "VW_AC_SHOEBOM";
    const workbook = await vwAcShoeBomService.exportPDFVwAcShoeBom(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      "",
      "",
      true
    );
   res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=VW_AC_SHOEBOM_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Export PDF failed" });
  }
}

async function exportMaterialToExcel(req, res) {
  try {
    const filename = `material_tracking_${Date.now()}.xlsx`;
    const filters = {
      ...req.body,
      ...req.query,
      ...req.params,
    };
    console.log("filter", filters);

    if (!filters.orgId && !filters.factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: orgId or factory_code",
      });
    }
    const filePath = await vwAcShoeBomService.exportExcelMaterialABM(
      filename,
      filters
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).json({
      success: false,
      message: "Export failed",
      error: error.message,
    });
  }
}

async function exportCustomToExcel(req, res) {
  try {
    const filename = `custom_tracking_${Date.now()}.xlsx`;
    const filters = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    if (!filters.orgId && !filters.factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: orgId or factory_code",
      });
    }
    const filePath = await vwAcShoeBomService.exportExcelCustomABM(
      filename,
      filters
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).json({
      success: false,
      message: "Export failed",
      error: error.message,
    });
  }
}
module.exports = {
  getListOfASB,
  searchVwAcShoeBom,
  exportPDFVwAcShoeBom,
  exportMaterialToExcel,
  exportCustomToExcel,
};
