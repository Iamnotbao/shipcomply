// AC_ISSUE_M_T.controller.js
const createSeInvMSchema = require("./ac_issue_m_t.create.dto");
const acIssueMTService = require("./ac_issue_m_t.service");
const sequelize = require("../../config/db");
const fs = require("fs");


async function getAllAcIssueM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await acIssueMTService.getAllAcIssueM(
    factory_code,
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
    tableName: "AC_ISSUE_M_T",
  });
}

async function getAcIssueMTByID(req, res) {
  const { factory_code, conf_seq } = req.query;
  const result = await acIssueMTService.getAcIssueMTByID(
    factory_code,
    conf_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single se inv m!",
      success: false,
      tableName: "AC_ISSUE_M_T",
    });
  }
  return res.status(200).json({
    message: "Get single se inv m successfully!",
    success: true,
    data: result,
    tableName: "AC_ISSUE_M_T",
  });
}
async function activateAIMT(req, res) {
  const { factory_code, user_code, conf_seq, language } = req.query;
  try {
    const result = await acIssueMTService.activateAIMT(
      factory_code,
      user_code,
      conf_seq,
      language,
    );
    return res.json({
      message: result.message,
      success: result.success,
      tableName: "AC_ISSUE_MATD_T",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function voidAllAcIssueMT(req, res) {
  const { factory_code, user_code, conf_seq, lock_seq, language } = req.query;
  const result = await acIssueMTService.voidAllAIMT(
    factory_code,
    user_code,
    conf_seq,
    lock_seq,
    language,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "AC_ISSUE_M_T",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "AC_ISSUE_M_T",
  });
}

async function calculateAIMT(req, res) {
  const {   factory_code,
    user_code,
    conf_seq,
    language, } = req.query;
  const result = await acIssueMTService.calculateAIMT(
     factory_code,
    user_code,
    conf_seq,
    language,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot update date !",
      success: false,
      tableName: "AC_ISSUE_M_T",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "AC_ISSUE_M_T",
  });
}
async function addAcIssueMT(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSeInvMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acIssueMTService.addAcIssueMT(
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
      message: "Add se inv m tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add se inv m because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editAcIssueMT(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    conf_seq,
  };
  const { error, value } = createSeInvMSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acIssueMTService.editAcIssueMT(
      factory_code,
      department_code,
      user_code,
      query_level,
      conf_seq,
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

async function searchAcIssueM(req, res) {
  const { search } = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  try {
    const shoes = await acIssueMTService.searchAcIssueM(
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      search,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "AC_ISSUE_M_T",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function exportPDF(req, res) {
  try {
    const filename = "AC_ISSUE_M_T.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acIssueMTService.exportPDF(
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
async function exportExcel(req, res) {
  try {
    const filename = "AC_ISSUE_M_T";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await acIssueMTService.exportExcel(
      filename,
      search,
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
      `attachment; filename=AC_ISSUE_M_T_${Date.now()}.xlsx`,
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
async function exportExcelDetail(req, res) {
  try {
    const filename = "export_excel_details.xlsx";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await acIssueMTService.exportExcelDetail(
      filename,
      search,
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
      `attachment; filename=AC_ISSUE_M_T_${Date.now()}.xlsx`,
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
async function exportExcelSummary(req, res) {
  try {
    const filename = "export_excel_summary.xlsx";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await acIssueMTService.exportExcelSummary(
      filename,
      search,
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
      `attachment; filename=AC_ISSUE_M_T_${Date.now()}.xlsx`,
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
async function exportPDFToPakingList(req, res) {
  try {
    const filename = "Paking List.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acIssueMTService.exportPDFToPakingList(
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
module.exports = {
  getAllAcIssueM,
  getAcIssueMTByID,
  addAcIssueMT,
  editAcIssueMT,
  exportPDF,
  searchAcIssueM,
  exportExcel,
  voidAllAcIssueMT,
  exportPDFToPakingList,
  activateAIMT,
  calculateAIMT,
  exportExcelDetail,
  exportExcelSummary,
};
