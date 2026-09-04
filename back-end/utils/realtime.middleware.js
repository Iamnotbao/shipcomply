const { publishRealtimeEvent } = require("./sseManager");

const ACTION_BY_METHOD = {
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const IGNORED_ENTITIES = new Set(["authentication", "health", "sse"]);

const getEntity = (originalUrl) =>
  originalUrl.split("?")[0].split("/").filter(Boolean)[1] || "unknown";

const realtimeMutationMiddleware = (req, res, next) => {
  const action = ACTION_BY_METHOD[req.method];
  const entity = getEntity(req.originalUrl);

  if (!action || IGNORED_ENTITIES.has(entity)) {
    return next();
  }

  res.once("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;

    publishRealtimeEvent({
      type: "entity.changed",
      entity,
      site: process.env.SITE_KEY || "UNKNOWN",
      factory: req.user?.factory_code || null,
      action,
      updatedAt: new Date().toISOString(),
    });
  });

  return next();
};

module.exports = realtimeMutationMiddleware;
