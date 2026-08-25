const createAcShoesMSchema = require("./ac_shoe_m.create.dto");
const acShoeMService = require("./ac_shoe_m.service");
const sequelize = require("../../config/db");
const { broadcast } = require("../../utils/sseManager");
const fs = require("fs");

async function getAllAcShoe(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acShoeMService.getAllAcShoeM(
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
    tableName: "AC_SHOE_M",
  });
}
async function getAllAcShoeWithProdRef(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await acShoeMService.getAllAcShoeMWithProdRef(
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
    tableName: "AC_SHOE_M",
  });
}
async function getAcItemnoDropdown(req, res) {
  const { factory_code, language, page, limit, search } = req.query;
  const result = await acShoeMService.getAcItemnoDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    tableName: "AC_SHOE_M",
  });
}
async function getShoeDropdown(req, res) {
  const { factory_code, language, page, limit, search } = req.query;
  const result = await acShoeMService.getShoeDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    tableName: "AC_SHOE_M",
  });
}
async function getAcShoeMByID(req, res) {
  const { factory_code, customs_shoe_id } = req.query;
  const result = await acShoeMService.getAcShoeMByID(
    factory_code,
    customs_shoe_id,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac shoe m!",
      success: false,
      tableName: "AC_SHOE_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac shoe m successfully!",
    success: true,
    data: result,
    tableName: "AC_SHOE_M",
  });
}
async function getAcShoeMBySize(req, res) {
  const { factory_code, department_code, user_code, query_level } = req.query;
  const result = await acShoeMService.getAcShoeMBySize(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get ac shoe m by shoe!",
      success: false,
      tableName: "AC_SHOE_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac shoe m successfully!",
    success: true,
    data: result,
    tableName: "AC_SHOE_M",
  });
}
async function linkToBom(req, res) {
  const {
    factory_code,
    user_code,
    department_code,
    query_level,
    ip,
    customs_shoe_id,
    ac_code,
    prod_no,
    date_time,
  } = req.query;
  const result = await acShoeMService.linktoBom(
    factory_code,
    user_code,
    department_code,
    query_level,
    ip,
    customs_shoe_id,
    ac_code,
    prod_no,
    date_time,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot link to bom!",
      success: false,
      tableName: "AC_SHOE_M",
    });
  }
  return res.status(200).json({
    message: "link bom successfully!",
    success: true,
    data: result,
    tableName: "AC_SHOE_M",
  });
}
async function addAcShoeM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcShoesMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acShoeMService.addAcShoeM(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
    );
    broadcast({ table: "AC_SHOE_M", action: "create" });
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
      message: "Add  ac shoe m successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac shoe m because", error);
    await t.rollback();
  }
}
async function editAcShoeM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      customs_shoe_id,
    };
    const { error, value } = createAcShoesMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acShoeMService.editAcShoeM(
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      value,
      page_size,
      t,
    );
    broadcast({table : "AC_SHOE_M", action: "edit"});
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit ac shoe m ",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac shoe m successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac shoe m from controller!");
    await t.rollback();
  }
}
async function deleteAcShoeM(req, res) {
  try {
    const { factory_code, customs_shoe_id } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acShoeMService.deleteAcShoeM(
      factory_code,
      customs_shoe_id,
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
      message: "Delete ac shoe m  successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcShoeM(req, res) {
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
    const shoes = await acShoeMService.searchAcShoeM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac shoe m  successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_SHOE_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportExcelAcShoeM(req, res) {
  try {
    const filename = "AC_SHOE_M";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const workbook = await acShoeMService.exportExcelAcShoeM(
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
      `attachment; filename=AC_SHOE_M_${Date.now()}.xlsx`,
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
    const result = await acShoeMService.importExcel(
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
module.exports = {
  getAllAcShoe,
  getAllAcShoeWithProdRef,
  getAcShoeMByID,
  getAcShoeMBySize,
  linkToBom,
  addAcShoeM,
  editAcShoeM,
  deleteAcShoeM,
  searchAcShoeM,
  exportExcelAcShoeM,
  getAcItemnoDropdown,
  getShoeDropdown,
  importExcel
};
