const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_EXPECT_SE = sequelize.define(
  "AC_EXPECT_SE",
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
    prod_no: {
      type: DataTypes.STRING(200),
    },
    bom_prod: {
      type: DataTypes.STRING(200),
    },
    ac_shoe: {
      type: DataTypes.STRING(200),
    },
    se_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    col1: {
      type: DataTypes.STRING(200),
    },
    col2: {
      type: DataTypes.STRING(200),
    },
    col3: {
      type: DataTypes.DATEONLY,
    },
    col4: {
      type: DataTypes.DATEONLY,
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
    tableName: "ac_expect_se",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_EXPECT_SE;