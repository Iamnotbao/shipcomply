const express = require('express');
const { listUsers, deleteUser, getUserByID, addUser, editUser, getUserByDepartment, searchUser, importUserEx, exportUserExcel, deleteAllUser, exportPDFUser, getUserByFactory } = require('./user.controller');
const upload = require('../../utils/multer');
const user_router = express.Router();

user_router.get('/all',listUsers);
user_router.get('/',getUserByID),
user_router.get('/factory',getUserByFactory),
user_router.get('/dept',getUserByDepartment),
user_router.post('/',addUser),
user_router.put('/edit',editUser),
user_router.delete('/',deleteUser);
user_router.delete("/delete-all",deleteAllUser);
user_router.post("/search",searchUser);
user_router.post("/import", upload.single("file"),importUserEx);
user_router.get("/excel",exportUserExcel);
user_router.get("/pdf",exportPDFUser);
module.exports=user_router;