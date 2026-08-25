const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_ISSUE_MATD_T = sequelize.define(
  "AC_ISSUE_MATD_T",
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
      primaryKey: true,
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
    unit_qty: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    loss: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    req_qty: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    req_issue: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    issue_qty: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    col1: {
      type: DataTypes.DECIMAL(14, 4),
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
      type: DataTypes.DATE,
      allowNull: true,
    },
    col5: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    money: {
      type: DataTypes.DECIMAL(18, 4),
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
    tableName: "ac_issue_matd_t",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_ISSUE_MATD_T;