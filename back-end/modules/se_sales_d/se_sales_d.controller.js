// SE_SALES_D.controller.js
const { createSeShippingDSchema } = require("./se_sales_d.create.dto");
const seSalesDService = require("./se_sales_d.service");
const sequelize = require("../../config/db");

async function getAllSeSalesD(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    sales_id,
    language,
    limit,
    offset,
  } = req.query;
  const result = await seSalesDService.getAllSeSalesD(
    factory_code,
    department_code,
    user_code,
    query_level,
    sales_id,
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
    tableName: "SE_SALES_D",
  });
}

async function getSeShipingDByID(req, res) {
  const { factory_code, cust_id, si_seq, si_type } = req.query;
  const result = await seSalesDService.getSeShipingDByID(
    factory_code,
    cust_id,
    si_seq,
    si_type,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "SE_SALES_D",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "SE_SALES_D",
  });
}
async function updateStatusAID(req, res) {
  const { factory_code, inm_no, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  try {
    const acItemRef = await seSalesDService.updateStatusAID(
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
      tableName: "SE_SALES_D",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function addSSD(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createSeShippingDSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await seSalesDService.addSSD(
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

async function editSSD(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      cust_id,
      si_seq,
      si_type,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      cust_id,
      si_seq,
      si_type,
    };
    const { error, value } = createSeShippingDSchema.validate(dataToValidate);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await seSalesDService.editSSD(
      factory_code,
      department_code,
      user_code,
      query_level,
      cust_id,
      si_seq,
      si_type,
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
    const result = await seSalesDService.searchAcInmD(
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
      tableName: "SE_SALES_D",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getAllSeSalesD,
  getSeShipingDByID,
  updateStatusAID,
  addSSD,
  editSSD,
  searchAcInmD,
};
