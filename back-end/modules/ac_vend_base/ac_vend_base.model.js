const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_VEND_BASE = sequelize.define(
  "AC_VEND_BASE",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    vend_no: {
      type: DataTypes.STRING(200),
      primaryKey: true,
    },
    ac_send: {
      type: DataTypes.STRING(200),
      primaryKey: true,
    },
    is_default: {
      type: DataTypes.STRING(1),
    },
    req_qc: {
      type: DataTypes.STRING(1),
    },
    locked_information: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER(1),
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
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "ac_vend_base",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_VEND_BASE;
