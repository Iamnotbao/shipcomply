const createAcItemMSchema = require("./ac_item_m.create.dto");
const acItemMService = require("./ac_item_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

async function getAllAcIM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acItemMService.getAllAcIM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_ITEM_M",
  });
}
async function getAcIMByID(req, res) {
  const { factory_code, item_acno } = req.query;
  const result = await acItemMService.getAcIMByID(factory_code, item_acno);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item m!",
      success: false,
      tableName: "AC_ITEM_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "AC_ITEM_M",
  });
}
async function getAcIMByIA(req, res) {
  const { item_acno } = req.query;
  const result = await acItemMService.getAllACIMByItemAcno(item_acno);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_ITEM_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "AC_ITEM_M",
  });
}
async function fetchGroupFieldDrop(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_itemno,
      language,
      page,
      limit,
      search,
      is_status,
    } = req.query;

    const result = await acItemMService.fetchGroupFieldDrop(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_itemno,
      language,
      page,
      limit,
      search,
      is_status,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
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
async function fetchFieldDropdown(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      field,
      page,
      limit,
      search,
      is_status,
    } = req.query;

    const result = await acItemMService.fetchFieldDropDown(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      field,
      page,
      limit,
      search,
      is_status,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
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
async function fetchFieldWithFunction(req, res) {
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

    const result = await acItemMService.fetchFieldWithFunction(
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

async function addAcIM(req, res) {
  const { page_size, factory_code, user_code, department_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcItemMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acItemMService.addAcIM(
      factory_code,
      user_code,
      department_code,
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
      message: "Add ac item m successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac item m because", error);
    await t.rollback();
  }
}
async function editAcIM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      user_code,
      department_code,
      query_level,
      item_acno,
      page_size,
    } = req.query;
    const { data } = req.body;

    const dataToValidate = {
      ...data,
      factory_code,
      item_acno,
    };
    const { error, value } = createAcItemMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acItemMService.editAcIM(
      factory_code,
      user_code,
      department_code,
      query_level,
      item_acno,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit ac item m",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac item m  successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac item m from controller!");
    await t.rollback();
  }
}
async function deleteAcIM(req, res) {
  try {
    const { factory_code, item_acno } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acItemMService.deleteAcImp(
      factory_code,
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
      message: "Delete ac item m successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcIM(req, res) {
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
    const shoes = await acItemMService.searchAcIM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac item m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_ITEM_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIM(req, res) {
  try {
    const filename = "AC_ITEM_M";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acItemMService.exportPDFAcIM(
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
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
async function exportExcelAcIM(req, res) {
  try {
    console.log("req", req);
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const workbook = await acItemMService.exportExcelAcIM(data, "AC_ITEM_M");

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
    console.error(" Export Excel error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
async function importExcel(req, res) {
  try {
    const { factory_code, user_code } = req.query;
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!factory_code || !user_code) {
      return res.status(400).json({
        success: false,
        message: "factory_code and user_code are required",
      });
    }

    const result = await acItemMService.importExcel(
      factory_code,
      user_code,
      fileBuffer
    );

    return res.status(200).json({
      success: true,
      message: `Import completed: ${result.masters} masters, ${result.details} details`,
      ...result,
    });
  } catch (error) {
    console.error("importExcel controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  getAllAcIM,
  getAcIMByID,
  getAcIMByIA,
  fetchGroupFieldDrop,
  fetchFieldWithFunction,
  fetchFieldDropdown,
  addAcIM,
  editAcIM,
  deleteAcIM,
  searchAcIM,
  exportPDFAcIM,
  exportExcelAcIM,
  importExcel,
};
