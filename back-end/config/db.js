const { Sequelize } = require("sequelize");

const readPoolInteger = (name, fallback, minimum = 0) => {
  const parsed = Number.parseInt(process.env[name], 10);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
};

const poolMax = readPoolInteger("DB_POOL_MAX", 10, 1);
const poolMin = Math.min(readPoolInteger("DB_POOL_MIN", 0), poolMax);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    dialectOptions: {
      options: "-c search_path=Customs,public",
    },
    pool: {
      max: poolMax,
      min: poolMin,
      acquire: readPoolInteger("DB_POOL_ACQUIRE", 30000, 1),
      idle: readPoolInteger("DB_POOL_IDLE", 10000, 1),
      evict: readPoolInteger("DB_POOL_EVICT", 10000, 1),
    },
    port: process.env.DB_PORT,
  },
);

module.exports = sequelize;
