const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_PAY = sequelize.define(
  "SE_PAY",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    pay_no: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    name_s: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
     name_t: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
     name_e: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    dt_pct: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    cal_days: {
      type: DataTypes.DECIMAL(3, 0),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    locked_information: {
      type: DataTypes.STRING(600),
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
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    last_user: {
      type: DataTypes.STRING(30),
    },
    last_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "se_pay",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_PAY;
