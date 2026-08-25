const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_INM_D = sequelize.define(
  "AC_INM_D",
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
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    item_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    in_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    in_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    in_money: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hs_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    n_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
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
    tableName: "ac_inm_d",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_INM_D;
