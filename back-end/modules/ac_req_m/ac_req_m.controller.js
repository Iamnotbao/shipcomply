const acReqMService = require("./ac_req_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcReqMSchema = require("./ac_req_m.create.dto");

async function getAllARM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acReqMService.getAllARM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  if (result.message) {
    return res.status(409).json({
      success: false,
      message: result.message,
      tableName: "AC_REQ_M",
    });
  }
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_REQ_M",
  });
}
async function getARMByID(req, res) {
  const { factory_code, req_no } = req.query;
  const result = await acReqMService.getARMByID(factory_code, req_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single AC_REQ_M!",
      success: false,
      tableName: "AC_REQ_M",
    });
  }
  return res.status(200).json({
    message: "Get single  AC_REQ_M successfully!",
    success: true,
    data: result,
    tableName: "AC_REQ_M",
  });
}
async function confirmAll(req, res) {
  const { factory_code, department_code, user_code, query_level, req_no } =
    req.query;
  try {
    const result = await acReqMService.confirmAll(
      factory_code,
      department_code,
      user_code,
      query_level,
      req_no,
    );
    return res.status(200).json({
      message: "Get single  AC_REQ_M successfully!",
      success: true,
      data: result,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot confirm all ", error);
    return res.status(401).json({
      message: "Cannot confirm all ",
      success: false,
      tableName: "AC_REQ_M",
    });
  }
}
async function getInvoiceNoList(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  try {
    const invoiceList = await acReqMService.getInvoiceNoList(
      factory_code,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      is_status,
    );
    if (!invoiceList) {
      return res.status(400).json({
        message: "This invoice list does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get invoice list by factory_code ok",
      success: true,
      data: invoiceList.data,
      total: invoiceList.total,
      currentPage: invoiceList.currentPage,
      pageSize: invoiceList.pageSize,
      totalPages: invoiceList.totalPages,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac req m ", error);
  }
}
async function getAcNoList(req, res) {
  const {
    factory_code,
    invoice_no,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  try {
    const acNoList = await acReqMService.getAcNoList(
      factory_code,
      invoice_no,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      is_status,
    );
    if (!acNoList) {
      return res.status(400).json({
        message: "This invoice list does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac no list by factory_code ok",
      success: true,
      data: acNoList.data,
      total: acNoList.total,
      currentPage: acNoList.currentPage,
      pageSize: acNoList.pageSize,
      totalPages: acNoList.totalPages,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac req m ", error);
  }
}
async function getAllAcType(req, res) {
  const { factory_code, invoice_no, department_code, user_code, query_level } =
    req.query;
  try {
    const acNoList = await acReqMService.getAllAcType(
      factory_code,
      invoice_no,
      department_code,
      user_code,
      query_level,
    );
    if (!acNoList) {
      return res.status(400).json({
        message: "This invoice list does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac no list by factory_code ok",
      success: true,
      data: acNoList,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac req m ", error);
  }
}
async function getAcTypeDropdown(req, res) {
  const {
    factory_code,
    invoice_no,
    department_code,
    user_code,
    query_level,
    page,
    limit,
    search = "",
    isStatus,
  } = req.query;

  try {
    const acNoList = await acReqMService.getAcTypeDropdown(
      factory_code,
      invoice_no,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      isStatus,
    );
    if (!acNoList) {
      return res.status(400).json({
        message: "This invoice list does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac no list by factory_code ok",
      success: true,
      data: acNoList,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac req m ", error);
  }
}
async function getReqNo(req, res) {
  const {
    factory_code,
    year_month,
    factory_abbreviation,
    department_code,
    user_code,
    query_level,
  } = req.query;
  try {
    const reqNo = await acReqMService.getReqNo(
      factory_code,
      year_month,
      factory_abbreviation,
      department_code,
      user_code,
      query_level,
    );
    if (!reqNo) {
      return res.status(400).json({
        message: "This invoice list does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac no list by factory_code ok",
      success: true,
      data: reqNo,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac req m ", error);
  }
}
async function addARM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcReqMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acReqMService.addARM(
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
      message: "Add  AC_REQ_M successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  AC_REQ_M because", error);
    await t.rollback();
  }
}
async function editARM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      req_no,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      req_no,
    };
    const { error, value } = createAcReqMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acReqMService.editARM(
      factory_code,
      department_code,
      user_code,
      query_level,
      req_no,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  AC_REQ_M",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  AC_REQ_M successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteARM(req, res) {
  try {
    const { factory_code, req_no } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acReqMService.deleteARM(factory_code, req_no, t);
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
      message: "Delete AC_REQ_M successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchARM(req, res) {
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
    const shoes = await acReqMService.searchARM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search AC_REQ_M successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_REQ_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFARM(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "AC_REQ_M";
    const pdf = await acReqMService.exportPDFARM(
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
    const filePath = await acReqMService.exportExcelMaterialARM(
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
    const filePath = await acReqMService.exportExcelCustomARM(
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
async function applyFilterActivate(req, res) {
  const { orgId, reqNo, empId, pCharset } = req.query;
  const result = await acReqMService.applyFilterActivate(
    orgId,
    reqNo,
    empId,
    pCharset,
  );

  console.log("ressss", result);

  if (!result.success) {
    return res.status(401).json({
      message: result?.message,
      success: result?.success,
      data: result?.acNo,       // ✅ thêm vào
      errors: result?.errors,   // ✅ forward validation errors xuống client
      tableName: "AC_REQ_M",
    });
  }

  return res.status(200).json({
    message: result?.message,
    success: result?.success,
    data: result?.acNo,
    tableName: "AC_REQ_M",
  });
}
module.exports = {
  getAllARM,
  getARMByID,
  getInvoiceNoList,
  getAcNoList,
  getReqNo,
  getAllAcType,
  getAcTypeDropdown,
  addARM,
  editARM,
  deleteARM,
  searchARM,
  exportPDFARM,
  exportMaterialToExcel,
  exportCustomToExcel,
  applyFilterActivate,
  confirmAll,
};
