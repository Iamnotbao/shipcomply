const createAcItemMSchema = require("./ac_vend_base.create.dto");
const acVendBaseService = require("./ac_vend_base.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcVendBaseSchema = require("./ac_vend_base.create.dto");

async function getAllAcVB(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acVendBaseService.getAllAcVB(
    factory_code,
    department_code,
    user_code,
    query_level,
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
    tableName: "AC_VEND_BASE",
  });
}
async function getAcVBByID(req, res) {
  const { factory_code, vend_no, ac_send } = req.query;
  const result = await acVendBaseService.getAcVBByID(
    factory_code,
    vend_no,
    ac_send,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac vend base!",
      success: false,
      tableName: "AC_VEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result,
    tableName: "AC_VEND_BASE",
  });
}
async function getAllAcSendByCategory(req, res) {
  const {
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  const result = await acVendBaseService.getAllAcSendByCategory(
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_VEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "AC_VEND_BASE",
  });
}
async function getAllVendNoByStatus(req, res) {
  const {
    factory_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  const result = await acVendBaseService.getAllVendNoByStatus(
    factory_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_VEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "AC_VEND_BASE",
  });
}
async function addAcVB(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcVendBaseSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acVendBaseService.addAcVB(
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
      message: "Add ac vend base successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac vend base because", error);
    await t.rollback();
  }
}
async function editAcVB(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      vend_no,
      ac_send,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      vend_no,
      ac_send,
    };
    const { error, value } = createAcVendBaseSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acVendBaseService.editAcVB(
      factory_code,
      department_code,
      user_code,
      query_level,
      vend_no,
      ac_send,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit ac vend base",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac vend base  successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac vend base from controller!");
    await t.rollback();
  }
}
async function deleteAcVB(req, res) {
  try {
    const { factory_code, vend_no, ac_send } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acVendBaseService.deleteAcVB(
      factory_code,
      vend_no,
      ac_send,
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
      message: "Delete ac vend base successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcVB(req, res) {
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
    const shoes = await acVendBaseService.searchAcVB(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac vend base successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_VEND_BASE",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcVB(req, res) {
  try {
    const filename = "AC_VEND_BASE.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acVendBaseService.exportPDFAcVB(
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
async function exportExcelAcVB(req, res) {
  try {
    console.log("req", req);
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const workbook = await acVendBaseService.exportExcelAcVB(
      data,
      "AC_VEND_BASE",
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_VEND_BASE_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(" Export Excel error:", error);

    // Prevent "Cannot set headers after they are sent"
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
module.exports = {
  getAllAcVB,
  getAcVBByID,
  getAllAcSendByCategory,
  getAllVendNoByStatus,
  addAcVB,
  editAcVB,
  deleteAcVB,
  searchAcVB,
  exportPDFAcVB,
  exportExcelAcVB,
  // exportMaterialToExcel,
  // exportCustomToExcel
};
