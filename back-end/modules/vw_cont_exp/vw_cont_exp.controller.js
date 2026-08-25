const vwAcContImpService = require("./vw_cont_exp.service");
const fs = require("fs");

async function getCont(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    page,
    search,
  } = req.query;
  const result = await vwAcContImpService.getCont(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    page,
    search,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont exp!",
      success: false,
      tableName: "VW_CONT_EXP",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont exp by factory successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "VW_CONT_EXP",
  });
}
async function getCIContract(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await vwAcContImpService.getCIContract(
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
      tableName: "VW_CONT_EXP",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    total: result.count,
    tableName: "VW_CONT_EXP",
  });
}
async function fetchFieldDropdown(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
      page,
      limit,
      search,
    } = req.query;
    const result = await vwAcContImpService.fetchFieldDropdown(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
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
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function fetchMinCont(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
      page,
      limit,
      search,
    } = req.query;
    const result = await vwAcContImpService.fetchMinCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
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
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function fetchInCont(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      page,
      limit,
      search,
      mark,
      vend_no,
      d_type,
    } = req.query;
    const result = await vwAcContImpService.fetchInCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      page,
      limit,
      search,
      mark,
      vend_no,
      d_type,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function copyCont(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
    limit,
  } = req.query;
  console.log(
    "nhin cmm",
    factory_code,
    department_code,
    user_code,
    query_level,
    old_cont_no,
    new_cont_no,
    limit
  );

  try {
    const result = await vwAcContImpService.copyCont(
      factory_code,
      department_code,
      user_code,
      query_level,
      old_cont_no,
      new_cont_no,
       limit,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot get list of vw ac cont imp!",
        success: false,
        tableName: "VW_CONT_EXP",
      });
    }
    return res.status(200).json({
      message: "Get  vw ac cont imp by factory successfully!",
      success: true,
      data: result,
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_CONT_EXP",
    });
  }
}
async function extendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, language } =
    req.query;
  const { filters } = req.body;

  try {
    const result = await vwAcContImpService.extendCont(
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
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      success: false,
      message: error.message,
      blocked: true,
      tableName: "VW_CONT_EXP",
    });
  }
}
async function confirmExtendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, cont_no } =
    req.query;
  try {
    const result = await vwAcContImpService.confirmExtendCont(
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
        tableName: "VW_CONT_EXP",
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
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_CONT_EXP",
    });
  }
}
async function updateLastExpDate(req, res) {
  const { factory_code, department_code, user_code, query_level, cont_no } =
    req.query;
  const { data } = req.body;
  try {
    const result = await vwAcContImpService.updateLastExpDate(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
      data,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot get list of vw ac cont imp!",
        success: false,
        tableName: "VW_CONT_EXP",
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
      tableName: "VW_CONT_EXP",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_CONT_EXP",
    });
  }
}
async function searchVwAcContImp(req, res) {
  const { search } = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  try {
    const shoes = await vwAcContImpService.searchVwAcContImp(
      factory_code,
      department_code,
      user_code,
      query_level,
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
      tableName: "VW_CONT_EXP",
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
    const workbook = await vwAcContImpService.exportExcelVwAcCI(
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
    const filePath = await vwAcContImpService.exportExcelMaterialABM(
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
    const filePath = await vwAcContImpService.exportExcelCustomABM(
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
  getCont,
  copyCont,
  updateLastExpDate,
  getCIContract,
  fetchFieldDropdown,
  fetchMinCont,
  fetchInCont,
  extendCont,
  confirmExtendCont,
  searchVwAcContImp,
  exportExcelVwAcCI,
  exportMaterialToExcel,
  exportCustomToExcel,
};
