const vwAcReqDService = require("./vw_acreq_d.service");
const fs = require("fs");

async function getListOfVARD(req, res) {
  const {
  factory_code,
  department_code,
  user_code,
  query_level,
  com_invoice,
  language,
  limit,
  offset,
  } = req.query;
  const result = await vwAcReqDService.getListOfVARD(
   factory_code,
  department_code,
  user_code,
  query_level,
  com_invoice,
  language,
  limit,
  offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_ACREQ_D",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    total: result.count,
    tableName: "VW_ACREQ_D",
  });
}
async function getCIContract(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
    language,
  } = req.query;
  const result = await vwAcReqDService.getCIContract(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_ACREQ_D",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    tableName: "VW_ACREQ_D",
  });
}
async function copyCont(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
  } = req.query;
  console.log(
    "nhin cmm",
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
  );

  try {
    const result = await vwAcReqDService.copyCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      old_cont_no,
      new_cont_no,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot get list of vw ac cont imp!",
        success: false,
        tableName: "VW_ACREQ_D",
      });
    }
    return res.status(200).json({
      message: "Get  vw ac cont imp by factory successfully!",
      success: true,
      data: result,
      tableName: "VW_ACREQ_D",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_ACREQ_D",
    });
  }
}
async function extendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, language } =
    req.query;
  const { filters } = req.body;

  try {
    const result = await vwAcReqDService.extendCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      filters,
      language,
    );

    return res.status(200).json({
      success: true,
      message: "Contract extension validation completed",
      requireConfirmation: result.requireConfirmation,
      alertMessage: result.alertMessage,
      confirmMessage: result.confirmMessage,
      data: {
        cont_no: result.cont_no,
        duplicateFound: result.duplicateFound,
      },
      tableName: "VW_ACREQ_D",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      success: false,
      message: error.message,
      blocked: true,
      tableName: "VW_ACREQ_D",
    });
  }
}
async function confirmExtendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, cont_no } =
    req.query;
  try {
    const result = await vwAcReqDService.confirmExtendCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot get list of vw ac cont imp!",
        success: false,
        tableName: "VW_ACREQ_D",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Contract extended successfully",
      data: {
        cont_no: result.cont_no,
        new_status: result.status,
        last_user: user_code,
      },
      tableName: "VW_ACREQ_D",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_ACREQ_D",
    });
  }
}
async function searchVwChgM(req, res) {
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
    const shoes = await vwAcReqDService.searchVwChgM(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
      limit,
      offset,
    );
    return res.json({
      message: "search vw cont imp successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "VW_CHG_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelVwAcCI(req, res) {
  try {
    const filename = "VW_AC_CONT_IMP";
    const { factory_code, department_code, user_code, query_level, lanaguage } =
      req.query;
    const { filters } = req.body;
    const workbook = await vwAcReqDService.exportExcelVwAcCI(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      lanaguage,
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
    const filePath = await vwAcReqDService.exportExcelMaterialABM(
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
    const filePath = await vwAcReqDService.exportExcelCustomABM(
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
  getListOfVARD,
  copyCont,
  getCIContract,
  extendCont,
  confirmExtendCont,
  searchVwChgM,
  exportExcelVwAcCI,
  exportMaterialToExcel,
  exportCustomToExcel,
};
