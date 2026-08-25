const createAcItemRefSchema = require("./ac_send_base.create.dto");
const acSendBaseService = require("./ac_send_base.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcSendBaseSchema = require("./ac_send_base.create.dto");

async function getAllAcSB(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acSendBaseService.getAllAcSB(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_SEND_BASE",
  });
}
async function getAcSBByID(req, res) {
  const { factory_code, ac_send } = req.query;
  const result = await acSendBaseService.getAcSBByID(factory_code, ac_send);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac send base!",
      success: false,
      tableName: "AC_SEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  ac send base successfully!",
    success: true,
    data: result,
    tableName: "AC_SEND_BASE",
  });
}

async function getByItemNo(req, res) {
  const { item_no } = req.query;
  const result = await acSendBaseService.getByItemNo(item_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac send base by item_no!",
      success: false,
      tableName: "AC_SEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single all ac send base by item_no!",
    success: true,
    data: result,
    tableName: "AC_SEND_BASE",
  });
}
async function getFieldDrop(req, res) {
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      d_type,
      page,
      limit,
      search,
      is_status
    } = req.query;
    const result = await acSendBaseService.getFieldDrop(
      factory_code,
      department_code,
      user_code,
      query_level,
      field,
      d_type,
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
      totalPages: result.totalPages,
      tableName: "AC_SEND_BASE",
    });
  } catch (error) {
    console.error("Error fetching field from AC_SEND_BASE:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
async function getByItemAcno(req, res) {
  const { factory_code, item_acno, department_code, user_code, query_level } =
    req.query;
  try {
    const acItemRef = await acSendBaseService.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level,
    );
    if (!acItemRef) {
      return res.status(400).json({
        message: "This ac send base does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac send base by category ok",
      success: true,
      data: acItemRef,
      tableName: "AC_SEND_BASE",
    });
  } catch (error) {
    console.log("Cannot get the single ac send base ", error);
  }
}
async function getAllAcSendByCategory(req, res) {
  const {
    factory_code,
    category_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  const result = await acSendBaseService.getAllAcSendByCategory(
    factory_code,
    category_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_SEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac send base successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "AC_SEND_BASE",
  });
}
async function getAllTypeByCategory(req, res) {
  const {
    factory_code,
    category_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  } = req.query;
  const result = await acSendBaseService.getAllTypeByCategory(
    factory_code,
    category_code,
    user_code,
    department_code,
    query_level,
    language,
    page,
    limit,
    search,
    is_status,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "AC_SEND_BASE",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac send base successfully!",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    tableName: "AC_SEND_BASE",
  });
}
async function addAcSB(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;

  const { error, value } = createAcSendBaseSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acSendBaseService.addAcSB(
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
      message: "Add  ac send base successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac send base because", error);
    await t.rollback();
  }
}
async function editAcSB(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      page_size,
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_send,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      ac_send,
    };
    const { error, value } = createAcSendBaseSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acSendBaseService.editAcSB(
      factory_code,
      department_code,
      user_code,
      query_level,
      ac_send,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  ac send base",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac send base successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteAcIR(req, res) {
  try {
    const { factory_code, ac_send } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acSendBaseService.deleteAcIR(
      factory_code,
      ac_send,
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
      message: "Delete ac send base successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcSB(req, res) {
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
    const shoes = await acSendBaseService.searchAcSB(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac send base successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_SEND_BASE",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcSB(req, res) {
  try {
    const filename = "ac_send_base.pdf";
    const pdf = await acSendBaseService.exportPDFAcSB(filename);
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
  getAllAcSB,
  getAcSBByID,
  getByItemAcno,
  getByItemNo,
  getAllAcSendByCategory,
  getAllTypeByCategory,
  getFieldDrop,
  addAcSB,
  editAcSB,
  deleteAcIR,
  searchAcSB,
  exportPDFAcSB,
  // exportMaterialToExcel,
  // exportCustomToExcel,
};
