const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_REQ_M = sequelize.define(
  "AC_REQ_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    req_no: {
      type: DataTypes.STRING(120),
      allowNull: false,
      primaryKey: true,
    },
    vend_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    req_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    invoice_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ac_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    vend_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
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
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "ac_req_m",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_REQ_M;
