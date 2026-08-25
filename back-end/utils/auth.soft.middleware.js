const { verifyToken } = require("./jwt");

function softAuthMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(">>> authHeader:", authHeader);        // ← thêm
  
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  console.log(">>> decoded:", decoded);              // ← thêm

  if (decoded) req.user = decoded;
  next();
}

module.exports = softAuthMiddleware;