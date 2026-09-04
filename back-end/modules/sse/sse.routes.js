const express = require("express");
const { randomUUID } = require("crypto");
const { addClient, removeClient } = require("../../utils/sseManager");

const router = express.Router();

router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const clientId = randomUUID();
  addClient(clientId, res);
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      site: process.env.SITE_KEY || "UNKNOWN",
      updatedAt: new Date().toISOString(),
    })}\n\n`,
  );

  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  const cleanup = () => {
    clearInterval(keepAlive);
    removeClient(clientId);
  };

  req.once("close", cleanup);
  res.once("error", cleanup);
});

module.exports = router;
