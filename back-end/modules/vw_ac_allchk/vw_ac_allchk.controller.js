const vwAcAllChkService = require("./vw_ac_allchk.service");
const fs = require("fs");

async function getListOfAcAllChk(req, res) {
  const {
    factory_code,
    vend_no,
    order_no,
    chk_no,
    rs_date,
    re_date,
    s_cfm,
    e_cfm,
    is_item,
    ac_type,
    limit,
    offset,
  } = req.query;
  const result = await vwAcAllChkService.getListOfAcAllChk(
    factory_code,
    vend_no,
    order_no,
    chk_no,
    rs_date,
    re_date,
    s_cfm,
    e_cfm,
    is_item,
    ac_type,
    limit,
    offset,
  );

  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw_ac_allchk!",
      success: false,
      tableName: "VW_AC_ALLCHK",
    });
  }
  return res.status(200).json({
    message: "Get  ac shoebom by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "VW_AC_ALLCHK",
  });
}
async function getDropdownByField(req, res) {
  const { factory_code, field, page = 1, limit = 10, search = "" } = req.query;

  try {
    const result = await vwAcAllChkService.getDropdownByField(
      factory_code,
      field,
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
      tableName: "VW_AC_ALLCHK",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function checkB(req, res) {
  const { factory_code, is_check } = req.query;
  const { data, all_items } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await vwAcAllChkService.checkB(
    factory_code,
    is_check,
    token,
    data,
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
  const { factory_code, user_code, department_code, req_no, vend_no } =
    req.query;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const result = await vwAcAllChkService.confirmAll(
      factory_code,
      user_code,
      department_code,
      req_no,
      vend_no,
      token,
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
    return res.status(401).json({
      message: error.message,
      success: false,
      tableName: "VW_AC_ALLCHK",
    });
  }
}
async function approveCont(req, res) {
  const { factory_code, req_no, invoice_no, user_code } = req.query;
  try {
    const result = await vwAcAllChkService.approveCont(
      factory_code,
      req_no,
      invoice_no,
      user_code,
    );
    if (!result.success) {
      return res.status(401).json({
        message: result?.message,
        success: result?.success,
        tableName: "VW_AC_ALLCHK",
      });
    }
    return res.status(200).json({
      message: result?.message,
      success: result?.success,
      data: result?.ac_no,
      tableName: "VW_AC_ALLCHK",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Cannot approve contract",
      success: false,
      error_code: error.code,
      error_type: error.type,
      tableName: "VW_AC_ALLCHK",
    });
  }
}
async function addContractNumb(req, res) {
  const { factory_code, req_no, vend_no, req_date, ac_type } = req.query;
  try {
    const result = await vwAcAllChkService.addContractNumb(
      factory_code,
      req_no,
      vend_no,
      req_date,
      ac_type,
    );
    if (!result) {
      return res.status(401).json({
        message: "Cannot add contract number!",
        success: false,
        tableName: "VW_AC_ALLCHK",
      });
    }
    return res.status(200).json({
      message: " Add contract number successfully!",
      success: true,
      data: result,
      tableName: "VW_AC_ALLCHK",
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      success: false,
      tableName: "VW_AC_ALLCHK",
    });
  }
}
async function searchVwAcAllChk(req, res) {
  const { search } = req.body;
  const { factory_code, limit, offset } = req.query;
  console.log(search);
  try {
    const shoes = await vwAcAllChkService.searchVwAcAllChk(
      search,
      factory_code,
      limit,
      offset,
    );
    return res.json({
      message: "search ac_bom_m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "VW_AC_ALLCHK",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFVwAcShoeBom(req, res) {
  try {
    const { factory_code, req_no, vend_no, s_date, e_date } = req.query;
    const filename = "VW_AC_ALLCHK";
    const filters = {
      factory_code: factory_code,
      req_no: req_no,
      vend_no: vend_no,
      s_date: s_date,
      e_date: e_date,
    };
    const excelGen = await vwAcAllChkService.exportPDFVwAcShoeBom(filters);
    res.download(excelGen, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Export Excel failed",
    });
  }
}

const exportVwAcAllChkExcel = async (req, res) => {
  try {
    const { factory_code, req_no, vend_no, s_date, e_date, filename } =
      req.query;
    const filters = {
      factory_code: factory_code,
      req_no: req_no,
      vend_no: vend_no,
      s_date: s_date,
      e_date: e_date,
    };
    // Generate Excel buffer
    const buffer = await vwAcAllChkService.exportVwAcAllChkExcel(filters);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    // Send buffer
    res.send(buffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      message: "Error exporting to Excel",
      error: error.message,
    });
  }
};
module.exports = {
  getListOfAcAllChk,
  checkB,
  approveCont,
  addContractNumb,
  confirmAll,
  searchVwAcAllChk,
  exportPDFVwAcShoeBom,
  exportVwAcAllChkExcel,
  getDropdownByField,
};
