/**
 * monitor.js — API only (no HTML)
 * Dùng chung với React frontend riêng
 */

const { Router } = require("express");
const router = Router();

// ── CORS cho React dev server (Vite default port 5173) ──────────
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://10.12.3.4");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── In-memory store ──────────────────────────────────────────────
const stats = {
  startTime: Date.now(),
  totalRequests: 0,
  users: {},
  history: [],
  endpoints: {},
  timeline: [],
};

let _currentMinuteBucket = null;
let _currentMinuteCount = 0;

function getMinuteKey() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function pushTimeline() {
  const key = getMinuteKey();
  if (key !== _currentMinuteBucket) {
    if (_currentMinuteBucket) {
      stats.timeline.push({ minute: _currentMinuteBucket, count: _currentMinuteCount });
      if (stats.timeline.length > 60) stats.timeline.shift();
    }
    _currentMinuteBucket = key;
    _currentMinuteCount = 0;
  }
  _currentMinuteCount++;
}

// ── Middleware chính ─────────────────────────────────────────────
function monitorMiddleware(req, res, next) {
  if (req.path.startsWith("/monitor")) return next();

  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      "unknown";
    
    // ✅ NEW: Extract username từ auth token
    const username = req.user?.id || "Guest";
    
    const method = req.method;
    const path = req.route?.path || req.path;
    const key = `${method} ${path}`;
    const status = res.statusCode;
    const ts = new Date().toISOString();

    stats.totalRequests++;
    pushTimeline();

    // ✅ CHANGE: Use username instead of IP as key
    if (!stats.users[username]) {
      stats.users[username] = { 
        count: 0, 
        ip,  // ✅ Store IP as secondary info
        firstSeen: ts, 
        lastSeen: ts, 
        endpoints: {} 
      };
    }
    const u = stats.users[username];
    u.count++;
    u.lastSeen = ts;
    u.endpoints[key] = (u.endpoints[key] || 0) + 1;

    // ... rest stays same
  });
  next();
}


// ── SSE clients ──────────────────────────────────────────────────
const sseClients = new Set();

setInterval(() => {
  if (sseClients.size === 0) return;
  const payload = `data: ${JSON.stringify(buildPayload())}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}, 2000);

function buildPayload() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const users = Object.entries(stats.users).map(([username, d]) => ({
    username,  // ✅ Changed from 'ip'
    ip: d.ip,  // ✅ Added IP as secondary
    count: d.count,
    firstSeen: d.firstSeen,
    lastSeen: d.lastSeen,
    topEndpoint: Object.entries(d.endpoints).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
  }));
  const endpoints = Object.entries(stats.endpoints)
    .map(([key, d]) => ({
      key,
      count: d.count,
      avgMs: d.count ? Math.round(d.totalMs / d.count) : 0,
      errors: d.errors,
    }))
    .sort((a, b) => b.count - a.count);

  const recentTimeline = [
    ...stats.timeline,
    { minute: getMinuteKey(), count: _currentMinuteCount },
  ].slice(-20);

  return {
    uptime,
    totalRequests: stats.totalRequests,
    totalUsers: users.length,
    users: users.sort((a, b) => b.count - a.count),
    endpoints,
    history: stats.history.slice(0, 100),
    timeline: recentTimeline,
  };
}

// ── Routes ───────────────────────────────────────────────────────
router.get("/stats", (req, res) => res.json(buildPayload()));

router.get("/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  sseClients.add(res);
  res.write(`data: ${JSON.stringify(buildPayload())}\n\n`);
  req.on("close", () => sseClients.delete(res));
});

router.delete("/reset", (req, res) => {
  stats.totalRequests = 0;
  stats.users = {};
  stats.history = [];
  stats.endpoints = {};
  stats.timeline = [];
  stats.startTime = Date.now();
  res.json({ ok: true });
});

module.exports = { monitorMiddleware, monitorRouter: router };