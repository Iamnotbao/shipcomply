const programFieldTitleService = require("./program_field_title.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createPFTSchema = require("./program_field_title.create.dto");

async function getAllPFT(req, res) {
  const result = await programFieldTitleService.getAllPFT();
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAM_FIELD_TITLE",
  });
}
async function getColumnName(req, res) {
  const { table_name,language,table_type,relationship_name,specific_detail_table } = req.query;
  const result = await programFieldTitleService.getColumnName(table_name,language,table_type,relationship_name,specific_detail_table);
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAM_FIELD_TITLE",
  });
}
async function getUIControlName(req, res) {
  const { table_name,language } = req.query;
  const result = await programFieldTitleService.getUIControlName(table_name,language);
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAM_FIELD_TITLE",
  });
}
async function getPFTByID(req, res) {
  const { program_code, field_code } = req.query;
  const result = await programFieldTitleService.getPFTByID(program_code,field_code);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single program!",
      success: false,
      tableName: "PROGRAM_FIELD_TITLE",
    });
  }
  return res.status(200).json({
    message: "Get single factory successfully!",
    success: true,
    data: result,
    tableName: "PROGRAM_FIELD_TITLE",
  });
}
async function getPFTByProgram(req, res) {
  const { program_code } = req.query;
  try {
    const pft = await programFieldTitleService.getPFTByProgram(program_code);
    if (!pft) {
      return res.status(400).json({
        message: "This program field title does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get program field title by program ok !",
      success: true,
      data: pft,
      tableName: "PROGRAM_FIELD_TITLE",
    });
  } catch (error) {
    console.log("Cannot get the program field title by program",error);
  }
}
async function addPFT(req, res) {
  const { data } = req.body;
  const { error, value } = createPFTSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await programFieldTitleService.addPFT(value, t);
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
      message: "Add Program successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Cannot add program because", error);
    await t.rollback();
  }
}
async function editPFT(req, res) {
  const t = await sequelize.transaction();
  try {
    const { program_code, field_code } = req.query;
    const { data } = req.body;
    const { error, value } = createPFTSchema.validate(data);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await programFieldTitleService.editPFT(program_code,field_code, value, t);
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit program",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit program successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Can not edit from controller!");
    await t.rollback();
  }
}
async function deletePFT(req, res) {
  try {
    const { program_code,field_code } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await programFieldTitleService.deletePFT(program_code,field_code, t);
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
      message: "Delete program successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchPFT(req, res) {
  const keyword = req.body;
  console.log(keyword);
  try {
    const shoes = await programFieldTitleService.searchPFT(keyword);
    return res.json({
      message: "search program successfully!",
      success: true,
      data: shoes,
      tableName: "PROGRAM_FIELD_TITLE",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPFT(req, res) {
  try {
    const filename = "program_field_title.pdf";
    const pdf = await programFieldTitleService.exportPFT(filename);
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
  getAllPFT,
  getPFTByID,
  getPFTByProgram,
  addPFT,
  editPFT,
  deletePFT,
  searchPFT,
  exportPFT,
  getColumnName,
  getUIControlName
};
