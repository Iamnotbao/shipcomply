// SE_PLAN_SIZE.controller.js
const { createSePlanSizeSchema } = require("./se_plan_size.create.dto");
const sePlanSizeService = require("./se_plan_size.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllSePlanSize(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    pack_gu,
    se_ver,
    se_seq,
    ship_seq,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sePlanSizeService.getAllSePlanSize(
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    pack_gu,
    se_ver,
    se_seq,
    ship_seq,
    language,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    tableName: "SE_PLAN_SIZE",
  });
}
async function confirmAll(req, res) {
  const {
   factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  } = req.query;
  const result = await sePlanSizeService.confirmAll(
    factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    tableName: "SE_PLAN_SIZE",
  });
}
async function getSizeCtns(req, res) {
  const { factory_code, se_id, pack_gu, se_seq, pk_seq, ship_seq, new_ctns } =
    req.query;
  try {
    const result = await sePlanSizeService.getSizeCtns(
      factory_code,
      se_id,
      pack_gu,
      se_seq,
      pk_seq,
      ship_seq,
      new_ctns,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.rows,
      hasMore: result.hasMore,
      tableName: "SE_PLAN_SIZE",
    });
  } catch (error) {
    console.log("error in se plan size controller", error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}
async function getSePlanSizeByID(req, res) {
  const { factory_code, se_id, se_ver, se_seq, pack_gu, ship_seq, pk_seq } =
    req.query;
  const result = await sePlanSizeService.getSePlanSizeByID(
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
    pk_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_SIZE",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_SIZE",
  });
}

async function addSePlanOrd(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSePlanSizeSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await sePlanSizeService.addSePlanOrd(
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
      message: "Add ac inm m tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac inm m because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editSePlanSize(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
    pk_seq,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
    pk_seq,
  };
  const { error, value } = createSePlanSizeSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const response = await sePlanSizeService.editSePlanOrd(
      factory_code,
      department_code,
      user_code,
      query_level,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
      pk_seq,
      value,
      page_size,
    );
    return res.status(200).json({
      message: "Edit Basic Data successfully!",
      success: true,
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Error edit Basic Data", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Edit Failed!",
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
    const lockKey = `SE_PLAN_SIZE:${factory_code}:${invoice_code}:${sort}`;
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

    const isDelete = await sePlanSizeService.deleteAcImp(
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
      table: "SE_PLAN_SIZE",
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

async function searchSePlanOrd(req, res) {
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
    const shoes = await sePlanSizeService.searchSePlanOrd(
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
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "SE_PLAN_SIZE",
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
    const filename = "SE_PLAN_SIZE.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await sePlanSizeService.exportPDF(
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
async function exportExcel(req, res) {
  try {
    const filename = "SE_PLAN_SIZE";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await sePlanSizeService.exportExcel(
      filename,
      search,
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
      `attachment; filename=SE_PLAN_SIZE_${Date.now()}.xlsx`,
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
    const filePath = await sePlanSizeService.exportExcelMaterialAcImp(
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
    const filePath = await sePlanSizeService.exportExcelCustomAcImp(
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
  getAllSePlanSize,
  getSePlanSizeByID,
  getSizeCtns,
  addSePlanOrd,
  editSePlanSize,
  exportPDF,
  deleteAcImp,
  searchSePlanOrd,
  exportExcel,
  exportMaterialToExcel,
  exportCustomToExcel,
  confirmAll
};
