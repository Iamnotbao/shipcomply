const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_PROC_D = sequelize.define(
  "AC_PROC_D",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    ac_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    ac_itemno: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    tax_rate: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    tax: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    atax_rate: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    add_tax: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    rb_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    in_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    ac_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    breadth: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    over_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    out_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    req_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ref_price: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    ac_item: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    in_crate: {
      type: DataTypes.DECIMAL(14, 4),
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
      allowNull: true,
    },
    last_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "ac_proc_d",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_PROC_D;
