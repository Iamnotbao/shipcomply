const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PROGRAMS_GROUP_M = sequelize.define(
  "PROGRAMS_GROUP_M",
  {
    group_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    group_name_t: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
    group_name_e: {
      type: DataTypes.STRING(600),
    },
    group_name_l: {
      type: DataTypes.STRING(600),
    },
    // status: {
    //   type: DataTypes.INTEGER(1),
    //   defaultValue: 1,
    //   allowNull: false,
    // },
    // grt_dept: {
    //   type: DataTypes.STRING(30),
    //   allowNull: true,
    // },
    // grt_user: {
    //   type: DataTypes.STRING(20),
    //   allowNull: true,
    // },
    // grt_date: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    //   allowNull: true,
    // },
    // last_user: {
    //   type: DataTypes.STRING(30),
    // },
    // last_date: {
    //   type: DataTypes.DATE,
    // },
    //  locked_information: {
    //   type: DataTypes.STRING(600),
    //   allowNull: true,
    // },
  },
  {
    tableName: "programs_group_m",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = PROGRAMS_GROUP_M;
