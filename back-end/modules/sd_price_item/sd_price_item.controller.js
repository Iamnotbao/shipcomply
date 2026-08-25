// SD_PRICE_ITEM.controller.js
const { createSeShippingDSchema } = require("./sd_price_item.create.dto");
const sdPriceItemService = require("./sd_price_item.service");
const sequelize = require("../../config/db");

async function getAllSPI(req, res) {
  const {
    factory_code,
    user_code,
    department_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sdPriceItemService.getAllSPI(
    factory_code,
    user_code,
    department_code,
    query_level,
    se_id,
    se_ver,
    se_seq,
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
    tableName: "SD_PRICE_ITEM",
  });
}
async function getAllSPIForInvM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    invoice_id,
    language,
    limit,
    offset,
  } = req.query;
  const result = await sdPriceItemService.getAllSPIForInvM(
    factory_code,
    department_code,
    user_code,
    query_level,
    ac_no,
    invoice_id,
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
    tableName: "SD_PRICE_ITEM",
  });
}
async function getSeShipingDByID(req, res) {
  const { factory_code, cust_id, si_seq, si_type } = req.query;
  const result = await sdPriceItemService.getSeShipingDByID(
    factory_code,
    cust_id,
    si_seq,
    si_type,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single import material tracking!",
      success: false,
      tableName: "SD_PRICE_ITEM",
    });
  }
  return res.status(200).json({
    message: "Get single import material tracking successfully!",
    success: true,
    data: result,
    tableName: "SD_PRICE_ITEM",
  });
}
async function updateStatusAID(req, res) {
  const { factory_code, inm_no, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  try {
    const acItemRef = await sdPriceItemService.updateStatusAID(
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
      tableName: "SD_PRICE_ITEM",
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
    const response = await sdPriceItemService.addSSD(
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
    const response = await sdPriceItemService.editSSD(
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
    const result = await sdPriceItemService.searchAcInmD(
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
      tableName: "SD_PRICE_ITEM",
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
  getAllSPI,
  getAllSPIForInvM,
  getSeShipingDByID,
  updateStatusAID,
  addSSD,
  editSSD,
  searchAcInmD,
};
