const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BASIC_DATA = sequelize.define(
  "BASIC_DATA",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    category_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    code_no: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    name_t: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    name_e: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    name_l: {
      type: DataTypes.STRING(600),
      allowNull: true,
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
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "basic_data",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = BASIC_DATA;
