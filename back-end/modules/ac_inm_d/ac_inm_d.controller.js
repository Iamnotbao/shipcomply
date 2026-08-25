// AC_INM_D.controller.js
const createAcImpMaterialTrackingSchema = require("./ac_inm_d.create.dto");
const acInmDService = require("./ac_inm_d.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcInMDSchema = require("./ac_inm_d.create.dto");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllAcInmD(req, res) {
  const {
    factory_code,
    inm_no,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acInmDService.getAllAcInmD(
    factory_code,
    inm_no,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_INM_D",
  });
}

async function getAcInmDByID(req, res) {
  const { factory_code, inm_no, seq } = req.query;
  const result = await acInmDService.getAcInmDByID(factory_code, inm_no, seq);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "AC_INM_D",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "AC_INM_D",
  });
}
async function getItemNoList(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      is_status,
    } = req.query;

    if (!factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: factory_code",
      });
    }

    const result = await acInmDService.getItemNoList(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      page,
      limit,
      search,
      is_status
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_INM_D",
    });
  } catch (error) {
    console.error("Error fetching bank parameter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getUnitList(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      item_no,
      page,
      limit,
      offset,
    } = req.query;

    if (!factory_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: factory_code",
      });
    }
    const result = await acInmDService.getUnitList(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      item_no,
      page,
      limit,
      offset,
    );

    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_INM_D",
    });
  } catch (error) {
    console.error("Error fetching bank parameter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function updateStatusAID(req, res) {
  const { factory_code, inm_no, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  try {
    const acItemRef = await acInmDService.updateStatusAID(
      factory_code,
      inm_no,
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
      tableName: "AC_INM_D",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function addAID(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcInMDSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acInmDService.addAID(
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

async function editAID(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      inm_no,
      seq,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      inm_no,
      seq,
    };
    const { error, value } = createAcInMDSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acInmDService.editAID(
      factory_code,
      department_code,
      user_code,
      query_level,
      inm_no,
      seq,
      value,
      page_size,
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

async function deleteAcInmD(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, inm_no, seq } = req.query;

    const isDelete = await acInmDService.deleteAcInmD(
      factory_code,
      inm_no,
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
      message: "Delete import material tracking successfully!",
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

async function searchAcInmD(req, res) {
  const { keyword } = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  try {
    const result = await acInmDService.searchAcInmD(
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
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      tableName: "AC_INM_D",
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
    const filename = "AC_INM_D";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acInmDService.exportExcelAcImp(
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
      `attachment; filename=AC_INM_D_${Date.now()}.xlsx`,
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
    const filePath = await acInmDService.exportExcelMaterialAcImp(
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
    const filePath = await acInmDService.exportExcelCustomAcImp(
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
  getAllAcInmD,
  getAcInmDByID,
  getItemNoList,
  getUnitList,
  updateStatusAID,
  addAID,
  editAID,
  deleteAcInmD,
  searchAcInmD,
  exportExcelAcImp,
  exportMaterialToExcel,
  exportCustomToExcel,
};
