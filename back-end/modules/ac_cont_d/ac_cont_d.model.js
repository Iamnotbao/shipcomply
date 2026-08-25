const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_CONT_D = sequelize.define(
  "AC_CONT_D",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    cont_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    goods_code: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cont_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    cont_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    cont_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    used_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    stock_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    shoe_id: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    grt_user: {
      type: DataTypes.STRING(20),
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
    tableName: "ac_cont_d",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_CONT_D;
