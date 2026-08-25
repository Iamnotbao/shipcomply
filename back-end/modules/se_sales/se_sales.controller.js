// SE_SALES.controller.js
const createSeShipingMSchema = require("./se_sales.create.dto");
const seSalesService = require("./se_sales.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
async function getAllSeSales(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await seSalesService.getAllSeSales(
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
    tableName: "SE_SALES",
  });
}

async function getSeShippingMByID(req, res) {
  const { factory_code, cust_id, si_seq } = req.query;
  const result = await seSalesService.getSeShippingMByID(
    factory_code,
    cust_id,
    si_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_SALES",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_SALES",
  });
}
async function getSiSeq(req, res) {
  const { factory_code, cust_id, department_code, user_code, query_level } =
    req.query;
  const result = await seSalesService.getSiSeq(
    factory_code,
    cust_id,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_SALES",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_SALES",
  });
}
async function getFieldDataDropdown(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    language,
    page,
    limit,
    search,
  } = req.query;
  const result = await seSalesService.getFieldDataDropdown(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    language,
    page,
    limit,
    search,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_SALES",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "SE_SALES",
  });
}
async function addSeShipingM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSeShipingMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await seSalesService.addSeShipingM(
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

async function editSeShipingM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    cust_id,
    si_seq,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    cust_id,
    si_seq,
  };
  const { error, value } = createSeShipingMSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await seSalesService.editSeShipingM(
      factory_code,
      department_code,
      user_code,
      query_level,
      cust_id,
      si_seq,
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
    const lockKey = `SE_SALES:${factory_code}:${invoice_code}:${sort}`;
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

    const isDelete = await seSalesService.deleteAcImp(
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
      table: "SE_SALES",
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

async function searchSeSales(req, res) {
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
    const shoes = await seSalesService.searchSeSales(
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
      tableName: "SE_SALES",
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
    const filename = "SE_SALES.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await seSalesService.exportPDF(
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
    const filename = "SE_SALES";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await seSalesService.exportExcel(
      filename,
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SE_SALES_${Date.now()}.xlsx`,
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
async function exportExcel2(req, res) {
  try {
    const filename = "SE_SALES_2";
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      sales_id,
    } = req.query;
    const workbook = await seSalesService.exportExcel2(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      sales_id,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SE_SALES_${Date.now()}.xlsx`,
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
    const filePath = await seSalesService.exportExcelMaterialAcImp(
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
    const filePath = await seSalesService.exportExcelCustomAcImp(
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
  getAllSeSales,
  getSeShippingMByID,
  getSiSeq,
  addSeShipingM,
  editSeShipingM,
  exportPDF,
  deleteAcImp,
  searchSeSales,
  exportExcel,
  exportMaterialToExcel,
  exportCustomToExcel,
  exportExcel2,
  getFieldDataDropdown
};
