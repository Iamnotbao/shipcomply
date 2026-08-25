const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_ITEM_REF = sequelize.define(
  "AC_ITEM_REF",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    item_acno: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
    item_no: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
    item_unit: {
      type: DataTypes.STRING(30),
    },
    formula: {
      type: DataTypes.INTEGER,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(30),
    },
    grt_date: {
      type: DataTypes.DATE,
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
    tableName: "ac_item_ref",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_ITEM_REF;
