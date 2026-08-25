const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RD_SIZE_D = sequelize.define(
  "RD_SIZE_D",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    size_type: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    size_no: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    size_seq: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    size_shape: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
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
  },
  {
    tableName: "rd_size_d",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = RD_SIZE_D;
