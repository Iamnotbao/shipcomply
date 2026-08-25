const acReqOrderService = require("./ac_req_order.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcVendBaseSchema = require("./ac_req_order.create.dto");
const createAcReqOrderSchema = require("./ac_req_order.create.dto");

async function getAllAcRO(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await acReqOrderService.getAllAcRO(
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
    tableName: "AC_REQ_ORDER",
  });
}
async function getAcROByID(req, res) {
  const { factory_code, req_no, req_seq } = req.query;
  const result = await acReqOrderService.getAcROByID(
    factory_code,
    req_no,
    req_seq,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac vend base!",
      success: false,
      tableName: "AC_REQ_ORDER",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result,
    tableName: "AC_REQ_ORDER",
  });
}
async function getAcROByReqNo(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    limit,
    offset,
  } = req.query;
  const result = await acReqOrderService.getAcROByReqNo(
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac req orderr!",
      success: false,
      tableName: "AC_REQ_ORDER",
    });
  }
  return res.status(200).json({
    message: "Get all ac req order by req no successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_REQ_ORDER",
  });
}
async function getAllAcROByID(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    id,
    limit,
    offset,
  } = req.query;
  const result = await acReqOrderService.getAllAcROByID(
    factory_code,
    department_code,
    user_code,
    query_level,
    id,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac req orderr!",
      success: false,
      tableName: "AC_REQ_ORDER",
    });
  }
  return res.status(200).json({
    message: "Get all ac req order by req no successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_REQ_ORDER",
  });
}
async function getAllAcSendByCategory(req, res) {
  const {
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
  } = req.query;
  const result = await acReqOrderService.getAllAcSendByCategory(
    factory_code,
    category_code,
    vend_no,
    user_code,
    department_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_REQ_ORDER",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result,
    tableName: "AC_REQ_ORDER",
  });
}
async function getAllVendNoByStatus(req, res) {
  const { factory_code, user_code, department_code, query_level } = req.query;
  const result = await acReqOrderService.getAllVendNoByStatus(
    factory_code,
    user_code,
    department_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_REQ_ORDER",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac vend base successfully!",
    success: true,
    data: result,
    tableName: "AC_REQ_ORDER",
  });
}
async function addAcRO(req, res) {
  const { page_size } = req.query;
  const { data } = req.body;
  const { error, value } = createAcVendBaseSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acReqOrderService.addAcRO(value, page_size, t);
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
      message: "Add ac vend base successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add ac vend base because", error);
    await t.rollback();
  }
}
async function editAcRO(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      req_no,
      req_seq,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      req_no,
      req_seq,
    };
    const { error, value } = createAcReqOrderSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acReqOrderService.editAcRO(
      factory_code,
      department_code,
      user_code,
      query_level,
      req_no,
      req_seq,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit ac vend base",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac vend base  successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac vend base from controller!", error);
    await t.rollback();
  }
}
async function deleteAcRO(req, res) {
  try {
    const { factory_code, req_no, req_seq } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acReqOrderService.deleteacRO(
      factory_code,
      req_no,
      req_seq,
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
      message: "Delete ac vend base successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcRO(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await acReqOrderService.searchAcRO(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "search ac vend base successfully!",
      success: true,
      data: shoes,
      tableName: "AC_REQ_ORDER",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcVB(req, res) {
  try {
    const filename = "AC_REQ_ORDER.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await acReqOrderService.exportPDFAcVB(
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
async function exportExcelAcVB(req, res) {
  try {
    console.log("req", req);
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const workbook = await acReqOrderService.exportExcelAcVB(
      data,
      "AC_REQ_ORDER",
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=AC_REQ_ORDER_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
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
  getAllAcRO,
  getAcROByID,
  getAllAcSendByCategory,
  getAllVendNoByStatus,
  getAcROByReqNo,
  getAllAcROByID,
  addAcRO,
  editAcRO,
  deleteAcRO,
  searchAcRO,
  exportPDFAcVB,
  exportExcelAcVB,
  // exportMaterialToExcel,
  // exportCustomToExcel
};
