const userPDService = require("./users_permisison_department.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const createUserDPSchema = require("./users_permission_department.create.dto");

async function getAllUserPD(req, res) {
  const result = await userPDService.getAllUserPD();
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "USER_PERMISSION_DEPARTMENT",
  });
}
async function getUserPDByID(req, res) {
  const { factory_code, department_code, user_code } = req.query;
  const result = await userPDService.getUserPDByID(
    factory_code,
    department_code,
    user_code
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single user permission departments!",
      success: false,
      tableName: "USER_PERMISSION_DEPARTMENT",
    });
  }
  return res.status(200).json({
    message: "Get single factory successfully!",
    success: true,
    data: result,
    tableName: "USER_PERMISSION_DEPARTMENT",
  });
}
async function getUserPDByUser(req, res) {
  const { user_code } = req.query;
  const result = await userPDService.getUserPDByUser(user_code);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single user permission departments!",
      success: false,
      tableName: "USER_PERMISSION_DEPARTMENT",
    });
  }
  return res.status(200).json({
    message: "Get user permission departments by single user successfully!",
    success: true,
    data: result,
    tableName: "USER_PERMISSION_DEPARTMENT",
  });
}
async function addUserPD(req, res) {
  const { data } = req.body;
  const { error, value } = createUserDPSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await userPDService.addUserPD(value, t);
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
      message: "Add user permission departments successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Cannot add user permission departments because", error);
    await t.rollback();
  }
}
async function editUserPD(req, res) {
  const t = await sequelize.transaction();
  try {
    const { data } = req.body;
    const { error, value } = createUserDPSchema.validate(data);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await userPDService.editUserPD(value, t);
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit user permission departments",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit user permission departments successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Can not edit from controller!",error);
    await t.rollback();
  }
}
async function deleteUserPD(req, res) {
  try {
    const { factory_code,department_code,user_code } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await userPDService.deleteUserPD(factory_code,department_code,user_code, t);
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
      message: "Delete user permission departments successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchUserPD(req, res) {
  const keyword = req.body;
  console.log(keyword);
  try {
    const shoes = await userPDService.searchUserPD(keyword);
    return res.json({
      message: "search user permission departments successfully!",
      success: true,
      data: shoes,
      tableName: "USER_PERMISSION_DEPARTMENT",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFUserPD(req, res) {
  try {
    const filename = "upd.pdf";
    const pdf = await userPDService.exportPDFUserPD(filename);
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
  getAllUserPD,
  getUserPDByID,
  getUserPDByUser,
  addUserPD,
  editUserPD,
  deleteUserPD,
  searchUserPD,
  exportPDFUserPD,
};
