const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_INM_M = sequelize.define(
  "AC_INM_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    inm_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    issued_date: {
      type: DataTypes.DATE,
    },
    expire_date: {
      type: DataTypes.DATE,
    },
    req_no: {
      type: DataTypes.STRING(200),
    },
    commno: {
      type: DataTypes.STRING(200),
    },
    note: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(20),
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
    tableName: "ac_inm_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_INM_M;
