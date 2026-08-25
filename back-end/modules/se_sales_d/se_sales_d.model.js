const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_SALES_D = sequelize.define(
  "SE_SALES_D",
  {
    org_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    sales_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    sales_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    se_seq: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    ship_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    prod_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    pairs: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    net_weight: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    gross_weight: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    rebate_per: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    rebate_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    tax_per: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    tax_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    invoice_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col1: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col2: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    col3: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col4: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    money_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
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
    tableName: "se_sales_d",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_SALES_D;