// SE_PLAN_ORD.controller.js
const planOrdService = require("./plan_ord.service");
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
  const result = await planOrdService.getAllPlanOrd(
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
    const shoes = await planOrdService.searchPD(
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
async function checkBox(req, res) {
  const {
    ac_no,
    se_id,
    se_seq,
    ship_seq,
    se_ver,
    pack_gu,
    is_check,
    factory_code,
  } = req.query;
  const { filters,isAll } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await planOrdService.checkBox(
    ac_no,
    se_id,
    se_seq,
    ship_seq,
    se_ver,
    pack_gu,
    is_check,
    token,
    filters,
    factory_code,
    isAll
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function confirmPD(req, res) {
  const { factory_code, ac_no, language, cont_no, status1 } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await planOrdService.confirmPD(
    factory_code,
    ac_no,
    language,
    cont_no,
    status1,
    token,
  );
  if (result.success === false) {
    return res.status(401).json({
      message: result.message,
      success: result.success,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function getTempTable(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await planOrdService.getPlanSelections(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get temp table!",
      success: false,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Get temp table successfully!",
    success: true,
    data: result,
    tableName: "PLAN_ORD",
  });
}
async function clearTempTable(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await planOrdService.clearPlanSession(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot clear temp table!",
      success: false,
      tableName: "PLAN_ORD",
    });
  }
  return res.status(200).json({
    message: "Clear temp table successfully!",
    success: true,
    data: result,
    tableName: "PLAN_ORD",
  });
}
module.exports = {
  getAllPlanOrd,
  searchPD,
  checkBox,
  confirmPD,
  getTempTable,
  clearTempTable,
};
