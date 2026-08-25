const vwAcSrcOrderService = require("./vw_ac_srcorder.service");
const fs = require("fs");

async function getListOfAcSrcorder(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    vend_no,
    invoice_no,
    limit,
    offset,
    language,
    is_max,
  } = req.query;
  const result = await vwAcSrcOrderService.getListOfAcSrcorder(
    factory_code,
    department_code,
    user_code,
    query_level,
    vend_no,
    invoice_no,
    limit,
    offset,
    language,
    is_max,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of ac shoebom!",
      success: false,
      tableName: "VW_AC_SRCORDER",
    });
  }
  return res.status(200).json({
    message: "successfully get all vw ac srcorder!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "VW_AC_SRCORDER",
  });
}
async function getRD(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await vwAcSrcOrderService.getRD(token);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get rd temp table!",
      success: false,
      tableName: "VW_AC_SRCORDER",
    });
  }
  return res.status(200).json({
    message: "Get  rd temp table successfully!",
    success: true,
    data: result,
    tableName: "VW_AC_SRCORDER",
  });
}
async function clearRD(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    await vwAcSrcOrderService.clearRD(token);
    return res.status(200).json({
      message: "Get  rd temp table successfully!",
      success: true,
      tableName: "RD_TEMP",
    });
  } catch (error) {
    console.log("the error", error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}
async function checkBoxL(req, res) {
  const { factory_code, order_no, order_seq, is_check, is_max } = req.query;
  const { plan_iqty, all_items } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await vwAcSrcOrderService.checkBoxL(
    factory_code,
    order_no,
    order_seq,
    is_check,
    is_max,
    plan_iqty,
    token,
    all_items,
  );
  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
      is_check: result.is_check,
      data: result,
    });
  }
  return res.status(200).json({ success: true, data: result });
}
async function confirmAll(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    vend_no,
  } = req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await vwAcSrcOrderService.confirmAll(
    factory_code,
    department_code,
    user_code,
    query_level,
    req_no,
    vend_no,
    token,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "VW_AC_SRCORDER",
    });
  }
  return res.status(200).json({
    message: "Get single vw ac srcorder successfully!",
    success: true,
    data: result,
    tableName: "VW_AC_SRCORDER",
  });
}
async function updateBlQty(req, res) {
  const { factory_code, is_max, is_check } = req.query;
  const { gridData, new_bl_qty, plan_iqty, force } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await vwAcSrcOrderService.updateBlQty(
    factory_code,
    is_max,
    is_check,
    gridData,
    new_bl_qty,
    plan_iqty,
    token,
    force,
  );
  if (!result.success) {
    return res.status(200).json({
      success: result.success,
      message: result.message,
      bl_qty: result.bl_qty,
      ac_req: result?.ac_req,
      canForce: result?.canForce,
      message: result?.message,
    });
  }
  return res.status(200).json({
    success: true,
    bl_qty: result.bl_qty,
    ac_req: result.ac_req,
    ttl_qty: result.ttl_qty,
    v_planqty: result.v_planqty,
    v_leftpo: result.v_leftpo,
    v_leftac: result.v_leftac,
  });
}
async function updateCus(req, res) {
  const {
    factory_code,
    order_no,
    order_seq,
    item_id,
    item_type,
    is_check = "Y",
    is_max = false,
    order_qty,
    chge_ordqty,
    order_acqty,
    req_acqty,
  } = req.query;
  const { new_bl_qty, plan_iqty, force } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const result = await vwAcSrcOrderService.updateCus(
      token,
      factory_code,
      order_no,
      order_seq,
      item_id,
      item_type,
      new_bl_qty,
      is_check,
      is_max,
      plan_iqty,
      order_qty,
      chge_ordqty,
      order_acqty,
      req_acqty,
      force,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot get single vw ac srcorder!",
        success: false,
        tableName: "VW_AC_ALLCHK",
      });
    }
    return res.status(200).json({
      message: "Get single vw ac srcorder successfully!",
      success: true,
      data: result,
      tableName: "VW_AC_ALLCHK",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
      error_code: error.code,
      error_type: error.type,
      tableName: "VW_AC_ALLCHK",
    });
  }
}
async function getPlanMax(req, res) {
  const { factory_code, order_no, order_seq, is_max } = req.query;
  const result = await vwAcSrcOrderService.getPlanMax(
    factory_code,
    order_no,
    order_seq,
    is_max,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single vw ac srcorder!",
      success: false,
      tableName: "VW_AC_ALLCHK",
    });
  }
  return res.status(200).json({
    message: "Get single vw ac srcorder successfully!",
    success: true,
    data: result,
    tableName: "VW_AC_ALLCHK",
  });
}
async function searchVwAcSrcorder(req, res) {
  const { search } = req.body;
  const { factory_code, language, limit, offset, is_max } = req.query;
  try {
    const shoes = await vwAcSrcOrderService.searchVwAcSrcorder(
      search,
      factory_code,
      language,
      limit,
      offset,
      is_max,
    );
    return res.json({
      message: "search ac_bom_m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "VW_AC_SRCORDER",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFVwAcShoeBom(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "VW_AC_SRCORDER";
    const pdf = await vwAcSrcOrderService.exportPDFVwAcShoeBom(
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
    const filePath = await vwAcSrcOrderService.exportExcelMaterialABM(
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
    const filePath = await vwAcSrcOrderService.exportExcelCustomABM(
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
  getListOfAcSrcorder,
  getRD,
  clearRD,
  checkBoxL,
  confirmAll,
  updateBlQty,
  searchVwAcSrcorder,
  exportPDFVwAcShoeBom,
  exportMaterialToExcel,
  exportCustomToExcel,
  getPlanMax,
  updateCus,
};
