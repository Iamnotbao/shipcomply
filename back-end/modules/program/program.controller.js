const programService = require("./program.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createProgramSchema = require("./program.create.dto");

async function getAllProgram(req, res) {
  const result = await programService.getAllProgram();
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAM",
  });
}
async function getProgramByID(req, res) {
  const { program_code } = req.query;
  const result = await programService.getProgramByID(program_code);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single program!",
      success: false,
      tableName: "PROGRAM",
    });
  }
  return res.status(200).json({
    message: "Get single factory successfully!",
    success: true,
    data: result,
    tableName: "PROGRAM",
  });
}
async function addProgram(req, res) {
  const { data } = req.body;
  const { error, value } = createProgramSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await programService.addProgram(value, t);
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
async function editProgram(req, res) {
  const t = await sequelize.transaction();
  try {
    const { program_code } = req.query;
    const { data } = req.body;
    const { error, value } = createProgramSchema.validate(data);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await programService.editProgram(program_code, value, t);
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
async function deleteProgram(req, res) {
  try {
    const { program_code } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await programService.deleteProgram(program_code, t);
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
async function searchProgram(req, res) {
  const keyword = req.body;
  console.log(keyword);
  try {
    const shoes = await programService.searchProgram(keyword);
    return res.json({
      message: "search program successfully!",
      success: true,
      data: shoes,
      tableName: "PROGRAM",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFPrograms(req, res) {
  try {
    const filename = "programs.pdf";
    const pdf = await programService.exportPDFPrograms(filename);
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
  getAllProgram,
  getProgramByID,
  addProgram,
  editProgram,
  deleteProgram,
  searchProgram,
  exportPDFPrograms,
};
