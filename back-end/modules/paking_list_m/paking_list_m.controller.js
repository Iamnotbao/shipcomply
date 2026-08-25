const pakingListMService = require("./paking_list_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createAcBomMSchema = require("./paking_list_m.create.dto");

async function getAllPLM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
    limit,
    offset,
  } = req.query;
  const result = await pakingListMService.getAllPLM(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
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
    tableName: "SD_ORD_M",
  });
}
async function getSPByID(req, res) {
  const { factory_code, pay_no } = req.query;
  const result = await pakingListMService.getSPByID(factory_code, pay_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single SD_ORD_M!",
      success: false,
      tableName: "SD_ORD_M",
    });
  }
  return res.status(200).json({
    message: "Get single  SD_ORD_M successfully!",
    success: true,
    data: result,
    tableName: "SD_ORD_M",
  });
}
async function addSP(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcBomMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await pakingListMService.addSP(
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
      message: "Add  SD_ORD_M successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  SD_ORD_M because", error);
    await t.rollback();
  }
}
async function editSP(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      pay_no,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      pay_no,
    };
    const { error, value } = createAcBomMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await pakingListMService.editSP(
      factory_code,
      department_code,
      user_code,
      query_level,
      pay_no,
      value,
      page_size,
      t,
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit  SD_ORD_M",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  SD_ORD_M successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deleteABM(req, res) {
  try {
    const { factory_code, prod_acno, item_acno } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await pakingListMService.deleteABM(
      factory_code,
      prod_acno,
      item_acno,
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
      message: "Delete SD_ORD_M successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchPLM(req, res) {
  const {search} = req.body;
  const {
    factory_code,
    user_code,
    query_level,
    department_code,
    language,
    limit,
    offset,
  } = req.query;
  console.log(search);
  try {
    const shoes = await pakingListMService.searchPLM(
      factory_code,
      user_code,
      query_level,
      department_code,
      language,
      search,
      limit,
      offset,
    );
    return res.json({
      message: "search SD_ORD_M successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.total,
      hasMore: shoes.hasMore,
      tableName: "SD_ORD_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFABM(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "SD_ORD_M";
    const pdf = await pakingListMService.exportPDFABM(
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
async function exportPDFToPakingList(req, res) {
  try {
    const { factory_code, department_code, user_code, query_level } = req.query;
    const filename = "PAKING_LIST_M.pdf";
    const pdf = await pakingListMService.exportPDFToPakingList(
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
    const filePath = await pakingListMService.exportExcelMaterialABM(
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
    const filePath = await pakingListMService.exportExcelCustomABM(
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
  getAllPLM,
  getSPByID,
  addSP,
  editSP,
  deleteABM,
  searchPLM,
  exportPDFABM,
  exportMaterialToExcel,
  exportCustomToExcel,
  exportPDFToPakingList
};
