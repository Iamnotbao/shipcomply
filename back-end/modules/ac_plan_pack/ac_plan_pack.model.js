const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_PLAN_PACK = sequelize.define(
  "AC_PLAN_PACK",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    ac_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    pack_gu: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    ship_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    pk_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    sizerun: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ctns_pairs: {
      type: DataTypes.DECIMAL(14, 8),
      allowNull: true,
    },
    ctns: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    pairs: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment:
        "1-New新單, 2-Check復核, 7-Confirm確認, 0-Cancel取消, 9-Close關閉",
    },
    grt_dept: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    grt_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    grt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    last_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    last_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "ac_plan_pack",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_PLAN_PACK;
