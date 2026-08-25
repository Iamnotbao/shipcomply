const { verifyToken } = require("./jwt");

function applyQueryPermission(req, res, next) {
    const permission = JSON.parse(req.query.permission);
  
  // Check the permission not null and allow_query
  if (!permission || permission.allow_query !== "Y") {
    return res.status(403).json({
      message: "You are not allowed to query data",
    });
  }
  // Create a query map to use for receive from request
  const queryMap = {
    "1-factory": { factory_code: permission.factory_code },
    "2-department": { department_code: permission.department_code },
    "3-user": { grt_user: permission.user_code },
  };
  // add a req.permissionFilter for query_level
  req.permissionFilter = queryMap[permission.query_level] || {};
  next();
}

function applyModifyPermission(req, res, next) {
  const { permission } = req.body.user;
  // Check the permission not null and allow_modify
  if (!permission || permission.allow_modify !== "Y") {
    return res.status(403).json({
      message: "You are not allowed to modify the data",
    });
  }
  // Create a query map to use for receive from request
  const modifyMap = {
    "3-user": (record) => record.grt_user.toString() === permission.user_code,
    "2-department": (record) =>
      record.department_code.toString() === permission.department_code,
    "1-factory": (record) =>
      record.factory_code.toString() === permission.factory_code,
  };
  // add a req.checkModify for modify_level
  req.checkModify = modifyMap[permission.modify_level] || (() => false);
  next();
}

module.exports = { applyQueryPermission, applyModifyPermission };
