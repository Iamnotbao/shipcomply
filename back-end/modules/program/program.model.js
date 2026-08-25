const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PROGRAM = sequelize.define(
  "PROGRAM",
  {
    program_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    program_name_t: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    program_name_e: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    program_name_l: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(20),
      allowNull:true
    },
    grt_user: {
      type: DataTypes.STRING(20),
      allowNull:true
    },
    grt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull:true
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "programs",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = PROGRAM;
