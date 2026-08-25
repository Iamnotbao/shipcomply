const chgMService = require("./chg_m.service");
const fs = require("fs");

async function getListOfChgM(req, res) {
  const { factory_code, language, limit, offset } = req.query;
  const result = await chgMService.getListOfChgM(
    factory_code,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "CHG_M",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "CHG_M",
  });
}
async function checkBox(req, res) {
  const { factory_code, ac_no, is_check, language } = req.query;
  const { filters, isAll } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await chgMService.checkBox(
    factory_code,
    ac_no,
    is_check,
    token,
    filters,
    isAll,
    language,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single chg m!",
      success: false,
      tableName: "CHG_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function autoAdd(req, res) {
  const { factory_code, language, user_code } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await chgMService.autoAdd(
    factory_code,
    language,
    user_code,
    token,
  );
  if (result.success === false) {
    return res.status(401).json({
      message: result.message,
      success: result.success,
      tableName: "CHG_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "CHG_M",
  });
}
async function getSeInvSelections(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await chgMService.getSeInvSelections(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get temp table!",
      success: false,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get temp table successfully!",
    success: true,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function clearSeInvSession(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await chgMService.clearSeInvSession(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot clear temp table!",
      success: false,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Clear temp table successfully!",
    success: true,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function searchChgM(req, res) {
  const { search } = req.body;
  const { factory_code, language, limit, offset } = req.query;
  try {
    const shoes = await chgMService.searchChgM(
      factory_code,
      language,
      search,
      limit,
      offset,
    );
    return res.json({
      message: "search vw cont imp successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "CHG_M",
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
    const workbook = await chgMService.exportExcelVwAcCI(
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
    const filePath = await chgMService.exportExcelMaterialABM(
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
    const filePath = await chgMService.exportExcelCustomABM(filename, filters);

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
  getListOfChgM,
  searchChgM,
  checkBox,
  autoAdd,
  getSeInvSelections,
  clearSeInvSession,
  exportExcelVwAcCI,
  exportMaterialToExcel,
  exportCustomToExcel,
};
