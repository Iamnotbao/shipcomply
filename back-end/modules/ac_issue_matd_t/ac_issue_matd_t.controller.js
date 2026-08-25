// AC_CONT_D.controller.js
const { createAcIssueMatdTSchema } = require("./ac_issue_matd_t.create.dto");
const acIssueMatdTService = require("./ac_issue_matd_t.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllAIMT(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_no,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acIssueMatdTService.getAllAIMT(
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_no,
    language,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_ISSUE_MATD_T",
  });
}
async function getAllAPDWithView(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  } = req.query;
  const result = await acIssueMatdTService.getAllAPDWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_ISSUE_MATD_T",
  });
}
async function getAllAPDMarkBWithView(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  } = req.query;
  const result = await acIssueMatdTService.getAllAPDMarkBWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    ac_no,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_ISSUE_MATD_T_1",
  });
}
async function getAcIssueMatdTByID(req, res) {
  const { factory_code, conf_seq, matd_seq } = req.query;
  const result = await acIssueMatdTService.getAcIssueMatdTByID(
    factory_code,
    conf_seq,
    matd_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "AC_ISSUE_MATD_T",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "AC_ISSUE_MATD_T",
  });
}
async function getSum(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      ac_no,
    } = req.query;

    const result = await acIssueMatdTService.getSum(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      ac_no,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_ISSUE_MATD_T",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getUnitByGoodsCode(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      goods_code,
      page,
      limit,
      search,
    } = req.query;

    const result = await acIssueMatdTService.getUnitByGoodsCode(
      factory_code,
      department_code,
      user_code,
      query_level,
      goods_code,
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
      tableName: "AC_ISSUE_MATD_T",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function editAIMT(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      conf_seq,
      matd_seq,
      acProcD,
      pageSize,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      conf_seq,
      matd_seq,
    };
    const { error, value } = createAcIssueMatdTSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acIssueMatdTService.editAIMT(
      factory_code,
      department_code,
      user_code,
      query_level,
      conf_seq,
      matd_seq,
      value,
      pageSize,
      t,
    );

    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit import material tracking",
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Edit import material tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot edit from controller!", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteAcImp(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, invoice_code, sort } = req.query;
    const { lock_info } = req.body;

    // Kiểm tra lock trước khi xóa
    const io = req.app.get("io");
    const activeLocks = io.activeLocks || new Map();
    const lockKey = `AC_CONT_D:${factory_code}:${invoice_code}:${sort}`;
    const existingLock = activeLocks.get(lockKey);

    if (existingLock && existingLock.lock_info !== lock_info) {
      await t.rollback();
      const lockDetails = parseLockInfo(existingLock.lock_info);
      return res.status(423).json({
        success: false,
        message:
          "Cannot delete. Record is currently being edited by another user",
        locked: true,
        lockedBy: existingLock.lock_info,
        lockDetails: lockDetails,
      });
    }

    const isDelete = await acIssueMatdTService.deleteAcImp(
      factory_code,
      invoice_code,
      sort,
      t,
    );

    if (!isDelete) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot delete because null!",
      });
    }

    await t.commit();

    // Emit event về việc xóa
    io.emit("record-deleted", {
      table: "AC_CONT_D",
      primaryKey: { factory_code, invoice_code, sort },
      lock_info: lock_info,
    });

    return res.status(200).json({
      success: true,
      message: "Delete import material tracking successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function searchAcImp(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await acIssueMatdTService.searchAcImp(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes,
      tableName: "AC_ISSUE_MATD_T",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function exportExcelAcImp(req, res) {
  try {
    const filename = "AC_CONT_D";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acIssueMatdTService.exportExcelAcImp(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_CONT_D_${Date.now()}.xlsx`,
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
    const filePath = await acIssueMatdTService.exportExcelMaterialAcImp(
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
    const filePath = await acIssueMatdTService.exportExcelCustomAcImp(
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
async function confirmAll(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    matd_seq,
  } = req.query;
  let result;
  try {
    result = await acIssueMatdTService.confirmAll(
      factory_code,
      department_code,
      user_code,
      query_level,
      conf_seq,
      matd_seq,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      tableName: "AC_ISSUE_MATD_T",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: result?.success,
      message: result?.message,
    });
  }
}
module.exports = {
  getAllAIMT,
  getAllAPDWithView,
  getAllAPDMarkBWithView,
  getAcIssueMatdTByID,
  getSum,
  getUnitByGoodsCode,
  editAIMT,
  deleteAcImp,
  searchAcImp,
  exportExcelAcImp,
  exportMaterialToExcel,
  exportCustomToExcel,
  confirmAll
};
