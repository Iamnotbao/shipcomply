const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PROGRAM_FIELD_TITLE = sequelize.define(
  "PROGRAM_FIELD_TITLE",
  {
    program_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    field_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    title_name_t: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    title_name_e: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    title_name_l: {
      type: DataTypes.STRING(600),
      allowNull: true,
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
      type: DataTypes.STRING(600),
      allowNull: true,
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
    tableName: "program_field_title",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = PROGRAM_FIELD_TITLE;
