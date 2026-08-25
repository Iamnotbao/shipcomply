const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_SHOE_REF = sequelize.define(
  "AC_SHOE_REF",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    customs_shoe_id: {
      type: DataTypes.STRING(120),
      primaryKey: true,
      allowNull: false,
    },
    prod_no: {
      type: DataTypes.STRING(120),
      primaryKey: true,
      allowNull: false,
    },
    prod_unit: {
      type: DataTypes.STRING(30),
    },
    is_valid: {
      type: DataTypes.STRING(1),
    },
    valid_date: {
      type: DataTypes.DATE,
    },
    unval_date: {
      type: DataTypes.DATE,
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
    tableName: "ac_shoe_ref",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_SHOE_REF;
