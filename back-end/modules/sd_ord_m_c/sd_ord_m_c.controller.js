const sdOrdMCService = require("./sd_ord_m_c.service");
async function getAllFieldDropdown(req, res) {
  const { factory_code, field, language, page, limit, search, extraField } =
    req.query;
  const result = await sdOrdMCService.getAllFieldDropdown(
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
    tableName: "SD_ORD_M_C",
  });
}
async function getAllPackingSeidDropdown(req, res) {
  const { factory_code, page, limit, search } = req.query;
  const result = await sdOrdMCService.getAllPackingSeidDropdown(
    factory_code,
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
    totalPages: result.totalPages,
    tableName: "SD_ORD_M_C",
  });
}
async function checkBox(req, res) {
  const { se_id, se_seq, pack_gu, pack_status, is_check, factory_code } =
    req.query;
  const { filters, isAll } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sdOrdMCService.checkBox(
    se_id,
    se_seq,
    pack_gu,
    pack_status,
    is_check,
    token,
    filters,
    isAll,
    factory_code,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SD_ORD_M_C",
    });
  }
  return res.status(200).json({
    message: "Get single vw ac srcorder successfully!",
    success: true,
    data: result,
    tableName: "SD_ORD_M_C",
  });
}
async function getAllSeOrdItem(req, res) {
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
    const result = await sdOrdMCService.getAllSeOrdItem(
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
      tableName: "SD_ORD_M_C",
    });
  } catch (error) {
    console.log("loi o roi", error);
  }
}
async function getSysTree(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sdOrdMCService.getSysTree(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SD_ORD_M_C",
    });
  }
  return res.status(200).json({
    message: "Get single vw ac srcorder successfully!",
    success: true,
    data: result,
    tableName: "SD_ORD_M_C",
  });
}
async function clearSysTree(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sdOrdMCService.clearSysTree(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SD_ORD_M_C",
    });
  }
  return res.status(200).json({
    message: "Get single vw ac srcorder successfully!",
    success: true,
    data: result,
    tableName: "SD_ORD_M_C",
  });
}
async function searchSeOrdItem(req, res) {
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
    const result = await sdOrdMCService.searchSeOrdItem(
      search,
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
      total: result.total,
      hasMore: result.hasMore,
      tableName: "SD_ORD_M_C",
    });
  } catch (error) {
    console.log("loi o roi", error);
  }
}
async function createPlan(req, res) {
  const { factory_code, plan_date, user_code, department_code, last_user } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const result = await sdOrdMCService.createPlan(
    factory_code, plan_date, token,
    user_code, department_code, last_user,
  );

  if (!result) {
    return res.status(401).json({ message: "Cannot get single vw ac srcorder!", success: false });
  }

  if (!result.success) {
    const hasDuplicate = result.results?.errors?.some(
      (e) => e.error_code === 'DUPLICATE_KEY'
    );

    return res.status(hasDuplicate ? 409 : 400).json({
      message: result.message,
      success: false,
      error_code: hasDuplicate ? 'DUPLICATE_KEY' : 'PLAN_ERROR', 
      data: result.results,
      tableName: "SD_ORD_M_C",
    });
  }

  return res.status(200).json({
    message: result.message,
    success: true,
    data: result.results,
    tableName: "SD_ORD_M_C",
  });
}
async function updatePDD(req, res) {
  const { search } = req.body;
  const { factory_code, user_code } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await sdOrdMCService.updatePDD(
    factory_code,
    user_code,
    search,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "SD_ORD_M_C",
    });
  }
  return res.status(200).json({
    message: result.message,
    success: result.success,
    data: result.data,
    tableName: "SD_ORD_M_C",
  });
}
module.exports = {
  getAllFieldDropdown,
  getAllPackingSeidDropdown,
  getAllSeOrdItem,
  searchSeOrdItem,
  checkBox,
  getSysTree,
  createPlan,
  updatePDD,
  clearSysTree
};
