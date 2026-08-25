const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const FACTORY = require("../factories/factory.model");

const DEPARTMENTS = sequelize.define(
  "DEPARTMENTS",
  {
    factory_code: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING(20),
    },
    department_code: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING(20),
    },
    department_name_t: {
      type: DataTypes.STRING(600),
    },
    department_name_e: {
      type: DataTypes.STRING(600),
    },
    department_name_l: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(600),
    },
    grt_user: {
      type: DataTypes.STRING(600),
    },
    grt_date: {
      type: DataTypes.DATE,
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "factory_departments",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = DEPARTMENTS;
