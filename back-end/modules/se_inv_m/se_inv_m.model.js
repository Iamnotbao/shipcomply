// ==================== MODEL ====================
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_INV_M = sequelize.define(
  "SE_INV_M",
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
    invoice_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    invoice_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    account_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    per: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    fcr_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sailing_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    exp_port: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    dest_port: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    bank_name: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    payment: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    trade: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sort: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    nw: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    gw: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    goods_desc: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    shipment_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    submission_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hs_code: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cdc_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cdc_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    via: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
    tableName: "se_inv_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_INV_M;