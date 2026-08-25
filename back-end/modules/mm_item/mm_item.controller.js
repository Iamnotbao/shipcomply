const createAcImpMaterialTrackingSchema = require("./mm_item.create.dto");
const mMItemService = require("./mm_item.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createMmItemSchema = require("./mm_item.create.dto");

async function getAllMMItem(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await mMItemService.getAllMMItem(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "RD_SIZE_D",
  });
}
async function getAllItemNo(req, res) {
  const { page, limit, search } = req.query;
  const result = await mMItemService.getAllItemNo(page, limit, search);
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "MM_ITEM",
  });
}
async function getMMItemByID(req, res) {
  const { item_no } = req.query;
  const result = await mMItemService.getMMItemByID(item_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single mm item!",
      success: false,
      tableName: "MM_ITEM",
    });
  }
  return res.status(200).json({
    message: "Get single  import material tracking successfully!",
    success: true,
    data: result,
    tableName: "MM_ITEM",
  });
}
async function getRdSizeDBySize(req, res) {
  const { factory_code, size_type, department_code, user_code, query_level } =
    req.query;
  const result = await mMItemService.getRdSizeDBySize(
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
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
    data: result,
    tableName: "RD_SIZE_D",
  });
}
async function addMMI(req, res) {
  const { data } = req.body;
  const { error, value } = createMmItemSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await mMItemService.addMMI(value, t);
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
    const { error, value } = createMmItemSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await mMItemService.editAcRsd(
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
    const isDelete = await mMItemService.deleteAcRSD(
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
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await mMItemService.searchRSD(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes,
      tableName: "RD_SIZE_D",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFRSD(req, res) {
  try {
    const filename = "RD_SIZE_D";
    const pdf = await mMItemService.exportPDFRSD(filename);
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
    const filePath = await mMItemService.exportExcelMaterialAcImp(
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
    const filePath = await mMItemService.exportExcelCustomAcImp(
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
  getAllMMItem,
  getMMItemByID,
  getAllItemNo,
  getRdSizeDBySize,
  addMMI,
  editAcRsd,
  deleteAcRSD,
  searchRSD,
  exportPDFRSD,
  exportMaterialToExcel,
  exportCustomToExcel,
};
