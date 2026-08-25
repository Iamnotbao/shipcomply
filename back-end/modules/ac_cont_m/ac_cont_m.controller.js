// ac_cont_m.controller.js
const { createAcContMSchema } = require("./ac_cont_m.create.dto");
const acContMService = require("./ac_cont_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllAcContM(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await acContMService.getAllAcContM(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_CONT_M",
  });
}
async function confirmAll(req, res) {
  const { factory_code, department_code, user_code, query_level, cont_no } =
    req.query;
  let result;
  try {
    result = await acContMService.confirmAll(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
    );
    return res.status(200).json({
      message: result?.message,
      success: result?.success,
      tableName: "AC_CONT_M",
    });
  } catch (error) {
    return res.status(500).json({
      message: result?.message,
      success: result?.success,
      tableName: "AC_CONT_M",
    });
  }
}
async function getAllAcContMWithView(req, res) {
  const { factory_code, department_code, user_code, query_level, language } =
    req.query;
  const result = await acContMService.getAllAcContMWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_CONT_M",
  });
}

async function getAcContMByID(req, res) {
  const { factory_code, cont_no } = req.query;
  const result = await acContMService.getAcContMByID(factory_code, cont_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single contract master!",
      success: false,
      tableName: "AC_CONT_M",
    });
  }
  return res.status(200).json({
    message: "Get single contract master successfully!",
    success: true,
    data: result,
    tableName: "AC_CONT_M",
  });
}
async function getFieldByPVM(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      category_code,
      vend_no,
      language,
      page,
      limit,
      search,
      is_status,
    } = req.query;
        console.log("dddd",is_status);
    const result = await acContMService.getFieldByPVM(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      category_code,
      vend_no,
      language,
      page,
      limit,
      search,
      is_status,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "PO_VENDER_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getBank(req, res) {
  try {
    const { factory_code, field } = req.query;

    if (!factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: factory_code",
      });
    }
    const result = await acContMService.getBank(factory_code, field);
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_CONT_M",
    });
  } catch (error) {
    console.error("Error fetching bank parameter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getBigCont(req, res) {
  try {
    const { factory_code, page, limit, search } = req.query;
    const { data } = req.body;
    if (!factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: factory_code",
      });
    }
    const result = await acContMService.getBigCont(
      factory_code,
      data,
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
      tableName: "VW_CONT_IMP",
    });
  } catch (error) {
    console.error("Error fetching big contract number:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getBigContNoExmp(req, res) {
  try {
    const { factory_code, page, limit, search } = req.query;
    const { data } = req.body;
    if (!factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: factory_code",
      });
    }
    const result = await acContMService.getBigContNoExmp(
      factory_code,
      data,
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
      tableName: "VW_CONT_IMP",
    });
  } catch (error) {
    console.error("Error fetching big contract number:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function addAcContM(req, res) {
  const {
    page_size,
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_type,
  } = req.query;
  const { data } = req.body;
  const { error, value } = createAcContMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acContMService.addAcContM(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_type,
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
      message: "Add contract master successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add contract master because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editAcContM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
      page_size,
      cont_type,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      cont_no,
    };

    const { error, value } = createAcContMSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const response = await acContMService.editAcContM(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_type,
      cont_no,
      value,
      page_size,
      t,
    );

    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit contract master",
      });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit contract master successfully!",
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

async function deleteAcContM(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, cont_no } = req.query;
    const { lock_info } = req.body;

    // Kiểm tra lock trước khi xóa
    const io = req.app.get("io");
    const activeLocks = io.activeLocks || new Map();
    const lockKey = `AC_CONT_M:${factory_code}:${cont_no}`;
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

    const isDelete = await acContMService.deleteAcContM(
      factory_code,
      cont_no,
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
      table: "AC_CONT_M",
      primaryKey: { factory_code, cont_no },
      lock_info: lock_info,
    });

    return res.status(200).json({
      success: true,
      message: "Delete contract master successfully!",
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

async function searchAcContM(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const contracts = await acContMService.searchAcContM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "Search contract master successfully!",
      success: true,
      data: contracts,
      tableName: "AC_CONT_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function exportExcelAcContM(req, res) {
  try {
    const filename = "AC_CONT_M";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acContMService.exportExcelAcContM(
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
      `attachment; filename=AC_CONT_M_${Date.now()}.xlsx`,
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

module.exports = {
  getAllAcContM,
  getAllAcContMWithView,
  getFieldByPVM,
  getBank,
  getBigCont,
  getBigContNoExmp,
  getAcContMByID,
  addAcContM,
  editAcContM,
  deleteAcContM,
  searchAcContM,
  exportExcelAcContM,
  confirmAll
};
