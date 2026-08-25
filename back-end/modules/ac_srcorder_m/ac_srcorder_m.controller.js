const acSrcorderMService = require("./ac_srcorder_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcSrcOrderMSchema = require("./ac_srcorder_m.create.dto");

async function getAllAcSrcOrderM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acSrcorderMService.getAllAcSrcOrderM(
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
    tableName: "AC_SRCORDER_M",
  });
}
async function getAcSrcOrderMByField(req, res) {
  const { factory_code, field } = req.query;
  const result = await acSrcorderMService.getAcSrcOrderMByField(
    factory_code,
    field,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac src order m !",
      success: false,
      tableName: "AC_SRCORDER_M",
    });
  }
  return res.status(200).json({
    message: "Get all ac src order m by field successfully!",
    success: true,
    data: result,
    tableName: "AC_SRCORDER_M",
  });
}
async function getDropdownByField(req, res) {
  const {
    factory_code,
    field,
    page = 1,
    limit = 10,
    search = "",
    is_status,
  } = req.query;

  try {
    const result = await acSrcorderMService.getDropdownByField(
      factory_code,
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
      totalPages: result.totalPages,
      tableName: "AC_SRCORDER_M",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function getAcSrcOrderM(req, res) {
  const { factory_code, id } = req.query;
  const result = await acSrcorderMService.getAcSrcOrderM(factory_code, id);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item m!",
      success: false,
      tableName: "AC_SRCORDER_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "AC_SRCORDER_M",
  });
}
async function getAcIMByIA(req, res) {
  const { item_acno } = req.query;
  const result = await acSrcorderMService.getAllACIMByItemAcno(item_acno);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_SRCORDER_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "AC_SRCORDER_M",
  });
}
async function addAcSrcorderM(req, res) {
  const { data } = req.body;
  const { error, value } = createAcSrcOrderMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acSrcorderMService.addAcSrcorderM(value, t);
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
      data: response,
    });
  } catch (error) {
    console.log("Cannot add ac item m because", error);
    await t.rollback();
  }
}
async function editAcSrcorderM(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, item_acno } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      item_acno,
    };
    const { error, value } = createAcSrcOrderMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acSrcorderMService.editAcSrcorderM(
      factory_code,
      item_acno,
      value,
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
      data: response,
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
    const isDelete = await acSrcorderMService.deleteAcImp(
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
async function searchAcSrcorderM(req, res) {
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
    const result = await acSrcorderMService.searchAcSrcorderM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ok",
      success: true,
      data: result.rows,
      total: result.count,
      hasMore: result.hasMore,
      tableName: "AC_SRCORDER_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIM(req, res) {
  try {
    const filename = "ac_item_m.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acSrcorderMService.exportPDFAcIM(
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
async function exportExcelAcReqOrder(req, res) {
  try {
    console.log("req", req);
    const { data } = req.body;
    const workbook = await acSrcorderMService.exportExcelAcReqOrder(data);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_SRCORDER_M_${Date.now()}.xlsx`,
    );

    res.send(workbook);
  } catch (error) {
    console.error(" Export Excel error:", error);

    // Prevent "Cannot set headers after they are sent"
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
async function exportExcelAcSrcorderM(req, res) {
  try {
    const { data, filename } = req.body;
    const workbook = await acSrcorderMService.exportExcelAcSrcorderM(data);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.xlsx`,
    );
    res.send(workbook);
  } catch (error) {
    console.error(" Export Excel error:", error);

    // Prevent "Cannot set headers after they are sent"
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
module.exports = {
  getAllAcSrcOrderM,
  getAcSrcOrderM,
  getAcSrcOrderMByField,
  getAcIMByIA,
  getDropdownByField,
  addAcSrcorderM,
  editAcSrcorderM,
  // deleteAcIM,
  searchAcSrcorderM,
  exportPDFAcIM,
  exportExcelAcReqOrder,
  exportExcelAcSrcorderM,
};
