// AC_INM_M.controller.js
const { createAcExpectMSchema } = require("./ac_expect_m.create.dto");
const acExpectMService = require("./ac_expect_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
async function getAllAcExpectM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acExpectMService.getAllAcExpectM(
    factory_code,
    department_code,
    user_code,
    query_level,
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
    tableName: "AC_EXPECT_M",
  });
}
async function getFieldDropdown(req, res) {
  try {
    const { factory_code, field, page, limit, search } = req.query;
    const result = await acExpectMService.getFieldDropdown(
      factory_code,
      field,
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
      tableName: "AC_EXPECT_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function generateExpectId(req, res) {
  const { factory_code } = req.query;
  const result = await acExpectMService.generateExpectId(factory_code);
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_EXPECT_M",
  });
}

async function getAcExpectMByID(req, res) {
  const { factory_code, expect_id } = req.query;
  const result = await acExpectMService.getAcExpectMByID(
    factory_code,
    expect_id,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac expect m !",
      success: false,
      tableName: "AC_EXPECT_M",
    });
  }
  return res.status(200).json({
    message: "Get single ac expect m  successfully!",
    success: true,
    data: result,
    tableName: "AC_EXPECT_M",
  });
}

async function addAcExpectM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcExpectMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acExpectMService.addAcExpectM(
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
      message: "Add ac chg m  tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac chg m  because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editAcExpectM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    expect_id,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    expect_id,
  };
  const { error, value } = createAcExpectMSchema.validate(dataToValidate);
  if (error) {
    console.log("erroara", error);
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acExpectMService.editAcExpectM(
      factory_code,
      department_code,
      user_code,
      query_level,
      expect_id,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Edit Failed!",
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Edit Basic Data successfully!",
      success: true,
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    await t.rollback();
    console.log("Error edit Basic Data", error);
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
    const lockKey = `AC_INM_M:${factory_code}:${invoice_code}:${sort}`;
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

    const isDelete = await acExpectMService.deleteAcImp(
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
      table: "AC_INM_M",
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

async function searchAcExpectM(req, res) {
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
    const shoes = await acExpectMService.searchAcExpectM(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_EXPECT_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


async function exportExcelShoeM(req, res) {
  try {
    const filename = "AC_EXPECT_M";
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      expect_id,
    } = req.query;
    const workbook = await acExpectMService.exportExcelShoeM(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      expect_id,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_EXPECT_M_${Date.now()}.xlsx`,
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
async function exportExcelWriteoff(req, res) {
  try {
    const filename = "AC_EXPECT_M_1";
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      expect_id,
    } = req.query;
    const workbook = await acExpectMService.exportExcelWriteoff(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      expect_id,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_EXPECT_M_1_${Date.now()}.xlsx`,
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
async function genOrderMaterial(req, res) {
  const { factory_code, expect_id, user_code } = req.query;
  try {
    const result = await acExpectMService.genOrderMaterial(
      factory_code,
      expect_id,
      user_code,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_EXPECT_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function calculateWriteoff(req, res) {
  const { factory_code, expect_id, user_code } = req.query;
  try {
    const result = await acExpectMService.calculateWriteoff(
      factory_code,
      expect_id,
      user_code,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_EXPECT_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getAllAcExpectM,
  getAcExpectMByID,
  generateExpectId,
  addAcExpectM,
  editAcExpectM,
  deleteAcImp,
  searchAcExpectM,
  exportExcelWriteoff,
  exportExcelShoeM,
  genOrderMaterial,
  calculateWriteoff,
  getFieldDropdown,
};
