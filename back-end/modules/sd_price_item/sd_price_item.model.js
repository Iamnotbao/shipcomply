const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SD_PRICE_ITEM = sequelize.define(
  "SD_PRICE_ITEM",
  {
    org_id: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL(2, 0),
      allowNull: false,
      primaryKey: true,
    },
    curr_no: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    std_price: {
      type: DataTypes.DECIMAL(17, 4),
      allowNull: true,
    },
    adj_price: {
      type: DataTypes.DECIMAL(17, 4),
      allowNull: true,
    },
    se_price: {
      type: DataTypes.DECIMAL(17, 4),
      allowNull: true,
    },
    se_money: {
      type: DataTypes.DECIMAL(17, 4),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    col1: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    col2: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    col3: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    col4: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.DECIMAL(2, 0),
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    grt_user: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    last_user: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    last_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "SD_PRICE_ITEM",
    schema: "pac",
    timestamps: false,
  }
);

module.exports = SD_PRICE_ITEM;