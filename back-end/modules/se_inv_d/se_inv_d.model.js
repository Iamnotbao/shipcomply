// ==================== MODEL ====================
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_INV_D = sequelize.define(
  "SE_INV_D",
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
    se_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 1,
    },
    pack_gu: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 1,
    },
    pk_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    ship_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    size_run: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ctn_pairs: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    ctns: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    s_no: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    e_no: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    length: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    high: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    cbm: {
      type: DataTypes.DECIMAL(14, 4),
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
    se_id2: {
      type: DataTypes.STRING(200),
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
      allowNull: true,
      defaultValue: 1,
    },
    is_ac: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "se_inv_d",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_INV_D;