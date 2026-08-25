const createFactorySchema = require("./factory.create.dto");
const factoryService = require("./factory.service");
const sequelize = require("../../config/db");
const fs = require("fs");

async function testDB(req, res) {
  console.log("inininin");

  const result = await factoryService.testDB();
  console.log("check the result ", result);

  if (!result) {
    return res.status(400).json({
      success: false,
      message: "Cannot get the raw sql",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Get from raw sql",
    data: result,
  });
}
async function getAllFactories(req, res) {
  const limit =
    req.query.limit !== undefined ? parseInt(req.query.limit, 10) : null;
  const offset =
    req.query.offset !== undefined ? parseInt(req.query.offset, 0) : null;
  const result = await factoryService.getAllFactories(limit, offset);
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "FACTORY",
  });
}
async function getFieldDropdown(req, res) {
  try {
    const { factory_code, field, language, page, limit, search, isStatus } =
      req.query;
    const result = await factoryService.getFieldDropdown(
      factory_code,
      field,
      language,
      page,
      limit,
      search,
      isStatus,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "FACTORY",
    });
  } catch (error) {
    console.error("Error fetching field from FACTORY:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getFactoryByID(req, res) {
  const { factory_code } = req.query;
  const result = await factoryService.getFactoryByID(factory_code);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single factory!",
      success: false,
      tableName: "FACTORY",
    });
  }
  return res.status(200).json({
    message: "Get single factory successfully!",
    success: true,
    data: result,
    tableName: "FACTORY",
  });
}
async function addFactory(req, res) {
  const { data } = req.body;
  const {pageSize} = req.query;
  const { error, value } = createFactorySchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const t = await sequelize.transaction();
    const response = await factoryService.addFactory(value,pageSize, t);
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
      message: "Add Factory successfully!",
        data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add factory because", error);
    await t.rollback();
  }
}
async function editFactory(req, res) {
  try {
    const { factory_code,pageSize } = req.query;
    const { data } = req.body;
    const { error, value } = createFactorySchema.validate(data);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const t = await sequelize.transaction();
    const response = await factoryService.editFactory(factory_code, value,pageSize, t);
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit factory",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit factory successfully!",
       data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteFactory(req, res) {
  try {
    const { factory_code } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await factoryService.deleteFactory(factory_code, t);
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
      message: "Delete factory successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchFactory(req, res) {
  const keyword = req.body;
  const limit =
    req.query.limit !== undefined ? parseInt(req.query.limit, 10) : null;
  const offset =
    req.query.offset !== undefined ? parseInt(req.query.offset, 0) : null;
  console.log(keyword);
  try {
    const shoes = await factoryService.searchFactory(keyword, limit, offset);
    return res.json({
      message: "search factory successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "FACTORY",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFFactories(req, res) {
  try {
    const filename = "factories.pdf";
    const pdf = await factoryService.exportPDFFactories(filename);
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
  testDB,
  getAllFactories,
  getFactoryByID,
  addFactory,
  editFactory,
  deleteFactory,
  searchFactory,
  exportPDFFactories,
  getFieldDropdown,
};
