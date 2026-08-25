const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_EXPECT_MATD = sequelize.define(
  "AC_EXPECT_MATD",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    expect_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    seq: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      primaryKey: true,
    },
    matd_no: {
      type: DataTypes.STRING(200),
    },
    loss_per: {
      type: DataTypes.DECIMAL(6, 2),
    },
    expect_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    left_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    issue_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    draw_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    col1: {
      type: DataTypes.STRING(200),
    },
    col2: {
      type: DataTypes.STRING(200),
    },
    col3: {
      type: DataTypes.DATE,
    },
    col4: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(30),
    },
    grt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_user: {
      type: DataTypes.STRING(30),
    },
    last_date: {
      type: DataTypes.DATE,
    },
    locked_information: {
      type: DataTypes.STRING(600),
    },
  },
  {
    tableName: "ac_expect_matd",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_EXPECT_MATD;