const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_EXPECT_M = sequelize.define(
  "AC_EXPECT_M",
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
    type: {
      type: DataTypes.STRING(1),
      defaultValue: "1",
    },
    s_date1: {
      type: DataTypes.DATE,
    },
    e_date1: {
      type: DataTypes.DATE,
    },
    s_date2: {
      type: DataTypes.DATE,
    },
    e_date2: {
      type: DataTypes.DATE,
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
    tableName: "ac_expect_m",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_EXPECT_M;