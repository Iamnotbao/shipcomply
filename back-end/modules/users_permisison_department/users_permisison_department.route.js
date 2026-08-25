const express = require("express");
const {
  exportPDFUserPD,
  getUserPDByID,
  addUserPD,
  editUserPD,
  deleteUserPD,
  searchUserPD,
  getAllUserPD,
  getUserPDByUser,
} = require("./users_permisison_department.controller");
const userPermissionDepartmentRouter = express.Router();

userPermissionDepartmentRouter.get("/all",getAllUserPD );
userPermissionDepartmentRouter.get("/pdf", exportPDFUserPD);
userPermissionDepartmentRouter.get("/", getUserPDByID),
userPermissionDepartmentRouter.get("/user", getUserPDByUser),
  userPermissionDepartmentRouter.post("/", addUserPD),
  userPermissionDepartmentRouter.put("/edit", editUserPD),
  userPermissionDepartmentRouter.delete("/", deleteUserPD),
  userPermissionDepartmentRouter.post("/search", searchUserPD);

module.exports = userPermissionDepartmentRouter;
