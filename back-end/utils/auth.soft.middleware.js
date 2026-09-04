const { verifyToken } = require("./jwt");

function softAuthMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (decoded) req.user = decoded;
  next();
}

module.exports = softAuthMiddleware;
