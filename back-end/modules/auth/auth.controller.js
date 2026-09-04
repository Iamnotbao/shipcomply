const sequelize = require("../../config/db");
const UAParser = require("ua-parser-js");
const { getClientFullInfo } = require("../../utils/getUserInfo");
const { verifyRefreshToken } = require("../../utils/jwt");
const authService = require("./auth.service");

async function loginAsUser(req, res) {
  const directIp = req.ip || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const clientInfo = getClientFullInfo(directIp, result);
  const userData = req.body;
  if (userData === null) {
    return res.json({
      message: "Params are all null!",
      success: false,
      statusCode: 401,
    });
  }

  const t = await sequelize.transaction();
  try {
    const {
      userR,
      factory_name,
      factory_abbreviation,
      permission,
      message,
      access_token,
      refresh_token,
    } = await authService.loginAsUser(userData, t);
    await t.commit();
    if (message) {
      return res.status(403).json({
        message: message,
        success: false,
      });
    }
    return res.json({
      message: "Login successfully!",
      success: true,
      statusCode: 200,
      user: {
        user_code: userR.user_code,
        factory_code: userR.factory_code,
        factory_name: factory_name,
        factory_abbreviation: factory_abbreviation,
        department_code: userR.department_code,
        department: userData.department_code,
        factory: userData.factory_code,
        role: userR.role,
        permission: permission,
        clientInfo: `${userR?.user_code}-${userData?.factory_code}-${userData?.department_code}-${clientInfo?.ip}`,
      },
      access_token: access_token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    console.log("Passing wrong type of input: ", error);
  }
}
async function loginAsAdmin(req, res) {
  const userData = req.body;
  if (userData === null) {
    return res.json({
      message: "Params are all null!",
      success: false,
      statusCode: 401,
    });
  }
  const t = await sequelize.transaction();
  try {
    const { userR, message, access_token, refresh_token } =
      await authService.loginAsAdmin(userData, t);
    await t.commit();
    if (message) {
      return res.status(403).json({
        message: message,
        success: false,
      });
    }
    return res.json({
      message: "Login admin successfully!",
      success: true,
      statusCode: 200,
      access_token,
      refresh_token,
      user: {
        user_code: userR.user_code,
        factory_code: userR.factory_code,
        department_code: userR.department_code,
        department: userR.department_code,
        factory: userR.factory_code,
        role: userR.role,
      },
    });
  } catch (error) {
    console.log("Passing wrong type of input: ", error);
  }
}
async function registerAsUser(req, res) {
  const userData = req.body;
  if (userData === null) {
    return res.json({
      message: "Params are all null!",
      success: false,
      statusCode: 401,
    });
  }
  try {
    const user = await authService.registerAsUser(userData);
    return res.json({
      message: "Register successfully!",
      success: true,
      statusCode: 200,
      username: user.user_name_e,
      role: user.role,
    });
  } catch (error) {
    console.log("Passing wrong type of input: ", error);
  }
}

async function refreshToken(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(403);
  }
  const access_token = verifyRefreshToken(token);
  if (!access_token) {
    return res.status(403).json({
      access_token: null,
      success: false,
      message: "Invalid refresh token",
    });
  }
  return res.status(200).json({
    access_token,
    success: true,
    message: "New access_token is ok!",
  });
}
module.exports = { loginAsUser, loginAsAdmin, registerAsUser, refreshToken };
