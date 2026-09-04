const userService = require("./user.service");
const sequelize = require("../../config/db");
const createUserSchema = require("./user.create.dto");
const editUserSchema = require("./user.edit.dto");
const { generateExcel } = require("../../utils/excel");
const fs = require("fs");

async function listUsers(req, res) {
  try {
    const user = await userService.getAllUsers();
    return res.json({
      message: "Fetch users successfully!!",
      success: true,
      data: user,
      tableName: "USER",
    });
  } catch (error) {
    console.log("Get all user error: ", error);
  }
}
async function getUserByID(req, res) {
  try {
    const { factory_code, department_code, user_code } = req.query;
    let user = await userService.getUserByID(
      factory_code,
      department_code,
      user_code,
    );
    user = user.toJSON();
    const supervisor = await userService.getUserByID(
      user.factory_code,
      user.department_code,
      user.supervisor_id,
    );
    const { supervisor_name } = supervisor;
    user = { ...user, supervisor_name };

    return res.json({
      message: "Get single user successfully!",
      success: true,
      data: user,
      tableName: "USER",
    });
  } catch (error) {
    console.log("Get user by id have been error: ", error);
  }
}
async function getUserByDepartment(req, res) {
  try {
    const { factory_code, department_code } = req.query;
    const response = await userService.getUserByDepartment(
      factory_code,
      department_code,
    );
    if (!response) {
      return res.status(400).json({
        message: "Cannot receive the user by department",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Get the users by department",
      success: true,
      data: response,
      tableName: "USER",
    });
  } catch (error) {}
}
async function getUserByFactory(req, res) {
  try {
    const { factory_code, limit, page, search, isStatus } = req.query;
    const result = await userService.getUserByFactory(
      factory_code,
      limit,
      page,
      search,
      isStatus,
    );
    console.log("check lai di ",result);
    
    if (!result) {
      return res.status(400).json({
        message: "Cannot receive the user by factory",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Get the users by factory",
      success: true,
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      tableName: "USER",
    });
  } catch (error) {}
}
async function addUser(req, res) {
  const t = await sequelize.transaction();
  try {
    const { data } = req.body;
    const { error, value } = createUserSchema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const result = await userService.addUser(value, t);
    await t.commit();
    return res.status(201).json({
      success: true,
      message: "User added successfully!",
      data: result,
    });
  } catch (error) {
    await t.rollback();
    console.error("Cannot add user from controller:", error);
    if (error.parent) console.error("Original PG error:", error.parent);
    if (error.original) console.error("Original error:", error.original);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error while adding user",
    });
  }
}
async function editUser(req, res) {
  try {
    const { factory_code, department_code, user_code } = req.query;
    const { data } = req.body;
    const t = await sequelize.transaction();
    const { error, value } = createUserSchema.validate(data);
    if (error) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await userService.editUser(
      factory_code,
      department_code,
      user_code,
      value,
      t,
    );
    const { message } = response;
    if (message) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Edit user is not successfully!",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit is successfully!",
      data: response,
    });
  } catch (error) {
    await t.rollback();
    console.log("Cannot edit user from controller!", error);
  }
}
async function deleteUser(req, res) {
  try {
    const t = await sequelize.transaction();
    const { user_code } = req.query;
    const user = await userService.deleteUser(user_code, t);
    if (!user) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "User cannot be delete!",
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete user successfully!!",
      success: true,
      tableName: "USER",
    });
  } catch (error) {
    console.log("Call i have been error: ", error);
  }
}
async function deleteAllUser(req, res) {
  const users = req.body;
  console.log("pass to Db", users);
  const t = await sequelize.transaction();
  try {
    await userService.deleteAllUser(users);
    await t.commit();
    return res.json({
      message: "delete all successfully!",
      success: true,
    });
  } catch (error) {
    t.rollback();
    console.log(error);
  }
}
async function searchUser(req, res) {
  const keyword = req.body;
  console.log(keyword);
  try {
    const shoes = await userService.searchUser(keyword);
    return res.json({
      message: "search user successfully!",
      success: true,
      data: shoes,
      tableName: "USER",
    });
  } catch (error) {
    console.log(error);
  }
}
async function importUserEx(req, res) {
  try {
    console.log("File uploaded:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "Don't have file upload!",
      });
    }
    const result = await userService.importUserEx(req.file.path);
    if (result) {
      return res.status(200).json({
        message: "Import successfully!",
        importRows: result,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import thất bại" });
  }
}
async function exportUserExcel(req, res) {
  try {
    const excelUser = await userService.exportUserExcel();
    const workbook = await generateExcel(excelUser, "USER");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", "attachment; filename=user.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Export failed" });
  }
}
async function exportPDFUser(req, res) {
  try {
    const filename = "user.pdf";
    const pdf = await userService.exportPDFDepartment(filename);
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
module.exports = {
  listUsers,
  getUserByID,
  deleteUser,
  deleteAllUser,
  addUser,
  editUser,
  getUserByDepartment,
  getUserByFactory,
  searchUser,
  importUserEx,
  exportUserExcel,
  exportPDFUser,
};
