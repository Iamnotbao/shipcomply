const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_SEND_BASE = sequelize.define(
  "AC_SEND_BASE",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    ac_send: {
      type: DataTypes.STRING(200),
      primaryKey: true,
    },
    ac_type: {
      type: DataTypes.STRING(30),
    },
    stoc_type: {
      type: DataTypes.STRING(30),
    },
    sales_type: {
      type: DataTypes.STRING(30),
    },
    locked_information: {
      type: DataTypes.STRING(600),
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(30),
    },
    grt_date: {
      type: DataTypes.DATE,
    },
    last_user: {
      type: DataTypes.STRING(30),
    },
    last_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "ac_send_base",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_SEND_BASE;
