const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_PLAN_SIZE = sequelize.define(
  "SE_PLAN_SIZE",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
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
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    ctns: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    plan_ctns: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    unqc_ctns: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    un_desc: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unqc_pairs: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-New新單, 2-Check復核, 7-Confirm確認, 0-Cancel取消, 9-Close關閉",
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
    tableName: "se_plan_size",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_PLAN_SIZE;