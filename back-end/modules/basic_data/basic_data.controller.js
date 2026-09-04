const sequelize = require("../../config/db");
const createBasicDataSchema = require("./basic_data.create.dto");
const fs = require("fs");
const basicDataService = require("./basic_data.service");

async function getAll(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const basicData = await basicDataService.getAll(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  if (basicData) {
    return res.json({
      message: "Get all basic data",
      sucess: true,
      data: basicData.rows,
      total: basicData.count,
      hasMore: basicData.hasMore,
      tableName: "BASIC_DATA",
    });
  }
}
async function getByID(req, res) {
  const { factory_code, category_code, code_no } = req.query;
  try {
    const basicData = await basicDataService.getBasicDataByID(
      factory_code,
      category_code,
      code_no,
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
    const department = await basicDataService.getByFactory(factory_code);
    if (!department) {
      return res.status(400).json({
        message: "This department does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get single deparment ok",
      success: true,
      data: department,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    console.log("Cannot get the single deparment");
  }
}
async function getByCategory(req, res) {
  const {
    factory_code,
    category_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  try {
    const basicDatabyCategory = await basicDataService.getByCategory(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    if (!basicDatabyCategory) {
      return res.status(400).json({
        message: "This basic data does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get basic data by category ok",
      success: true,
      data: basicDatabyCategory.rows,
      total: basicDatabyCategory.count,
      hasMore: basicDatabyCategory.hasMore,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    console.log("Cannot get the single basic data ", error);
  }
}
async function getDropdownByCategory(req, res) {
  const {
    factory_code,
    category_code,
    department_code,
    user_code,
    query_level,
    page = 1,
    limit = 10,
    search = "",
    is_status,
    language
  } = req.query;

  try {
    const result = await basicDataService.getDropdownByCategory(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      is_status,
      language
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function fetchDetailsForM(req, res) {
  const { factory_code, category_code, whereClauseBasicData, factoryWhere } =
    req.query;
  try {
    const basicDatabyCategory = await basicDataService.fetchDetailsForM(
      factory_code,
      category_code,
      whereClauseBasicData,
      factoryWhere,
    );
    if (!basicDatabyCategory) {
      return res.status(400).json({
        message: "This basic data does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get basic data by category ok",
      success: true,
      data: basicDatabyCategory.rows,
      total: basicDatabyCategory.count,
      hasMore: basicDatabyCategory.hasMore,
      tableName: "BASIC_DATA",
    });
  } catch (error) {
    console.log("Cannot get the single basic data ", error);
  }
}
async function updateStatusBD(req, res) {
  const {
    factory_code,
    category_code,
    department_code,
    user_code,
    query_level,
  } = req.query;
  const { data } = req.body;
  try {
    const acItemRef = await basicDataService.updateStatusBD(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      data,
    );
    if (!acItemRef) {
      return res.status(400).json({
        message: "This ac item ref does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac item ref by category ok",
      success: true,
      data: acItemRef,
      tableName: "AC_ITEM_REF",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function createBasicData(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  console.log("check data", data);

  const { error, value } = createBasicDataSchema.validate(data);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const t = await sequelize.transaction();
  try {
    const response = await basicDataService.createBasicData(
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
async function editBasicData(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    category_code,
    code_no,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    category_code,
    code_no,
  };
  const { error, value } = createBasicDataSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await basicDataService.editBasicData(
      factory_code,
      department_code,
      user_code,
      query_level,
      category_code,
      code_no,
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
      page: response.page,
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
    const isDelete = await basicDataService.deleteBasicData(
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
    const isAllDelete = await basicDataService.deleteAllDepartment(departments);
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
async function searchByBasicData(req, res) {
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
    const response = await basicDataService.searchByBasicData(
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
      totalMasters: response.totalMasters,
      totalDetails: response.totalDetails,
      mastersInPage: response.mastersInPage,
      masterKeys: response.masterKeys,
      masterInfo: response.masterInfo || null,
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
async function exportPDFBasicData(req, res) {
  try {
    const filename = "department.pdf";
    const pdf = await basicDataService.exportPDFBasicData(filename);
    res.download(pdf, (err) => {
      if (err) {
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
  getAll,
  getByID,
  getByFactory,
  getByCategory,
  getDropdownByCategory,
  fetchDetailsForM,
  updateStatusBD,
  createBasicData,
  editBasicData,
  deleteBasicData,
  deleteAllFactoryDepartment,
  searchByBasicData,
  exportPDFBasicData,
};
