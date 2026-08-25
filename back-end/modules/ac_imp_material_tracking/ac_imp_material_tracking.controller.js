// ac_imp_material_tracking.controller.js
const createAcImpMaterialTrackingSchema = require("./ac_imp_material_tracking.create.dto");
const acImpMaterialTrackingService = require("./ac_imp_material_tracking.service");
const sequelize = require("../../config/db");
const AC_IMP_MATERIAL_TRACKING = require("./ac_imp_material_tracking.model");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllAcImp(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acImpMaterialTrackingService.getAllAcImp(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_IMP_MATERIAL_TRACKING",
  });
}
async function getFieldDropDown(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      com_invoice,
      sort,
      page,
      limit,
      search,
    } = req.query;
    const result = await acImpMaterialTrackingService.getFieldDropDown(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      com_invoice,
      sort,
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
      tableName: "AC_IMP_MATERIAL_TRACKING",
    });
  } catch (error) {
    console.error("Error fetching field from AC_IMP_MATERIAL_TRACKING:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getCom(req, res) {
  try {
    const {
      factory_code,
      field,
      value,
      department_code,
      user_code,
      query_level,
      limit,
      page,
      search,
    } = req.query;
    const result = await acImpMaterialTrackingService.getCom(
      factory_code,
      field,
      value,
      department_code,
      user_code,
      query_level,
      limit,
      page,
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
      tableName: "AC_IMP_MATERIAL_TRACKING",
    });
  } catch (error) {
    console.error("Error fetching getcom:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getCol4(req, res) {
  try {
    const {
      factory_code,
      field,
      value,
      invoice_no,
      department_code,
      user_code,
      query_level,
    } = req.query;
    const result = await acImpMaterialTrackingService.getCol4(
      factory_code,
      field,
      value,
      invoice_no,
      department_code,
      user_code,
      query_level,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_IMP_MATERIAL_TRACKING",
    });
  } catch (error) {
    console.error("Error fetching getcom:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getSort(req, res) {
  try {
    const {
      factory_code,
      com_invoice,
      department_code,
      user_code,
      query_level,
    } = req.query;
    const result = await acImpMaterialTrackingService.getSort(
      factory_code,
      com_invoice,
      department_code,
      user_code,
      query_level,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_IMP_MATERIAL_TRACKING",
    });
  } catch (error) {
    console.error("Error fetching getcom:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getAcImpByID(req, res) {
  const { factory_code, invoice_no, sort } = req.query;
  const result = await acImpMaterialTrackingService.getAcImpByID(
    factory_code,
    invoice_no,
    sort,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "AC_IMP_MATERIAL_TRACKING",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "AC_IMP_MATERIAL_TRACKING",
  });
}

async function addAcImp(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcImpMaterialTrackingSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acImpMaterialTrackingService.addAcImp(
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

async function editAcImp(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      invoice_no,
      sort,
      pageSize,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      invoice_no,
      sort,
    };
    const { error, value } =
      createAcImpMaterialTrackingSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acImpMaterialTrackingService.editAcImp(
      factory_code,
      department_code,
      user_code,
      query_level,
      invoice_no,
      sort,
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
    const lockKey = `AC_IMP_MATERIAL_TRACKING:${factory_code}:${invoice_code}:${sort}`;
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

    const isDelete = await acImpMaterialTrackingService.deleteAcImp(
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
      table: "AC_IMP_MATERIAL_TRACKING",
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
    const shoes = await acImpMaterialTrackingService.searchAcImp(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_IMP_MATERIAL_TRACKING",
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
    const filename = "AC_IMP_MATERIAL_TRACKING";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acImpMaterialTrackingService.exportExcelAcImp(
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
      `attachment; filename=AC_IMP_MATERIAL_TRACKING_${Date.now()}.xlsx`,
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
    const filePath =
      await acImpMaterialTrackingService.exportExcelMaterialAcImp(
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
    const filePath = await acImpMaterialTrackingService.exportExcelCustomAcImp(
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
  getAllAcImp,
  getAcImpByID,
  getCom,
  getCol4,
  getFieldDropDown,
  getSort,
  addAcImp,
  editAcImp,
  deleteAcImp,
  searchAcImp,
  exportExcelAcImp,
  exportMaterialToExcel,
  exportCustomToExcel,
};
