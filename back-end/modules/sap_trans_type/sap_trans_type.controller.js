const sePayService = require("./sap_trans_type.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcBomMSchema = require("./sap_trans_type.create.dto");

async function getAllSTT(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sePayService.getAllSTT(
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
    tableName: "SAP_TRANS_TYPE",
  });
}
async function getSPByID(req, res) {
  const { factory_code, pay_no } = req.query;
  const result = await sePayService.getSPByID(factory_code, pay_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single SAP_TRANS_TYPE!",
      success: false,
      tableName: "SAP_TRANS_TYPE",
    });
  }
  return res.status(200).json({
    message: "Get single  SAP_TRANS_TYPE successfully!",
    success: true,
    data: result,
    tableName: "SAP_TRANS_TYPE",
  });
}
async function getFieldDropdown(req, res) {
  const { factory_code, language, page, limit, search } = req.query;
  const result = await sePayService.getFieldDropdown(
    factory_code,
    language,
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
    tableName: "SAP_TRANS_TYPE",
  });
}
async function addSP(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcBomMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await sePayService.addSP(
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
      message: "Add  SAP_TRANS_TYPE successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  SAP_TRANS_TYPE because", error);
    await t.rollback();
  }
}
async function editSP(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      pay_no,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      pay_no,
    };
    const { error, value } = createAcBomMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await sePayService.editSP(
      factory_code,
      department_code,
      user_code,
      query_level,
      pay_no,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  SAP_TRANS_TYPE",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  SAP_TRANS_TYPE successfully!",
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
    const isDelete = await sePayService.deleteABM(
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
      message: "Delete SAP_TRANS_TYPE successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchABM(req, res) {
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
    const shoes = await sePayService.searchABM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search SAP_TRANS_TYPE successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "SAP_TRANS_TYPE",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFABM(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "SAP_TRANS_TYPE";
    const pdf = await sePayService.exportPDFABM(
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
    const filePath = await sePayService.exportExcelMaterialABM(
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
    const filePath = await sePayService.exportExcelCustomABM(filename, filters);

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
  getAllSTT,
  getSPByID,
  addSP,
  editSP,
  deleteABM,
  searchABM,
  exportPDFABM,
  exportMaterialToExcel,
  exportCustomToExcel,
  getFieldDropdown,
};
