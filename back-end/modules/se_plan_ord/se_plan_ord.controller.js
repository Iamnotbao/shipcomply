// SE_PLAN_ORD.controller.js
const { createSePlanOrdSchema } = require("./se_plan_ord.create.dto");
const sePlanOrdService = require("./se_plan_ord.service");
const sequelize = require("../../config/db");
const fs = require("fs");

// Helper function để parse lock_info
function parseLockInfo(lock_info) {
  if (!lock_info) return null;
  const [user_code, fact_code, dept_code, desktop_ip] = lock_info.split("-");
  return { user_code, fact_code, dept_code, desktop_ip };
}

async function getAllSePlanOrd(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sePlanOrdService.getAllSePlanOrd(
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
    hasMore: result.hasMore,
    tableName: "SE_PLAN_ORD",
  });
}
async function getAllSePlanOrdLink(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sePlanOrdService.getAllSePlanOrdLink(
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
    hasMore: result.hasMore,
    tableName: "SE_PLAN_ORD",
  });
}
async function getAllFieldDropdown(req, res) {
  try {
    const { factory_code, field, language, page, limit, search, extraField } =
      req.query;
    const result = await sePlanOrdService.getAllFieldDropdown(
      factory_code,
      field,
      language,
      page,
      limit,
      search,
      extraField,
    );
    return res.status(200).json({
      message: "ok",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "SE_CUST",
    });
  } catch (error) {
    console.error("Error fetching field from PO_VENDER_M:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getAllPlanOrd(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sePlanOrdService.getAllPlanOrd(
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
    hasMore: result.hasMore,
    tableName: "SE_PLAN_ORD",
  });
}
async function getSePlanOrdByID(req, res) {
  const { factory_code, se_id, se_ver, se_seq, pack_gu, ship_seq } = req.query;
  const result = await sePlanOrdService.getSePlanOrdByID(
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function getShipSeq(req, res) {
  const {
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    department_code,
    user_code,
    query_level,
  } = req.query;
  const result = await sePlanOrdService.getShipSeq(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function getCBM(req, res) {
  const { factory_code, se_id, pack_gu, se_seq, se_ver, ship_seq } = req.query;
  const result = await sePlanOrdService.getCBM(
    factory_code,
    se_id,
    pack_gu,
    se_seq,
    se_ver,
    ship_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get single ac inm m successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function getMoney(req, res) {
  const { factory_code, se_id, department_code, user_code, query_level } =
    req.query;
  const result = await sePlanOrdService.getMoney(
    factory_code,
    se_id,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get money!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get money successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function getTempTable(req, res) {
  const { limit, offset } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.getTempTable(token, limit, offset);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get the temp table successfully!",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    tableName: "SE_PLAN_ORD",
  });
}
async function clearTempTable(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.clearTempTable(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Clear temp table successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function getTempTextTable(req, res) {
  const { limit, offset } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.getTempTextTable(token, limit, offset);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get the temp table successfully!",
    success: true,
    data: result.rows,
    hasMore: result.hasMore,
    tableName: "SE_PLAN_ORD",
  });
}
async function clearTempTextTable(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.clearTempTextTable(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Clear temp table successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function recreateTempTable(req, res) {
  const { factory_code, user_code } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.recreateTempTable(
    factory_code,
    user_code,
    token,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac inm m!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get the temp table successfully!",
    success: true,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function checkBoxItem(req, res) {
  const { is_check, factory_code, language } = req.query;
  const { data, filters, isAll } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.checkBoxItem(
    token,
    factory_code,
    data,
    is_check,
    filters,
    isAll,
    language,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "SE_PLAN_ORD",
  });
}
async function confirmCheckBox(req, res) {
  const { factory_code, department_code, user_code } = req.query;
  const { data } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sePlanOrdService.confirmCheckBox(
    factory_code,
    department_code,
    user_code,
    token,
    data,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    total_data: result.total_inserted,
    tableName: "SE_PLAN_ORD",
  });
}
async function confirm(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
  } = req.query;
  const result = await sePlanOrdService.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SE_PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    total_data: result.total_inserted,
    tableName: "SE_PLAN_ORD",
  });
}
async function addSePlanOrd(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSePlanOrdSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await sePlanOrdService.addSePlanOrd(
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
      message: "Add ac inm m tracking successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac inm m because", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function editSePlanOrd(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
    page_size,
  } = req.query;
  const { data } = req.body;
  const dataToValidate = {
    ...data,
    factory_code,
    se_id,
    se_ver,
    se_seq,
    pack_gu,
    ship_seq,
  };
  const { error, value } = createSePlanOrdSchema.validate(dataToValidate);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await sePlanOrdService.editSePlanOrd(
      factory_code,
      department_code,
      user_code,
      query_level,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
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

async function deleteSePlanOrd(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, se_id, se_ver, se_seq, pack_gu, ship_seq } =
      req.query;
    const data = req.body;
    const isDelete = await sePlanOrdService.deleteSePlanOrd(
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
      data,
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
async function confirmItemsSePlanOrd(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { data } = req.body;
    const result = await sePlanOrdService.confirmItemsSePlanOrd(
      factory_code,
      department_code,
      user_code,
      query_level,
      data,
      t,
    );
    if (!result) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot confirm because null!",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Confirm import material tracking successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from confirm controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function unconfirmItemsSePlanOrd(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { data } = req.body;
    const result = await sePlanOrdService.unconfirmItemsSePlanOrd(
      factory_code,
      department_code,
      user_code,
      query_level,
      data,
      t,
    );
    if (!result) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot unconfirm because null!",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Confirm import material tracking successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from confirm controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function searchSePlanOrd(req, res) {
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
    const shoes = await sePlanOrdService.searchSePlanOrd(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "SE_PLAN_ORD",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function searchPD(req, res) {
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
    const shoes = await sePlanOrdService.searchPD(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "SE_PLAN_ORD",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function searchSePlanOrdLink(req, res) {
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
    const shoes = await sePlanOrdService.searchSePlanOrdLink(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
      limit,
      offset,
    );
    return res.json({
      message: "search import material tracking successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "SE_PLAN_ORD",
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
    const filename = "SE_PLAN_ORD.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await sePlanOrdService.exportPDF(
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
// async function exportExcel(req, res) {
//   try {
//     const filename = "SE_PLAN_ORD";
//     const { factory_code, department_code, user_code, query_level } = req.query;
//     const { search } = req.body;
//     const workbook = await sePlanOrdService.exportExcel(
//       filename,
//       search,
//       factory_code,
//       department_code,
//       user_code,
//       query_level,
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error(" Export Excel error:", error);

//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: error.message || "Export Excel failed",
//       });
//     }
//   }
// }
async function exportExcel(req, res) {
  try {
    const filename = "SE_PLAN_ORD";
    const { factory_code, department_code, user_code, query_level, language } =
      req.query;
    const { search } = req.body;
    const workbook = await sePlanOrdService.exportExcel(
      filename,
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      language,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
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
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const result = await sePlanOrdService.importExcel(
      factory_code,
      user_code,
      token,
      req.file.buffer,
    );

    return res.json({
      success: true,
      message: `Imported ${result.total} rows successfully`,
      ...result,
    });
  } catch (error) {
    console.error("Error in importOrders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function exportMaterialToExcel(req, res) {
  try {
    const filename = "SE_PLAN_ORD";
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await sePlanOrdService.exportExcelMaterial(
      token,
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
      `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
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
async function exportEndMaterialToExcel(req, res) {
  try {
    const filename = "SE_PLAN_ORD";
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await sePlanOrdService.exportExcelEndMaterial(
      token,
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
      `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
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
async function exportShipOrderToExcel(req, res) {
  try {
    const filename = "SE_PLAN_ORD";
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    const workbook = await sePlanOrdService.exportExcelShipOrder(
      token,
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
      `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
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
async function exportToPP026Excel(req, res) {
  try {
    const filename = "SE_PLAN_ORD";
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { factory_code, department_code, user_code, query_level } = req.query;
    const { search } = req.body;
    console.log("auddu", search);

    const workbook = await sePlanOrdService.exportToPP026Excel(
      token,
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
      `attachment; filename=SE_PLAN_ORD_${Date.now()}.xlsx`,
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
    const filePath = await sePlanOrdService.exportExcelCustomAcImp(
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
  getAllSePlanOrd,
  getAllPlanOrd,
  getAllSePlanOrdLink,
  getSePlanOrdByID,
  getAllFieldDropdown,
  getShipSeq,
  getCBM,
  getMoney,
  getTempTable,
  clearTempTable,
  getTempTextTable,
  clearTempTextTable,
  addSePlanOrd,
  editSePlanOrd,
  exportPDF,
  deleteSePlanOrd,
  searchSePlanOrd,
  searchPD,
  searchSePlanOrdLink,
  exportExcel,
  exportMaterialToExcel,
  exportEndMaterialToExcel,
  exportShipOrderToExcel,
  exportCustomToExcel,
  exportToPP026Excel,
  confirmCheckBox,
  checkBoxItem,
  recreateTempTable,
  importExcel,
  confirm,
  confirmItemsSePlanOrd,
  unconfirmItemsSePlanOrd,
};
