// ==================== MODEL ====================
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_ISSUE_M_T = sequelize.define(
  "AC_ISSUE_M_T",
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
    ac_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    conf_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lock_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lock_seq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    acbom_no: {
      type: DataTypes.STRING(200),
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
    ac_shoeid: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    prod_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    percent: {
      type: DataTypes.DECIMAL(5, 2),
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
    tableName: "ac_issue_m_t",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_ISSUE_M_T;