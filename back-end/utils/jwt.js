const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.user_code,
      factory_code: user.factory_code,
      department_code: user.department_code
    },
    SECRET_KEY,
    { expiresIn: "3h" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.user_code,
      factory_code: user.factory_code,
      department_code: user.department_code
    },
    REFRESH_SECRET_KEY,
    { expiresIn: "7d" }
  );
};
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET_KEY);
    const accessToken = generateAccessToken({
      id: decoded.user_code,
      factory_code: decoded.factory_code,
      department_code: decoded.department_code,
    });
    return accessToken;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
