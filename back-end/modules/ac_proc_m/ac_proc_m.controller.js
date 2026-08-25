// AC_INM_M.controller.js
const createAcProcMSchema = require("./ac_proc_m.create.dto");
const acProcMService = require("./ac_proc_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}
async function getAllAcProcM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acProcMService.getAllAcProcM(
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
    tableName: "AC_PROC_M",
  });
}
async function confirmAll(req, res) {
  const { factory_code, department_code, user_code, query_level, ac_no } =
    req.query;
  let result;
  try {
    result = await acProcMService.confirmAll(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.rows,
      total: result.count,
      hasMore: result.hasMore,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    return res.status(500).json({
      success: result?.success,
      message: result?.message,
    });
  }
}
async function getAllAcProcMMarkB(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acProcMService.getAllAcProcMMarkB(
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
    tableName: "AC_PROC_M_1",
  });
}
async function generateAcno(req, res) {
  const { factory_code, department_code, user_code, query_level, mark } =
    req.query;
  const result = await acProcMService.generateAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
    mark,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_PROC_M",
  });
}

async function getAcProcMByID(req, res) {
  const { factory_code, ac_no } = req.query;
  const result = await acProcMService.getAcProcMByID(factory_code, ac_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac chg m !",
      success: false,
      tableName: "AC_PROC_M",
    });
  }
  return res.status(200).json({
    message: "Get single ac chg m  successfully!",
    success: true,
    data: result,
    tableName: "AC_PROC_M",
  });
}

async function addAcProcM(req, res) {
  const {
    page_size,
    mark,
    factory_code,
    department_code,
    user_code,
    query_level,
  } = req.query;
  const { data } = req.body;
  const { error, value } = createAcProcMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acProcMService.addAcProcM(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      mark,
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

async function editAcProcM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    page_size,
    mark,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    ac_no,
  };
  const { error, value } = createAcProcMSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acProcMService.editAcProcM(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      value,
      page_size,
      mark,
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

    const isDelete = await acProcMService.deleteAcImp(
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

async function searchAcProcM(req, res) {
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
    const shoes = await acProcMService.searchAcProcM(
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
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function searchAcProcMForMarkB(req, res) {
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
    const shoes = await acProcMService.searchAcProcMForMarkB(
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
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function exportPDF(req, res) {
  try {
    const filename = "ac_inm_m.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acProcMService.exportPDF(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    res.download(pdf, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Export PDF failed" });
  }
}
async function exportExcelAcProcM(req, res) {
  try {
    const filename = "AC_PROC_M";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await acProcMService.exportExcelAcProcM(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_INM_M_${Date.now()}.xlsx`,
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
async function exportExcelAcProcMMarkB(req, res) {
  try {
    const filename = "AC_PROC_M";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await acProcMService.exportExcelAcProcMMarkB(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_INM_M_${Date.now()}.xlsx`,
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
    const filePath = await acProcMService.exportExcelMaterialAcImp(
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
    const filePath = await acProcMService.exportExcelCustomAcImp(
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
async function activateAcPM(req, res) {
  const { factory_code, user_code, ac_no, curr_rate, language } = req.query;
  try {
    const result = await acProcMService.activateAcPM(
      factory_code,
      user_code,
      ac_no,
      curr_rate,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function cancelActivateAcPM(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acProcMService.cancelActivateAcPM(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function closeAcPM(req, res) {
  const { factory_code, ac_no, user_code } = req.query;
  try {
    const result = await acProcMService.closeAcPM(
      factory_code,
      ac_no,
      user_code,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function voidAllAcPM(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acProcMService.voidAllAcPM(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }
}
async function activateAcPMMarkB(req, res) {
  const { factory_code, user_code, ac_no, language } = req.query;
  try {
    const result = await acProcMService.activateAcPMMarkB(
      factory_code,
      user_code,
      ac_no,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function cancelActivateAcPMMarkB(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acProcMService.cancelActivateAcPMMarkB(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function closeAcPMMarkB(req, res) {
  const { factory_code, ac_no, user_code } = req.query;
  try {
    const result = await acProcMService.closeAcPMMarkB(
      factory_code,
      ac_no,
      user_code,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function voidAllAcPMMarkB(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acProcMService.voidAllAcPMMarkB(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_PROC_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }
}
async function checkDuplicateAGEO(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_chgeno,
    out_date,
    ac_no,
  } = req.query;
  let result;
  try {
    result = await acProcMService.checkDuplicateAGEO(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_chgeno,
      out_date,
      ac_no,
    );
    return res.status(200).json({
      success: result?.success,
      message: result?.message,
      tableName: "AC_PROC_M",
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
  getAllAcProcM,
  getAcProcMByID,
  getAllAcProcMMarkB,
  generateAcno,
  addAcProcM,
  editAcProcM,
  exportPDF,
  deleteAcImp,
  searchAcProcM,
  searchAcProcMForMarkB,
  exportExcelAcProcM,
  exportExcelAcProcMMarkB,
  exportMaterialToExcel,
  exportCustomToExcel,
  activateAcPM,
  cancelActivateAcPM,
  closeAcPM,
  voidAllAcPM,
  activateAcPMMarkB,
  cancelActivateAcPMMarkB,
  closeAcPMMarkB,
  voidAllAcPMMarkB,
  confirmAll,
  checkDuplicateAGEO
};
