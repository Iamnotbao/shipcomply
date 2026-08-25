// AC_INM_M.controller.js
const createAcChgMSchema = require("./ac_chg_m.create.dto");
const acChgMService = require("./ac_chg_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}
async function getAllAcChgM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acChgMService.getAllAcChgM(
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
    tableName: "AC_CHG_M",
  });
}
async function checkDuplicateAGO(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_chgno,
    out_date,
    ac_no,
  } = req.query;
  let result;
  try {
    result = await acChgMService.checkDuplicateAGO(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_chgno,
      out_date,
      ac_no,
    );
    return res.status(200).json({
      success: result?.success,
      message: result?.message,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: result?.success,
      message: result?.message,
    });
  }
}
async function confirmAll(req, res) {
  const { factory_code, department_code, user_code, query_level, ac_no, type } =
    req.query;
  let result;
  try {
    result = await acChgMService.confirmAll(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      type,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: result?.success,
      message: result?.message,
    });
  }
}
async function getFieldDropdown(req, res) {
  try {
    const { factory_code, field, page, limit, search } = req.query;
    const result = await acChgMService.getFieldDropdown(
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
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function generateAcno(req, res) {
  const { factory_code, department_code, user_code, query_level, type } =
    req.query;
  const result = await acChgMService.generateAcno(
    factory_code,
    department_code,
    user_code,
    query_level,
    type,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_CHG_M",
  });
}

async function getAcChgMByID(req, res) {
  const { factory_code, ac_no } = req.query;
  const result = await acChgMService.getAcChgMByID(factory_code, ac_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac chg m !",
      success: false,
      tableName: "AC_CHG_M",
    });
  }
  return res.status(200).json({
    message: "Get single ac chg m  successfully!",
    success: true,
    data: result,
    tableName: "AC_CHG_M",
  });
}

async function addAcChgM(req, res) {
  const {
    page_size,
    factory_code,
    department_code,
    user_code,
    query_level,
    type,
  } = req.query;
  const { data } = req.body;
  const { error, value } = createAcChgMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acChgMService.addAcChgM(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
      type,
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

async function editAcChgM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    page_size,
    type,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    ac_no,
  };
  const { error, value } = createAcChgMSchema.validate(dataToValidate);
  if (error) {
    console.log("erroara", error);
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acChgMService.editAcChgM(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      value,
      page_size,
      t,
      type,
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

    const isDelete = await acChgMService.deleteAcImp(
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

async function searchAcInmM(req, res) {
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
    const shoes = await acChgMService.searchAcInmM(
      search,
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
      tableName: "AC_CHG_M",
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
    const pdf = await acChgMService.exportPDF(
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
async function exportPDFChgDToExcel(req, res) {
  try {
    const filename = "ac_chg_d.pdf";
    const { factory_code, department_code, user_code, query_level, ac_no } =
      req.query;
    const pdf = await acChgMService.exportPDFChgDToExcel(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
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
async function exportPDFChgDToExcelWithName(req, res) {
  try {
    const filename = "ac_chg_d.pdf";
    const { factory_code, department_code, user_code, query_level, ac_no } =
      req.query;
    const pdf = await acChgMService.exportPDFChgDToExcelWithName(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
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
async function exportPDFItems(req, res) {
  try {
    const filename = "ac_chg_d.pdf";
    const pdf = await acChgMService.exportPDFItems(filename);
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
async function exportExcelAcChgM(req, res) {
  try {
    const filename = "AC_CHG_M";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await acChgMService.exportExcelAcChgM(
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

async function exportExcelAcChgMToTransfer(req, res) {
  try {
    const filename = "AC_CHG_M";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await acChgMService.exportExcelAcChgMToTransfer(
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
    const filePath = await acChgMService.exportExcelCustomAcImp(
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
async function activateAcCM(req, res) {
  const { factory_code, user_code, ac_no, curr_rate, language } = req.query;
  try {
    const result = await acChgMService.activateAcCM(
      factory_code,
      user_code,
      ac_no,
      curr_rate,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function activateAcCMExp(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acChgMService.activateAcCMExp(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function cancelActivateAcCM(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acChgMService.cancelActivateAcCM(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function cancelActivateAcCMExp(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acChgMService.cancelActivateAcCMExp(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function closeAcCM(req, res) {
  const { factory_code, ac_no, user_code } = req.query;
  try {
    const result = await acChgMService.closeAcCM(
      factory_code,
      ac_no,
      user_code,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function voidAllAcCM(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acChgMService.voidAllAcCM(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function voidAllAcCMExp(req, res) {
  const { factory_code, ac_no, user_code, language } = req.query;
  try {
    const result = await acChgMService.voidAllAcCMExp(
      factory_code,
      ac_no,
      user_code,
      language,
    );
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function confirmPassD(req, res) {
  const { factory_code, ac_no, out_date } = req.query;
  try {
    const result = await acChgMService.confirmPassD(
      factory_code,
      ac_no,
      out_date,
    );
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_CHG_M",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function refreshGrossW(req, res) {
  const { factory_code, ac_no } = req.query;
  try {
    const result = await acChgMService.refreshGrossW(factory_code, ac_no);
    return res.json({
      message: result?.message,
      success: true,
      tableName: "AC_CHG_M",
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
  getAllAcChgM,
  getAcChgMByID,
  generateAcno,
  addAcChgM,
  editAcChgM,
  exportPDF,
  deleteAcImp,
  searchAcInmM,
  exportExcelAcChgM,
  exportExcelAcChgMToTransfer,
  exportCustomToExcel,
  activateAcCM,
  cancelActivateAcCM,
  closeAcCM,
  voidAllAcCM,
  activateAcCMExp,
  cancelActivateAcCMExp,
  refreshGrossW,
  voidAllAcCMExp,
  confirmPassD,
  exportPDFChgDToExcel,
  exportPDFChgDToExcelWithName,
  exportPDFItems,
  getFieldDropdown,
  confirmAll,
  checkDuplicateAGO,
};
