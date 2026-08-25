const createAcItemRefSchema = require("./ac_item_ref.create.dto");
const acItemRefService = require("./ac_item_ref.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const { broadcast } = require("../../utils/sseManager");

async function getAllAcIR(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acItemRefService.getAllAcIR(
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
    tableName: "AC_ITEM_REF",
  });
}
async function getAcIRByID(req, res) {
  const { factory_code, item_acno, item_no } = req.query;
  const result = await acItemRefService.getAcIRByID(
    factory_code,
    item_acno,
    item_no,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item ref!",
      success: false,
      tableName: "AC_ITEM_REF",
    });
  }
  return res.status(200).json({
    message: "Get single  ac item ref successfully!",
    success: true,
    data: result,
    tableName: "AC_ITEM_REF",
  });
}
async function getAllWithItemNo(req, res) {
  const { item_no } = req.query;
  const result = await acItemRefService.getAllWithItemNo(item_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac item ref by item_no with mm_item!",
      success: false,
      tableName: "AC_ITEM_REF",
    });
  }
  return res.status(200).json({
    message: "Get single all ac item ref by item_no!",
    success: true,
    data: result,
    tableName: "AC_ITEM_REF",
  });
}
async function getByItemNo(req, res) {
  const { item_no } = req.query;
  const result = await acItemRefService.getByItemNo(item_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac item ref by item_no!",
      success: false,
      tableName: "AC_ITEM_REF",
    });
  }
  return res.status(200).json({
    message: "Get single all ac item ref by item_no!",
    success: true,
    data: result,
    tableName: "AC_ITEM_REF",
  });
}
async function getByItemAcno(req, res) {
  const {
    factory_code,
    item_acno,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  try {
    const acItemRef = await acItemRefService.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
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
      data: acItemRef.rows,
      total: acItemRef.count,
      hasMore: acItemRef.hasMore,
      tableName: "AC_ITEM_REF",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function updateStatusAcIR(req, res) {
  const { factory_code, item_acno, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  try {
    const acItemRef = await acItemRefService.updateStatusAcIR(
      factory_code,
      item_acno,
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
      tableName: "AC_ITEM_REF",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function addAcIR(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  
  const { data } = req.body;
  const { error, value } = createAcItemRefSchema.validate(data);
  broadcast({ table: "AC_ITEM_REF", action: "add" });
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const t = await sequelize.transaction();
  try {
    const response = await acItemRefService.addAcIR(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
    );
    broadcast({ table: "AC_ITEM_REF", action: "create" });
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
      message: "Add  ac item ref successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac item ref because", error);
    await t.rollback();
  }
}
async function editAcIR(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      item_acno,
      item_no,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      item_acno,
      item_no,
    };
    const { error, value } = createAcItemRefSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acItemRefService.editAcIR(
      factory_code,
      department_code,
      user_code,
      query_level,
      item_acno,
      item_no,
      value,
      page_size,
      t,
    );
    broadcast({ table: "AC_ITEM_REF", action: "edit" });
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  ac item ref",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac item ref successfully!",
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
    const { factory_code, item_acno, item_no } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acItemRefService.deleteAcIR(
      factory_code,
      item_acno,
      item_no,
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
      message: "Delete ac item ref successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcIR(req, res) {
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
    const shoes = await acItemRefService.searchAcIR(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac item ref successfully!",
      success: true,
      data: shoes.rows,
      totalMasters: shoes.totalMasters,
      totalDetails: shoes.totalDetails,
      mastersInPage: shoes.mastersInPage,
      masterKeys: shoes.masterKeys,
      masterInfo: shoes.masterInfo || null,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_ITEM_REF",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIR(req, res) {
  try {
    const filename = "factories.pdf";
    const pdf = await acItemRefService.exportPDFAcIR(filename);
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
  getAllAcIR,
  getAcIRByID,
  getAllWithItemNo,
  getByItemAcno,
  getByItemNo,
  updateStatusAcIR,
  addAcIR,
  editAcIR,
  deleteAcIR,
  searchAcIR,
  exportPDFAcIR,
};
