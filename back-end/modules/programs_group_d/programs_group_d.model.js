const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PROGRAMS_GROUP_D = sequelize.define(
  "PROGRAMS_GROUP_D",
  {
    group_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    program_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    // locked_information: {
    //   type: DataTypes.STRING(600),
    //   allowNull: true,
    // },
    // grt_dept: {
    //   type: DataTypes.STRING(30),
    // },
    // grt_user: {
    //   type: DataTypes.STRING(30),
    // },
    // grt_date: {
    //   type: DataTypes.DATE,
    // },
    // last_user: {
    //   type: DataTypes.STRING(30),
    // },
    // last_date: {
    //   type: DataTypes.DATE,
    // },
    // status: {
    //   type: DataTypes.INTEGER(1),
    //   defaultValue: 1,
    //   allowNull: false,
    // },
  },
  {
    tableName: "programs_group_d",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = PROGRAMS_GROUP_D;
