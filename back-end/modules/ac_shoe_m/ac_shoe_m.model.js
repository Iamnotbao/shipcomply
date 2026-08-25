const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_SHOE_M = sequelize.define(
  "AC_SHOE_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    customs_shoe_id: {
      type: DataTypes.STRING(120),
      primaryKey: true,
      allowNull: false,
    },
    customs_shoe_name_l: {
      type: DataTypes.STRING(600),
    },
    customs_shoe_name_t: {
      type: DataTypes.STRING(600),
    },
    customs_shoe_name_e: {
      type: DataTypes.STRING(600),
    },
    customs_tariff: {
      type: DataTypes.STRING(200),
    },
    size_type: {
      type: DataTypes.STRING(30),
    },
    unit: {
      type: DataTypes.STRING(30),
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(30),
    },
    grt_date: {
      type: DataTypes.DATE,
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
    tableName: "ac_shoe_m",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_SHOE_M;
