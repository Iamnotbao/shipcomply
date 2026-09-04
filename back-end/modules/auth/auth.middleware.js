const {verifyToken} = require("../../utils/jwt");

const authMiddleware =(req,res,next)=>{
    const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
    if(!token) return res.status(401).json({msg:"No token provided"});
    const decode = verifyToken(token);
    if(!decode) return res.status(403).json({msg:"Invalid token"})
    req.user = decode;
    next();
}
module.exports=authMiddleware
