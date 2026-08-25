const vwAcChgExmpService = require("./vw_chg_exmp.service");
const fs = require("fs");

async function getListOfVCE(req, res) {
  const { factory_code, cont_no, language, limit, offset } = req.query;
  const result = await vwAcChgExmpService.getListOfVCE(
    factory_code,
    cont_no,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_CONT_IMP",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "VW_CONT_IMP",
  });
}

async function searchVwAcContImp(req, res) {
  const { search } = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  try {
    const shoes = await vwAcChgExmpService.searchVwAcContImp(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
    );
    return res.json({
      message: "search vw cont imp successfully!",
      success: true,
      data: shoes,
      tableName: "VW_CONT_IMP",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelVwAcCI(req, res) {
  try {
    const filename = "VW_AC_CONT_IMP";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { filters } = req.body;
    const workbook = await vwAcChgExmpService.exportExcelVwAcCI(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      filters,
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
    const filePath = await vwAcChgExmpService.exportExcelMaterialABM(
      filename,
      filters,
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
    const filePath = await vwAcChgExmpService.exportExcelCustomABM(
      filename,
      filters,
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
  getListOfVCE,
  searchVwAcContImp,
  exportExcelVwAcCI,
  exportMaterialToExcel,
  exportCustomToExcel,
};
