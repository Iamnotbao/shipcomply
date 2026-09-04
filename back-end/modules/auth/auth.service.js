const { getRole } = require("../../utils/getRole");
const { hashPassword, comparePassword } = require("../../utils/hash");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/jwt");
const USER = require("../users/user.model");
const factoryService = require("../factories/factory.service");
const factoryDepartmentService = require("../factory_departments/factory_departments.service");
const userPermissionService = require("../users_permission/users_permisson.service");
const userService = require("../users/user.service");
const userPermissionDepartmentService = require("../users_permisison_department/users_permisison_department.service");

async function loginAsUser(user, t) {
  let message = "";
  const factoryFound = await factoryService.getFactoryByID(user.factory_code);
  if (!factoryFound) {
    return { message: "FACTORY_NOT_FOUND" };
  }
  const p_charset = {
    en: "factory_name_e",
    vi: "factory_name_l",
    zh: "factory_name_t",
  };
  const userFound = await USER.findOne({
    where: {
      user_code: user.user_code,
    },
  });
  if (!userFound) {
    return { message: "USER_NOT_FOUND" };
  }
  const isMatch = user.user_password === userFound.user_password ? true : false;
  if (!isMatch) {
    if (!isMatch) {
      return { message: "WRONG_PASSWORD" };
    }
  }
  const userR = { ...userFound.toJSON(), program_code: "002" };
  const permission = await userPermissionService.getPermisisonByFacAndUser(
    user.factory_code,
    user.department_code,
    user.user_code,
  );
  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);
  const factory_name = factoryFound[p_charset[user.language]];
  const factory_abbreviation = factoryFound.factory_abbreviation;
  // const department_name_l = departmentFound.department_name_l;
  return {
    access_token,
    refresh_token,
    userR,
    factory_name,
    factory_abbreviation,
    permission,
    message,
    // department_name_l,
    // permission,
  };
}
async function loginAsAdmin(user, t) {
  let message = "";
  if (user.user_code !== "admin") {
    message = "user is not admin !";
    return { message };
  }
  const userFound = await USER.findOne({
    where: {
      user_code: "admin",
    },
  });
  if (!userFound) {
    message = "user is not found !";
    return { message };
  }
  const isMatch = user.user_password === userFound.user_password ? true : false;
  if (!isMatch) {
    message = "password is wrong!";
    return { message };
  }
  const userR = { ...userFound.toJSON() };
  const permission = await userPermissionService.getPermisisonByFacAndUser(
    user.factory_code,
    user.department_code,
    user.user_code,
  );
  console.log("take it", permission);
  // const access_token = generateAccessToken(user);
  // const refresh_token = generateRefreshToken(user);
  // const department_name_l = departmentFound.department_name_l;
  return {
    // access_token,
    // refresh_token,
    userR,
    message,
  };
}
async function registerAsUser(user) {
  console.log("here register", user);
  const isUser = await userService.getUserByID(
    user.user_name_e,
    user.factory_code,
  );
  if (isUser) {
    console.log("user is exist cannot add !");
    return null;
  }
  const hashPass = await hashPassword(user.user_password);
  const register = await USER.create({
    user_name_e: user.user_name_e,
    user_name_l: user.user_name_e,
    user_name_t: user.user_name_e,
    factory_code: user.factory_code,
    department_code: "2010_IT",
    user_code: "SPGS03",
    user_password: hashPass,
    supervisor_id: "SPGS02",
    allow_authoriztion: 1,
  });
  return register;
}

module.exports = { loginAsUser, loginAsAdmin, registerAsUser };
