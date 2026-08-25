const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const IV_TRANS_D_TW = sequelize.define(
  "IV_TRANS_D_TW",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    trans_no: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
    trans_seq: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
     lot_no: {
      type: DataTypes.STRING(70),
    },
    src_seq: {
      type: DataTypes.DECIMAL(14, 4),
    },
    item_no: {
      type: DataTypes.STRING(200),
    },
    trans_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    in_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    out_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    unit: {
      type: DataTypes.STRING(30),
    },
    in_piece: {
      type: DataTypes.DECIMAL(14, 4),
    },
    in_weight: {
      type: DataTypes.DECIMAL(14, 4),
    },
    currency: {
      type: DataTypes.STRING(30),
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
    },
    amount: {
      type: DataTypes.DECIMAL(14, 4),
    },
    store: {
      type: DataTypes.STRING(30),
    },
    col1: {
      type: DataTypes.STRING(200),
    },
    col2: {
      type: DataTypes.STRING(200),
    },
    col3: {
      type: DataTypes.STRING(200),
    },
    col4: {
      type: DataTypes.STRING(200),
    },
    is_size: {
      type: DataTypes.STRING(1),
    },
    col5: {
      type: DataTypes.STRING(200),
    },
    col6: {
      type: DataTypes.STRING(200),
    },
    vend_no: {
      type: DataTypes.STRING(200),
    },
    stoc_no: {
      type: DataTypes.STRING(200),
    },
    trans_type: {
      type: DataTypes.STRING(200),
    },
    trans_date: {
      type: DataTypes.DATE,
    },
    fact_no: {
      type: DataTypes.STRING(30),
    },
    item_text: {
      type: DataTypes.STRING(200),
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "iv_trans_d_tw",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = IV_TRANS_D_TW;