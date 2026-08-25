const express = require("express");
const { loginAsUser, registerAsUser, refreshToken, loginAsAdmin } = require("./auth.controller");

const authRouter = express.Router();

authRouter.post("/refresh",refreshToken);
authRouter.post("/login",loginAsUser);
authRouter.post("/admin-login",loginAsAdmin);
authRouter.post("/register",registerAsUser);

module.exports=authRouter;