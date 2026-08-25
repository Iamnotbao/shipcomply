const createAcImpMaterialTrackingSchema = require("./rd_size_d.create.dto");
const rdSizeDService = require("./rd_size_d.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createRdSizeDSchema = require("./rd_size_d.create.dto");

async function getAllRdSizeD(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await rdSizeDService.getAllRdSizeD(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "RD_SIZE_D",
  });
}
async function getRdSizeDByID(req, res) {
  const { factory_code, size_type, size_no } = req.query;
  const result = await rdSizeDService.getRdSizeDByID(
    factory_code,
    size_type,
    size_no,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "RD_SIZE_D",
    });
  }
  return res.status(200).json({
    message: "Get single  import material tracking successfully!",
    success: true,
    data: result,
    tableName: "RD_SIZE_D",
  });
}
async function getRdSizeDBySize(req, res) {
  const {
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await rdSizeDService.getRdSizeDBySize(
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single Rd Size D!",
      success: false,
      tableName: "RD_SIZE_D",
    });
  }
  return res.status(200).json({
    message: "Get all Rd Size D by size_type successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "RD_SIZE_D",
  });
}
async function getDropBySize(req, res) {
  const {
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  const result = await rdSizeDService.getDropBySize(
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    is_status,
  );

  if (!result) {
    return res.status(401).json({
      message: "Cannot get single Rd Size D!",
      success: false,
      tableName: "RD_SIZE_D",
    });
  }
  return res.status(200).json({
    message: "Get all Rd Size D by size_type successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "RD_SIZE_D",
  });
}
async function addAcRSD(req, res) {
  const { data } = req.body;
  const { error, value } = createRdSizeDSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await rdSizeDService.addAcRSD(value, t);
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
      message: "Add  import material tracking successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Cannot add  import material tracking because", error);
    await t.rollback();
  }
}
async function editAcRsd(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, size_type, size_no } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      size_type,
      size_no,
    };
    const { error, value } = createRdSizeDSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await rdSizeDService.editAcRsd(
      factory_code,
      size_type,
      size_no,
      value,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  import material tracking",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  import material tracking successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteAcRSD(req, res) {
  try {
    const { factory_code, size_type, size_no } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await rdSizeDService.deleteAcRSD(
      factory_code,
      size_type,
      size_no,
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
      message: "Delete import material tracking successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchRSD(req, res) {
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
    const shoes = await rdSizeDService.searchRSD(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "RD_SIZE_D",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFRSD(req, res) {
  try {
    const filename = "RD_SIZE_D";
    const pdf = await rdSizeDService.exportPDFRSD(filename);
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
    const filePath = await rdSizeDService.exportExcelMaterialAcImp(
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
    const filePath = await rdSizeDService.exportExcelCustomAcImp(
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
  getAllRdSizeD,
  getRdSizeDByID,
  getRdSizeDBySize,
  getDropBySize,
  addAcRSD,
  editAcRsd,
  deleteAcRSD,
  searchRSD,
  exportPDFRSD,
  exportMaterialToExcel,
  exportCustomToExcel,
};
