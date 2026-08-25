const e = require("cors");
const sequelize = require("../../config/db");
const createUsersPermissionSchema = require("./users_permission.create.dto");
const usersPermissionService = require("./users_permisson.service");
const fs = require("fs");
async function getAllUsersPermission(req, res) {
  try {
    const response = await usersPermissionService.getAllUsersPermission();
    if (response) {
      return res.status(200).json({
        success: true,
        message: "Get all users_permisson",
        data: response,
        tableName: "USER_PERMISSION",
      });
    }
  } catch (error) {
    console.log("Cannot get the list of users_permission", error);
  }
}
async function getUserPermisisonByID(req, res) {
  try {
    const { factory_code, user_code, department_code, program_code } =
      req.query;
    const response = await usersPermissionService.getUserPermisisonByID(
      factory_code,
      user_code,
      department_code,
      program_code
    );
    if (!response) {
      return res.status(401).json({
        message: "Cannot get the single user_permission",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get single user_permission successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Error from controller with get user permission", error);
  }
}
async function getUserPermisison(req, res) {
  try {
    const { factory_code, department_code, user_code, program_code } =
      req.query;
    const response = await usersPermissionService.getUserPermisison(
      factory_code,
      department_code,
      user_code,
      program_code
    );
    if (!response) {
      return res.status(401).json({
        message: "Cannot get the single user_permission",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get single user_permission successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Error from controller with get user permission", error);
  }
}
async function getPermisisonByUser(req, res) {
  try {
    const { user_code } = req.query;
    console.log("boom", user_code);

    const response = await usersPermissionService.getPerByUser(user_code);
    const { message } = response;
    if (message) {
      return res.status(401).json({
        success: false,
        message: message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get user permisison by user successfully!",
      data: response,
      tableName: "USER_PERMISSION",
    });
  } catch (error) {
    console.log("Cannot get User Permission:", error);
  }
}

async function copyPermission(req, res) {
  try {
    const { data } = req.body;
    const response = await usersPermissionService.copyPermission(data.old_user, data.new_user, data.grt_user);
    if (response) {
      return res.status(401).json({
        success: false,
        message: "Cannot copy user permisison",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Copy user permisison successfully!",
      tableName: "USER_PERMISSION",
    });
  } catch (error) {
    console.log("Cannot get User Permission:", error);
  }
}
async function getPermisisonByFacAndUser(req, res) {
  try {
    const { factory_code, department_code, user_code } = req.query;

    const response = await usersPermissionService.getPermisisonByFacAndUser(
      factory_code,
      department_code,
      user_code
    );
    const { message } = response;
    if (message) {
      return res.status(401).json({
        success: false,
        message: message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get user permisison by user successfully!",
      data: response,
      tableName: "USER_PERMISSION",
    });
  } catch (error) {
    console.log("Cannot get User Permission:", error);
  }
}
async function exportPDFPermisison(req, res) {
  try {
    const filename = "user_permission.pdf";
    const pdf = await usersPermissionService.exportPDFPermission(filename);
    res.download(pdf, (err) => {
      if (err) {
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Export PDF user failed",
    });
  }
}
async function createUsersPermission(req, res) {
  const t = await sequelize.transaction();
  try {
    const { data } = req.body;
    const { error, value } = createUsersPermissionSchema.validate(data);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await usersPermissionService.createUsersPermission(
      value,
      t
    );
    if (response.message) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: response.message || "Cannot add users_permisison",
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Add user_permisison successfully!",
      success: true,
      data: response,
    });
  } catch (error) {
    console.log("Add is error from controller", error);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: error?.message || "Cannot add users_permisison",
    });
  }
}
async function editUsersPermission(req, res) {
  try {
    const t = await sequelize.transaction();
    const { data } = req.body;
    const { error, value } = createUsersPermissionSchema.validate(data);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: true,
        message: error.details[0].message,
      });
    }
    const response = await usersPermissionService.editUsersPermission(value, t);
    if (!response) {
      return res.status(401).json({
        success: false,
        message: "Cannot edit because null !",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit users_permission successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Cannot edit user permission from controller", error);
  }
}
async function searchPermission(req, res) {
  const keyword = req.body;
  console.log(keyword);
  try {
    const shoes = await usersPermissionService.searchPermission(keyword);
    return res.json({
      message: "search user permissison successfully!",
      success: true,
      data: shoes,
      tableName: "USER_PERMISSION",
    });
  } catch (error) {
    console.log(error);
  }
}
async function deleteUsersPermission(req, res) {
  try {
    const { factory_code, user_code, department_code, program_code } =
      req.query;
    const t = await sequelize.transaction();
    const deletePer = await usersPermissionService.deleteUsersPermission(
      factory_code,
      user_code,
      department_code,
      program_code,
      t
    );
    if (!deletePer) {
      await t.rollback();
      return res.status(401).json({
        message: "Cannot delete user permision from controller because of null",
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete Sucessfully!",
      success: true,
      data: deletePer,
    });
  } catch (error) {
    console.log("Cannot delete user permisison from controller", error);
  }
}
module.exports = {
  getAllUsersPermission,
  getUserPermisisonByID,
  getPermisisonByUser,
  getUserPermisison,
  getPermisisonByFacAndUser,
  exportPDFPermisison,
  createUsersPermission,
  editUsersPermission,
  searchPermission,
  deleteUsersPermission,
  copyPermission
};
