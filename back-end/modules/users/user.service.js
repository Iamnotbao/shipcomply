const userRepo = require("./user.repository");
const factoryService = require("../factories/factory.service");
const departmentService = require("../factory_departments/factory_departments.service");
const userPermissionRepo = require("../users_permission/users_permision.repository");
const { hashPassword } = require("../../utils/hash");
const { importExcel } = require("../../utils/excel");
const { generatePDF } = require("../../utils/pdf");
async function getAllUsers() {
  return await userRepo.findAll();
}
async function getAdmin() {
  return await userRepo.findAdmin();
}
async function getCountOfUsers(factory_code, department_code) {
  return await userRepo.countAll(factory_code, department_code);
}
async function getUserByID(factory_code, department_code, user_code) {
  return await userRepo.getByID(factory_code, department_code, user_code);
}
async function getUniqueUser(user_code) {
  return await userRepo.getUUser(user_code);
}
async function getUserByDepartment(factory_code, department_code) {
  try {
    const existFactory = await factoryService.getFactoryByID(factory_code);
    const exsitDepartment = await departmentService.getDepartmentByID(
      factory_code,
      department_code
    );
    if (!existFactory) {
      console.log("The factory is not exist");
      return null;
    }
    if (!exsitDepartment) {
      console.log("The department is not exist");
      return null;
    }
    return await userRepo.getByDepartment(factory_code, department_code);
  } catch (error) {
    console.log("The error in user by deparment", error);
  }
}
async function getUserByFactory(factory_code, limit, page, search,isStatus) {
  try {
    const existFactory = await factoryService.getFactoryByID(factory_code);
    if (!existFactory) {
      console.log("The factory is not exist");
      return null;
    }
    return await userRepo.getByFactory(factory_code, limit, page, search,isStatus);
  } catch (error) {
    console.log("The error in user by deparment", error);
  }
}
async function addUser(user, t) {
  try {
    const foundFactory = await factoryService.getFactoryByID(user.factory_code);
    const foundDepartment = await departmentService.getDepartmentByID(
      user.factory_code,
      user.department_code
    );
    const existUser = await getUserByID(
      user.factory_code,
      user.department_code,
      user.user_code
    );

    if (!foundFactory) {
      const error = new Error("The factory does not exist!");
      error.statusCode = 400;
      throw error;
    }
    if (!foundDepartment) {
      const error = new Error("The department does not exist!");
      error.statusCode = 400;
      throw error;
    }
    if (existUser) {
      const error = new Error(
        "User already exists and user_code cannot be the same!"
      );
      error.statusCode = 409;
      throw error;
    }
    const totalRecord = await getCountOfUsers(
      user.factory_code,
      user.department_code
    );
    if (totalRecord === 0) {
      user = { ...user, supervisor_id: user.user_code };
    }
    user = {
      ...user,
      user_password: user.user_password,
      program_code: "009",
    };

    const result = await userRepo.add(user, t);
    // await userPermissionRepo.add(user, t);

    if (!result) {
      throw new Error("Failed to create user");
    }
    return result;
  } catch (error) {
    console.error("Error in service:", error);
   throw error;
  }
}
async function editUser(factory_code, department_code, user_code, value, t) {
  try {
    const existUser = await getUserByID(
      factory_code,
      department_code,
      user_code
    );
    if (!existUser) {
      const message = "User is not exist or null from service!";
      return { message };
    }
    const result = await userRepo.edit(existUser, value, t);
    if (!result) {
      console.log("User cannot edit from service");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot edit user from service in catch", error);
  }
}
async function deleteUser(user_code, t) {
  const existUser = await getUserByID(user_code);
  if (!existUser) {
    console.log("User is not exist or null from service!");
    return null;
  }
  const result = await userRepo.deleteU(existUser, t);
  if (!result) {
    console.log("Cannot delete from service because null!");
    return null;
  }
  return result;
}
async function deleteAllUser(users) {
  try {
    const deleteUserCount = await userRepo.deleteAllU(users);
    return deleteUserCount;
  } catch (error) {
    console.log(error);
  }
}
async function searchUser(keyword) {
  try {
    const userfound = await userRepo.search(keyword);
    return userfound;
  } catch (error) {
    console.log(error);
  }
}
async function importUserEx(file) {
  const rows = await importExcel(file);
  return await userRepo.importUserE(rows);
}
async function exportUserExcel() {
  return await userRepo.exportUserEx();
}
async function exportPDFDepartment(filename) {
  try {
    const data = await userRepo.findAll();
    const plainUsers = data.map((f) => f.get({ plain: true }));
    await generatePDF(plainUsers, filename, "USERS");
    return filename;
  } catch (error) {
    console.log("Error", error);
  }
}
module.exports = {
  getAllUsers,
  getUserByDepartment,
  getUniqueUser,
  deleteUser,
  deleteAllUser,
  getUserByID,
  getUserByFactory,
  addUser,
  editUser,
  searchUser,
  importUserEx,
  exportUserExcel,
  exportPDFDepartment,
};
