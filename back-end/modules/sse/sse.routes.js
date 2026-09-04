// modules/sse/sse.routes.js
const express = require("express");
const { v4: uuid } = require("uuid");
const { addClient, removeClient } = require("../../utils/sseManager");

const router = express.Router();

const ALLOWED_ORIGINS = [
  "http://10.12.3.4",
  "http://10.12.3.4:8081",
  "http://10.1.0.60:8080",
  "http://10.1.0.60",
  "http://10.1.1.134:8080",
  "http://localhost:5173",
  "http://localhost:5174",
];

router.get("/events", (req, res) => {
  // Thêm CORS header thủ công trước flushHeaders
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const clientId = uuid();
  addClient(clientId, res);

  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    removeClient(clientId);
  });
});

module.exports = router;