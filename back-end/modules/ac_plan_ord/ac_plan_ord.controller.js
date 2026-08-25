const sePayService = require("./ac_plan_ord.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcBomMSchema = require("./ac_plan_ord.create.dto");

async function getListOfAPO(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
    ac_no
  } = req.query;
  const result = await sePayService.getListOfAPO(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
    ac_no
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_PLAN_ORD",
  });
}
async function getSPByID(req, res) {
  const { factory_code, pay_no } = req.query;
  const result = await sePayService.getSPByID(factory_code, pay_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single AC_PLAN_ORD!",
      success: false,
      tableName: "AC_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get single  AC_PLAN_ORD successfully!",
    success: true,
    data: result,
    tableName: "AC_PLAN_ORD",
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
    tableName: "AC_PLAN_ORD",
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
      message: "Add  AC_PLAN_ORD successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  AC_PLAN_ORD because", error);
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
        message: "Cannot edit  AC_PLAN_ORD",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  AC_PLAN_ORD successfully!",
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
      message: "Delete AC_PLAN_ORD successfully!",
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
      message: "search AC_PLAN_ORD successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_PLAN_ORD",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFABM(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "AC_PLAN_ORD";
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
  getListOfAPO,
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
