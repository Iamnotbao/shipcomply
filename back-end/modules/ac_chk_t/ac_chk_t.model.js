const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_CHK_T = sequelize.define(
  "AC_CHK_T",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    conf_seq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      primaryKey: true,
    },
    matd_seq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      primaryKey: true,
    },
    issue_seq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      primaryKey: true,
    },
    src: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    in_acno: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    ac_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    d_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    out_acno: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    prod_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    matd_no: {
      type: DataTypes.STRING(200),
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
    pairs: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    unit_qty: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    loss_per: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    qty: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    over_qty: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    col1: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col2: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col3: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
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
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    tableName: "ac_chk_t",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_CHK_T;