// AC_CONT_D.controller.js
const { createAcContDSchema } = require("./ac_cont_d.create.dto");
const acContDService = require("./ac_cont_d.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllAcCD(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await acContDService.getAllAcCD(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "AC_CONT_D",
  });
}
async function getAllAcCDWithView(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    cont_no,
    limit,
    offset,
  } = req.query;
  const result = await acContDService.getAllAcCDWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    cont_no,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_CONT_D",
  });
}
async function getFieldWithFunction(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      ac_itemno,
      item_acno,
      type,
    } = req.query;

    const selectedItemAcno = item_acno || ac_itemno;

    if (!factory_code || !selectedItemAcno) {
      return res.status(400).json({
        success: false,
        message: "factory_code and item_acno are required",
      });
    }

    const result = await acContDService.getFieldWithFunction(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      selectedItemAcno,
      type,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_ITEM_M",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getAcContDByID(req, res) {
  const { factory_code, cont_no, seq } = req.query;
  const result = await acContDService.getAcContDByID(
    factory_code,
    cont_no,
    seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "AC_CONT_D",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "AC_CONT_D",
  });
}
async function getDropdownGoods(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      is_status,
      is_export,
    } = req.query;

    const result = await acContDService.getDropdownGoods(
      factory_code,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      is_status,
      is_export,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getContPriceDrop(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      item_acno,
      min_cont,
      page,
      limit,
      search,
    } = req.query;

    const result = await acContDService.getContPriceDrop(
      factory_code,
      department_code,
      user_code,
      query_level,
      item_acno,
      min_cont,
      page,
      limit,
      search,
      search,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getDropdownGoodsWithFunc(req, res) {
  try {
    const {
      factory_code,
      cont_no,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      mark,
    } = req.query;

    const result = await acContDService.getDropdownGoodsWithFunc(
      factory_code,
      cont_no,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      mark,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getUnitByGoodsCode(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      goods_code,
      page,
      limit,
      search,
      is_status,
      is_export,
    } = req.query;

    const result = await acContDService.getUnitByGoodsCode(
      factory_code,
      department_code,
      user_code,
      query_level,
      goods_code,
      page,
      limit,
      search,
      is_status,
      is_export
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getSumData(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
    } = req.query;

    const result = await acContDService.getSumData(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      cont_no,
    );
     return res.status(200).json({
      message: "ok",
      success: true,
      data: result,
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function addAcContD(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;

  const { error, value } = createAcContDSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acContDService.addAcContD(
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
      message: "Add import material tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add import material tracking because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editAcContD(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
      seq,
      pageSize,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      cont_no,
      seq,
    };
    const { error, value } = createAcContDSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acContDService.editAcContD(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_no,
      seq,
      value,
      pageSize,
      t,
    );

    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit import material tracking",
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Edit import material tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot edit from controller!", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteAcContD(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, cont_no, seq } = req.query;
    const isDelete = await acContDService.deleteAcContD(
      factory_code,
      cont_no,
      seq,
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
      message: "Delete ac cont d successfully!",
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

async function searchAcImp(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await acContDService.searchAcImp(
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
      tableName: "AC_CONT_D",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function exportExcelAcImp(req, res) {
  try {
    const filename = "AC_CONT_D";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acContDService.exportExcelAcImp(
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
      `attachment; filename=AC_CONT_D_${Date.now()}.xlsx`,
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
    const filePath = await acContDService.exportExcelMaterialAcImp(
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
    const filePath = await acContDService.exportExcelCustomAcImp(
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
  getAllAcCD,
  getAllAcCDWithView,
  getAcContDByID,
  getDropdownGoods,
  getUnitByGoodsCode,
  getDropdownGoodsWithFunc,
  getFieldWithFunction,
  getContPriceDrop,
  addAcContD,
  editAcContD,
  deleteAcContD,
  searchAcImp,
  exportExcelAcImp,
  exportMaterialToExcel,
  exportCustomToExcel,
  getSumData
};
