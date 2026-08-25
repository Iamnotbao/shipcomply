const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PAKING_LIST_M = sequelize.define(
  "PAKING_LIST_M",
  {
    org_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.STRING(20),
      allowNull: true,
      primaryKey: true,
    },
    pack_gu: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      primaryKey: true,
    },
    ship_seq: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      primaryKey: true,
    },
    invoice_no: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    transportation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cust_no: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cust_on: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    po_no: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    art_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    art_name: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    made_out: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    made_to: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fcr_date: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hs_code: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    com_name: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    com_add: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "paking_list_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = PAKING_LIST_M;