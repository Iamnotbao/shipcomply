const vwAcChkTSerivce = require("./vw_ac_chk_t.service");
const fs = require("fs");

async function getCont(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await vwAcChkTSerivce.getCont(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_AC_CHGSUM ",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result,
    tableName: "VW_AC_CHGSUM ",
  });
}
async function getAllVwAcChkT(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    ac_itemno,
    language,
    limit,
    offset,
  } = req.query;
  const result = await vwAcChkTSerivce.getAllVwAcChkT(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    ac_itemno,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_AC_CHGSUM ",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.data,
    hasMore: result.hasMore,
    total: result.count,
    tableName: "VW_AC_CHGSUM ",
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
    const result = await vwAcChkTSerivce.fetchFieldDropdown(
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
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function fetchInAcno(req, res) {
  try {
    const { factory_code, src, out_dtype, matd_no, page, limit, search } =
      req.query;
    const result = await vwAcChkTSerivce.fetchInAcno(
      factory_code,
      src,
      out_dtype,
      matd_no,
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
      tableName: "VW_AC_CHGSUM ",
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
    const result = await vwAcChkTSerivce.fetchInCont(
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
      tableName: "VW_AC_CHGSUM ",
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
    const result = await vwAcChkTSerivce.copyCont(
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
        tableName: "VW_AC_CHGSUM ",
      });
    }
    return res.status(200).json({
      message: "Get  vw ac cont imp by factory successfully!",
      success: true,
      data: result,
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_AC_CHGSUM ",
    });
  }
}
async function extendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, language } =
    req.query;
  const { filters } = req.body;

  try {
    const result = await vwAcChkTSerivce.extendCont(
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
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      success: false,
      message: error.message,
      blocked: true,
      tableName: "VW_AC_CHGSUM ",
    });
  }
}
async function confirmExtendCont(req, res) {
  const { factory_code, department_code, user_code, query_level, cont_no } =
    req.query;
  try {
    const result = await vwAcChkTSerivce.confirmExtendCont(
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
        tableName: "VW_AC_CHGSUM ",
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
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      tableName: "VW_AC_CHGSUM ",
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
    const shoes = await vwAcChkTSerivce.searchVwAcContImp(
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
      tableName: "VW_AC_CHGSUM ",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportExcel(req, res) {
  try {
    const filename = "VW_AC_CHK_T.xlsx";
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      ac_no,
      ac_itemno,
    } = req.query;
    const workbook = await vwAcChkTSerivce.exportExcel(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      ac_no,
      ac_itemno,
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
    const filePath = await vwAcChkTSerivce.exportExcelMaterialABM(
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
    const filePath = await vwAcChkTSerivce.exportExcelCustomABM(
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
  getAllVwAcChkT,
  fetchFieldDropdown,
  fetchInAcno,
  fetchInCont,
  extendCont,
  confirmExtendCont,
  searchVwAcContImp,
  exportExcel,
  exportMaterialToExcel,
  exportCustomToExcel,
};
