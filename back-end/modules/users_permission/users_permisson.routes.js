const express = require("express");
const { getAllUsersPermission, getUserPermisisonByID, createUsersPermission, editUsersPermission, deleteUsersPermission, getPermisisonByUser, searchPermission, exportPDFPermisison, getPermisisonByFac, getPermisisonByFacAndUser, getUserPermisison, copyPermission } = require("./users_permisson.controller");
const { exportPDFUser } = require("../users/user.controller");

const usersPermissionRoute = express.Router();

usersPermissionRoute.get("/all",getAllUsersPermission);
usersPermissionRoute.get("/",getUserPermisisonByID);
usersPermissionRoute.get("/user",getPermisisonByUser);
usersPermissionRoute.get("/permission",getUserPermisison);
usersPermissionRoute.get("/factory",getPermisisonByFacAndUser);
usersPermissionRoute.get("/pdf",exportPDFPermisison);
usersPermissionRoute.post("/copy",copyPermission);
usersPermissionRoute.post("/search",searchPermission);
usersPermissionRoute.post("/",createUsersPermission);
usersPermissionRoute.put("/edit",editUsersPermission);
usersPermissionRoute.delete("/",deleteUsersPermission);
module.exports=usersPermissionRoute;
