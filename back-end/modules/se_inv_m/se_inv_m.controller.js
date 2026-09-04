// SE_INV_M.controller.js
const createSeInvMSchema = require("./se_inv_m.create.dto");
const seInvMService = require("./se_inv_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllSeInvM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await seInvMService.getAllSeInvM(
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
    tableName: "SE_INV_M",
  });
}

async function getSeInvMByID(req, res) {
  const { factory_code, ac_no, invoice_id } = req.query;
  const result = await seInvMService.getSeInvMByID(
    factory_code,
    ac_no,
    invoice_id,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single se inv m!",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function updateInvoiceD(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.updateInvoiceD(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function updateHsC(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.updateHsC(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function updateNw(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;

  try {
    const result = await seInvMService.updateNw(
      factory_code,
      ac_no,
      invoice_id,
      user_code,
    );
    if (!result?.success) {
      return res.status(400).json({
        message: result?.message,
        success: false,
        data: result,
        tableName: "SE_INV_M",
      });
    }

    return res.status(200).json({
      message: "Updated NW/GW successfully!",
      success: true,
      data: result,
      tableName: "SE_INV_M",
    });
  } catch (error) {
    console.error("updateNw error:", error);

    return res.status(500).json({
      message: error?.message || "Internal server error",
      success: false,
      data: null,
      tableName: "SE_INV_M",
    });
  }
}
async function activeSeInvM(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.activeSeInvM(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function cancelActiveSeInvM(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.cancelActiveSeInvM(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function voidAllSeInvM(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.voidAllSeInvM(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function closeSeInvM(req, res) {
  const { factory_code, ac_no, invoice_id, user_code } = req.query;
  const result = await seInvMService.closeSeInvM(
    factory_code,
    ac_no,
    invoice_id,
    user_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function getSiSeq(req, res) {
  const { factory_code, cust_id, department_code, user_code, query_level } =
    req.query;
  const result = await seInvMService.getSiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single se inv m!",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function getInvoiceDropdown(req, res) {
  try {
    const { factory_code, page, limit, search } = req.query;
    const result = await seInvMService.getInvoiceDropdown(
      factory_code,
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
      tableName: "SE_INV_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getPackingSeid(req, res) {
  const { factory_code, invoice_no } = req.query;
  const result = await seInvMService.getPackingSeid(factory_code, invoice_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single se inv m!",
      success: false,
      tableName: "SE_INV_M",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "SE_INV_M",
  });
}
async function addSeInvM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSeInvMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await seInvMService.addSeInvM(
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
      message: "Add se inv m tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add se inv m because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editSeInvM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    invoice_id,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    ac_no,
    invoice_id,
  };
  const { error, value } = createSeInvMSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await seInvMService.editSeInvM(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_no,
      invoice_id,
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
    const lockKey = `SE_INV_M:${factory_code}:${invoice_code}:${sort}`;
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

    const isDelete = await seInvMService.deleteAcImp(
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
      table: "SE_INV_M",
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

async function searchSeInvM(req, res) {
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
    const shoes = await seInvMService.searchSeInvM(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "SE_INV_M",
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
    const filename = "SE_INV_M.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await seInvMService.exportPDF(
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
    const filename = "SE_INV_M";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await seInvMService.exportExcel(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SE_INV_M_${Date.now()}.xlsx`,
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
    const filePath = await seInvMService.exportExcelMaterialAcImp(
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
    const filePath = await seInvMService.exportExcelCustomAcImp(
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
async function exportPDFToPakingList(req, res) {
  try {
    const filename = "Paking List.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await seInvMService.exportPDFToPakingList(
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
module.exports = {
  getAllSeInvM,
  getSeInvMByID,
  getSiSeq,
  addSeInvM,
  editSeInvM,
  exportPDF,
  deleteAcImp,
  searchSeInvM,
  exportExcel,
  exportMaterialToExcel,
  exportCustomToExcel,
  updateInvoiceD,
  updateHsC,
  updateNw,
  activeSeInvM,
  cancelActiveSeInvM,
  voidAllSeInvM,
  closeSeInvM,
  getInvoiceDropdown,
  getPackingSeid,
  exportPDFToPakingList,
};
