const createIvTransDTwSchema = require("./iv_trans_d_tw.create.dto");
const ivTransDTwService = require("./iv_trans_d_tw.service");
const sequelize = require("../../config/db");
const fs = require("fs");

async function getAllIvTransDTw(req, res) {
  const { order_no, order_seq, limit, offset } = req.query;
  const result = await ivTransDTwService.getAllIvTransDTw(
    order_no,
    order_seq,
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
    tableName: "IV_TRANS_D_TW",
  });
}
async function getIvTransDTwById(req, res) {
  const { factory_code, item_acno, item_no } = req.query;
  const result = await ivTransDTwService.getIvTransDTwById(
    factory_code,
    item_acno,
    item_no,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item ref!",
      success: false,
      tableName: "IV_TRANS_D_TW",
    });
  }
  return res.status(200).json({
    message: "Get single  ac item ref successfully!",
    success: true,
    data: result,
    tableName: "IV_TRANS_D_TW",
  });
}

async function addIvTransDTw(req, res) {
  const { data } = req.body;
  const { error, value } = createIvTransDTwSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await ivTransDTwService.addIvTransDTw(value, t);
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
      data: response,
    });
  } catch (error) {
    console.log("Cannot add  ac item ref because", error);
    await t.rollback();
  }
}
async function editIvTransDTw(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, item_acno, item_no } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      item_acno,
      item_no,
    };
    const { error, value } = createIvTransDTwSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await ivTransDTwService.editIvTransDTw(
      factory_code,
      trans_no,
      trans_seq,
      value,
      t,
    );
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
      data: response,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function checkBoxL(req, res) {
  const {
    factory_code,
    order_no,
    order_seq,
    ac_code,
    plan_iqty,
    ord_qty,
    pr_formula,
    is_max,
  } = req.query;
  const { data } = req.body;
  const result = await ivTransDTwService.checkBoxL(
    factory_code,
    order_no,
    order_seq,
    ac_code,
    plan_iqty,
    ord_qty,
    pr_formula,
    is_max,
    data,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item ref!",
      success: false,
      tableName: "IV_TRANS_D_TW",
    });
  }
  return res.status(200).json({
    message: "Get single  ac item ref successfully!",
    success: true,
    data: result,
    tableName: "IV_TRANS_D_TW",
  });
}
async function checkBoxR(req, res) {
  const { order_no, order_seq } = req.query;
  const { all_checked_items } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const result = await ivTransDTwService.checkBoxR(
    order_no,
    order_seq,
    all_checked_items,
    token,
  );
  console.log("the result is over here", result);

  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw_ac_srcorder!",
      success: false,
      tableName: "VW_AC_SRCORDER",
    });
  }
  return res.status(200).json({
    message: "Get  vw_ac_srcorder by factory successfully!",
    success: true,
    data: result,
    tableName: "VW_AC_SRCORDER",
  });
}
async function deleteIvTDT(req, res) {
  try {
    const { factory_code, trans_no, trans_seq } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await ivTransDTwService.deleteIvTDT(
      factory_code,
      trans_no,
      trans_seq,
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
async function searchIvTDT(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await ivTransDTwService.searchIvTDT(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "search ac item ref successfully!",
      success: true,
      data: shoes,
      tableName: "IV_TRANS_D_TW",
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
  getAllIvTransDTw,
  getIvTransDTwById,
  checkBoxR,
  checkBoxL,
  addIvTransDTw,
  editIvTransDTw,
  deleteIvTDT,
  searchIvTDT,
  exportPDFAcIR,
  // exportMaterialToExcel,
  // exportCustomToExcel,
};
