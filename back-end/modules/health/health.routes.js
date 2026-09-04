const express = require("express");
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");

const router = express.Router();

router.get("/", async (_req, res) => {
  const checkedAt = new Date().toISOString();
  const site = process.env.SITE_KEY || "UNKNOWN";

  try {
    await sequelize.query("SELECT 1", { type: QueryTypes.SELECT });
    return res.status(200).json({
      status: "ok",
      api: true,
      database: true,
      site,
      checkedAt,
    });
  } catch (_error) {
    return res.status(503).json({
      status: "unavailable",
      api: true,
      database: false,
      site,
      checkedAt,
    });
  }
});

module.exports = router;
