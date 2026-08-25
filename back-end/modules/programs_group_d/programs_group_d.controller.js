const createProgramsGroupDSchema = require("./programs_group_d.create.dto");
const programsGroupDService = require("./programs_group_d.service");
const sequelize = require("../../config/db");
const fs = require("fs");


async function getAllPGD(req, res) {
  const result = await programsGroupDService.getAllPGD(
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_D",
  });
}
async function getAcIRByID(req, res) {
  const { factory_code, item_acno, item_no } = req.query;
  const result = await programsGroupDService.getAcIRByID(
    factory_code,
    item_acno,
    item_no
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item ref!",
      success: false,
      tableName: "PROGRAMS_GROUP_D",
    });
  }
  return res.status(200).json({
    message: "Get single  ac item ref successfully!",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_D",
  });
}

async function getByItemNo(req, res) {
  const { item_no } = req.query;
  const result = await programsGroupDService.getByItemNo(
    item_no
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac item ref by item_no!",
      success: false,
      tableName: "PROGRAMS_GROUP_D",
    });
  }
  return res.status(200).json({
    message: "Get single all ac item ref by item_no!",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_D",
  });
}
async function getByItemAcno(req, res) {
  const {
    factory_code,
    item_acno,
    department_code,
    user_code,
    query_level,
  } = req.query;
  try {
    const acItemRef = await programsGroupDService.getByItemAcno(
      factory_code,
      item_acno,
      department_code,
      user_code,
      query_level
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
      tableName: "PROGRAMS_GROUP_D",
    });
  } catch (error) {
    console.log("Cannot get the single ac item ref ", error);
  }
}
async function addAcIR(req, res) {
  const { data } = req.body;
  const { error, value } = createProgramsGroupDSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await programsGroupDService.addAcIR(value, t);
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
async function editAcIR(req, res) {
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
    const { error, value } =
      createProgramsGroupDSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await programsGroupDService.editAcIR(
      factory_code,
      item_acno,
      item_no,
      value,
      t
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
async function deleteAcIR(req, res) {
  try {
    const { factory_code, item_acno, item_no } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await programsGroupDService.deleteAcIR(
      factory_code,
      item_acno,
      item_no,
      t
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
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await programsGroupDService.searchAcIR(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level
    );
    return res.json({
      message: "search ac item ref successfully!",
      success: true,
      data: shoes,
      tableName: "PROGRAMS_GROUP_D",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIR(req, res) {
  try {
    const filename = "factories.pdf";
    const pdf = await programsGroupDService.exportPDFAcIR(filename);
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
  getAllPGD,
  getAcIRByID,
  getByItemAcno,
  getByItemNo,
  addAcIR,
  editAcIR,
  deleteAcIR,
  searchAcIR,
  exportPDFAcIR,
  // exportMaterialToExcel,
  // exportCustomToExcel,
};
