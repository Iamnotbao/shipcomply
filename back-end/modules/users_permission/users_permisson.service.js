const userPermissionRepo = require("./users_permision.repository");
const factoryService = require("../factories/factory.service");
const factoryDepartmentService = require("../factory_departments/factory_departments.service");
const userRepo = require("../users/user.repository");
const pool = require("../../config/db");
const { generatePDF } = require("../../utils/pdf");
async function getAllUsersPermission() {
  const result = await userPermissionRepo.getAll();
  return result;
}
async function getUserPermisisonByID(
  factory_code,
  user_code,
  department_code,
  program_code
) {
  try {
    console.log("fac", factory_code);
    console.log("dept", department_code);
    console.log("user", user_code);
    console.log("prog", program_code);

    const result = await userPermissionRepo.getByID(
      factory_code,
      user_code,
      department_code,
      program_code
    );
    return result;
  } catch (error) {
    console.log("Cannot get the user permission from service", error);
  }
}

async function getUserPermisison(
  factory_code,
  department_code,
  user_code,
  program_code
) {
  try {
    const result = await userPermissionRepo.getPermission(
      factory_code,
      department_code,
      user_code,
      program_code
    );
    return result;
  } catch (error) {
    console.log("Cannot get the user permission from service", error);
  }
}
async function getPerByUser(user_code) {
  try {
    const result = await userPermissionRepo.getByUser(user_code);
    return result;
  } catch (error) {
    console.log("Cannot get the user permission from service", error);
  }
}
async function getPermisisonByFacAndUser(
  factory_code,
  department_code,
  user_code
) {
  try {
    const result = await userPermissionRepo.getByFacAndUser(
      factory_code,
      department_code,
      user_code
    );
    return result;
  } catch (error) {
    console.log("Cannot get the user permission from service", error);
  }
}
async function createUsersPermission(data, t) {
  try {
    const existFactory = await factoryService.getFactoryByID(data.factory_code);
    // const existUser = await userRepo.getByID(
    //   data.user_code
    // );
    // console.log("ex user", existUser);
    if (!existFactory) {
      console.log("The factory is not exist");
      return null;
    }
    const existUserPermission = await getUserPermisisonByID(
      data.factory_code,
      data.user_code,
      data.department_code,
      data.program_code
    );
    if (existUserPermission) {
      const message = "the program_code cannot be the same!";
      return { message };
    }
    const result = await userPermissionRepo.add(data, t);
    if (!result) {
      console.log("User permission cannot add from service");
    }
    return result;
  } catch (error) {
    console.log("Error create from service: ", error);
    throw error;
  }
}
async function searchPermission(keyword) {
  try {
    const userfound = await userPermissionRepo.search(keyword);
    return userfound;
  } catch (error) {
    console.log(error);
  }
}
async function copyPermission(old_user, new_user, grt_user) {
  const t = await pool.transaction();
  try {
    await userPermissionRepo.copy(old_user, new_user, grt_user, t);
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
async function editUsersPermission(data, t) {
  console.log("check perrrrrr", data);

  try {
    const existUserPermission = await getUserPermisisonByID(
      data.factory_code,
      data.user_code,
      data.department_code,
      data.program_code
    );
    if (!existUserPermission) {
      console.log("user permission is not exist !");
      return null;
    }
    const result = await userPermissionRepo.edit(existUserPermission, data, t);
    if (!result) {
      console.log("Cannot edit user permission from service");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Can not edit from service", error);
  }
}
async function deleteUsersPermission(
  factory_code,
  user_code,
  department_code,
  program_code,
  t
) {
  try {
    const existUserPermission = await getUserPermisisonByID(
      factory_code,
      user_code,
      department_code,
      program_code
    );
    if (!existUserPermission) {
      console.log("user permission is not exist !");
      return null;
    }
    const result = await userPermissionRepo.deletePermisison(
      existUserPermission,
      t
    );
    if (!result) {
      console.log("Cannot delete user permission from service");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Can not delete from service", error);
  }
}
async function exportPDFPermission(filename) {
  try {
    const data = await userPermissionRepo.getAll();
    const plainPermisison = data.map((f) => f.get({ plain: true }));
    await generatePDF(plainPermisison, filename, "USER_PERMISSION");
    return filename;
  } catch (error) {
    console.log("Error", error);
  }
}
module.exports = {
  getAllUsersPermission,
  getUserPermisisonByID,
  getUserPermisison,
  exportPDFPermission,
  getPerByUser,
  getPermisisonByFacAndUser,
  createUsersPermission,
  editUsersPermission,
  deleteUsersPermission,
  searchPermission,
  exportPDFPermission,
  copyPermission
};
