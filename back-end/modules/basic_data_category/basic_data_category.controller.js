const sequelize = require("../../config/db");
const createBasicDataCategorySchema = require("./basic_data_category.create.dto");
const fs = require("fs");
const basicDataCategoryService = require("./basic_data_category.service");

async function getAll(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const basicData = await basicDataCategoryService.getAll(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  if (basicData) {
    return res.json({
      message: "Get all basic data category",
      sucess: true,
      data: basicData.rows,
      total: basicData.count,
      hasMore: basicData.hasMore,
      tableName: "BASIC_DATA_CATEGORY",
    });
  }
}
async function getByID(req, res) {
  const { factory_code, category_code } = req.query;
  try {
    const basicData = await basicDataCategoryService.getBasicCategoryDataByID(
      factory_code,
      category_code,
    );
    if (!basicData) {
      return res.status(400).json({
        message: "This basic data does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get single basic data ok",
      success: true,
      data: basicData,
    });
  } catch (error) {
    console.log("Cannot get the single basic data");
  }
}
async function getByFactory(req, res) {
  const { factory_code } = req.query;
  try {
    const department =
      await basicDataCategoryService.getByFactory(factory_code);
    if (!department) {
      return res.status(400).json({
        message: "This department does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get basic data by factory ok",
      success: true,
      data: department,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    console.log("Cannot get the single deparment");
  }
}
async function getByDeclareCate(req, res) {
  const { factory_code, category_code, loading_way } = req.query;
  try {
    const basicDataCate = await basicDataCategoryService.getByDeclareCate(
      factory_code,
      category_code,
      loading_way,
    );
    if (!basicDataCate) {
      return res.status(400).json({
        message: "This department does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get basic data by factory ok",
      success: true,
      data: department,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    console.log("Cannot get the single deparment");
  }
}
async function createBasicDataCategory(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  console.log("check data", data);

  const { error, value } = createBasicDataCategorySchema.validate(data);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const t = await sequelize.transaction();
  try {
    const response = await basicDataCategoryService.createBasicDataCategory(
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
      return res.status(400).json({
        message: response.message,
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Create basic data successfully!",
      success: true,
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    await t.rollback();
    console.log("Add basic data Failed:", error);
  }
}
async function editBasicCategoryData(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    category_code,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    category_code,
  };
  const { error, value } =
    createBasicDataCategorySchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await basicDataCategoryService.editBasicCategoryData(
      factory_code,
      department_code,
      user_code,
      query_level,
      category_code,
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
async function deleteBasicData(req, res) {
  const { factory_code, category_code, code_no } = req.query;
  const t = await sequelize.transaction();
  try {
    const isDelete = await basicDataCategoryService.deleteBasicData(
      factory_code,
      category_code,
      code_no,
      t,
    );
    if (!isDelete) {
      await t.rollback();
      return res.status(400).json({
        message: "Cannot delete Basic Data!",
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete Basic Data Success!",
      success: true,
    });
  } catch (error) {
    t.rollback();
    console.log("Cannot delete department with some issue in try");
  }
}
async function deleteAllFactoryDepartment(req, res) {
  const { departments } = req.body;
  const t = await sequelize.transaction();
  try {
    const isAllDelete =
      await basicDataCategoryService.deleteAllDepartment(departments);
    if (!isAllDelete) {
      await t.rollback();
      return res.status(400).json({
        message: "Cannot delete all department!",
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete all department Success!",
      success: true,
    });
  } catch (error) {
    t.rollback();
    console.log("Cannot delete all department with some issue in try");
  }
}
async function searchBasicDataCategory(req, res) {
  try {
    const search = req.body;
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    } = req.query;
    const response = await basicDataCategoryService.searchBasicDataCategory(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.status(200).json({
      message: "Search has been executed!",
      data: response.rows,
      total: response.count,
      hasMore: response.hasMore,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Search Failed!",
      error: error,
    });
  }
}
async function exportExcelBasicDataCategory(req, res) {
  try {
    const filename = "basic_data.xlsx";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await basicDataCategoryService.exportExcelBasicDataCategory(
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
      `attachment; filename=AC_ITEM_M_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Export PDF failed" });
  }
}
module.exports = {
  getAll,
  getByID,
  getByFactory,
  getByDeclareCate,
  createBasicDataCategory,
  editBasicCategoryData,
  deleteBasicData,
  deleteAllFactoryDepartment,
  searchBasicDataCategory,
  exportExcelBasicDataCategory,
};
