const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PAKING_LIST_D = sequelize.define(
  "PAKING_LIST_D",
  {
    org_id: {
      type: DataTypes.STRING(6),
      allowNull: true,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
    },
    pack_gu: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
    },
    pk_seq: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      primaryKey: true,
    },
    s_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    e_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    c_no: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    size_seq: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    size_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cr_size: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ctns_pairs: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    pack_ctn_sizepairs: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    nw: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    gw: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    ship_seq: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    pack_ctn_pairs: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    ctns: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    ctns_show: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    ship_qty: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    t_nw: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    t_nw_show: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    t_gw: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    t_gw_show: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    measure: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    measure_show: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cbm: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    cbm_show: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cbm_noround: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
  },
  {
    tableName: "paking_list_d",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = PAKING_LIST_D;