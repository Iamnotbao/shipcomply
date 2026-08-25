// AC_CONT_D.controller.js
const { createAcDescProcSchema } = require("./ac_desc_proc.create.dto");
const acDescProcService = require("./ac_desc_proc.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllADP(req, res) {
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
  const result = await acDescProcService.getAllADP(
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
    tableName: "AC_DESC_PROC",
  });
}

async function getAcDescProcByID(req, res) {
  const { factory_code, ac_no, seq } = req.query;
  const result = await acDescProcService.getAcDescProcByID(
    factory_code,
    ac_no,
    seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "AC_DESC_PROC",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "AC_DESC_PROC",
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

    const result = await acDescProcService.getSum(
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
      tableName: "AC_DESC_PROC",
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

    const result = await acDescProcService.getUnitByGoodsCode(
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
      tableName: "AC_DESC_PROC",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function addAcDescProc(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;

  const { error, value } = createAcDescProcSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acDescProcService.addAcDescProc(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
    );
    if (response.message) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: response.message,
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Add import material tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add import material tracking because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editAcDescProc(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      seq,
      pageSize,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      ac_no,
      seq,
    };
    const { error, value } = createAcDescProcSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acDescProcService.editAcDescProc(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      seq,
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

    const isDelete = await acDescProcService.deleteAcImp(
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
    const shoes = await acDescProcService.searchAcImp(
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
      tableName: "AC_DESC_PROC",
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
    const workbook = await acDescProcService.exportExcelAcImp(
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
    const filePath = await acDescProcService.exportExcelMaterialAcImp(
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
    const filePath = await acDescProcService.exportExcelCustomAcImp(
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
  getAllADP,
  getAcDescProcByID,
  getSum,
  getUnitByGoodsCode,
  addAcDescProc,
  editAcDescProc,
  deleteAcImp,
  searchAcImp,
  exportExcelAcImp,
  exportMaterialToExcel,
  exportCustomToExcel,
};
