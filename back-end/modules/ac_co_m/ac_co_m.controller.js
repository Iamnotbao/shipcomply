const acCoMService = require("./ac_co_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const createAcCoMSchema = require("./ac_co_m.create.dto");

async function getAllACM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acCoMService.getAllACM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_CO_M",
  });
}
async function getACMByID(req, res) {
  const { factory_code, co_id } = req.query;
  const result = await acCoMService.getACMByID(factory_code, co_id);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac_bom_m!",
      success: false,
      tableName: "AC_CO_M",
    });
  }
  return res.status(200).json({
    message: "Get single  ac_bom_m successfully!",
    success: true,
    data: result,
    tableName: "AC_CO_M",
  });
}
async function generateCoid(req, res) {
  const { factory_code, department_code, user_code, query_level, type } =
    req.query;
  const result = await acCoMService.generateCoid(
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
    tableName: "AC_CO_M",
  });
}
async function getAllShipOrderToExcel(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  } = req.query;
  const result = await acCoMService.getAllShipOrderToExcel(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    filters,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac_bom_m!",
      success: false,
      tableName: "AC_CO_M",
    });
  }
  return res.status(200).json({
    message: "Get single  ac_bom_m successfully!",
    success: true,
    data: result,
    tableName: "AC_CO_M",
  });
}
async function getFieldDropdown(req, res) {
  try {
    const { factory_code, field, page, limit, search } = req.query;
    const result = await acCoMService.getFieldDropdown(
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
      tableName: "AC_CO_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function addACM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcCoMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acCoMService.addACM(
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
      message: "Add  ac_bom_m successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac_bom_m because", error);
    await t.rollback();
  }
}
async function editACM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      co_id,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      co_id,
    };
    const { error, value } = createAcCoMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acCoMService.editACM(
      factory_code,
      department_code,
      user_code,
      query_level,
      co_id,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  ac_co_m",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac_bom_m successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteABM(req, res) {
  try {
    const { factory_code, prod_acno, item_acno } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acCoMService.deleteABM(
      factory_code,
      prod_acno,
      item_acno,
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
    return res.status(200).json({
      success: true,
      message: "Delete ac_bom_m successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchACM(req, res) {
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
    const shoes = await acCoMService.searchACM(
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
      message: "search ac_bom_m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_CO_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFABM(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "AC_CO_M.pdf";
    const pdf = await acCoMService.exportPDFABM(
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
async function exportPDFTest(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "AC_CO_M";
    const pdf = await acCoMService.exportPDFTest(
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
    const filePath = await acCoMService.exportExcelMaterialABM(
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
    const filePath = await acCoMService.exportExcelCustomABM(filename, filters);

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

async function exportExcelShipOrder(req, res) {
  try {
    const filename = "ship_order";
    const { factory_code, department_code, user_code, query_level, language } = req.query;
    const { search } = req.body;

    const workbook = await acCoMService.exportExcelShipOrder(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level,  
      language,     
      search,
    );

    const buffer = await workbook.xlsx.writeBuffer(); 

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=ShipOrder_${Date.now()}.xlsx`);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error("Export Excel error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || "Export Excel failed" });
    }
  }
}
module.exports = {
  getAllACM,
  getACMByID,
  generateCoid,
  getFieldDropdown,
  addACM,
  editACM,
  deleteABM,
  searchACM,
  exportPDFABM,
  exportPDFTest,
  exportMaterialToExcel,
  exportCustomToExcel,
  exportExcelShipOrder,
};
