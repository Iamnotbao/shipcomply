const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_BOM_M = sequelize.define(
  "AC_BOM_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    prod_acno: {
      type: DataTypes.STRING(120),
      allowNull: false,
      primaryKey: true,
    },
    item_acno: {
      type: DataTypes.STRING(120),
      allowNull: false,
      primaryKey: true,
    },
    unit_qty: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    loss_per: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    fact_qty: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    ac_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
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
    tableName: "ac_bom_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_BOM_M;
