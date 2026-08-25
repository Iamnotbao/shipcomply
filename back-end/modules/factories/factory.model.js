const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const FACTORY = sequelize.define(
  "FACTORY",
  {
    factory_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    factory_name_t: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    factory_name_e: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    factory_name_l: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    factory_address: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    factory_abbreviation: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    factory_tax_no: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    grt_user: {
      type: DataTypes.STRING(600),
      allowNull:true
    },
    grt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull:true
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "factory",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = FACTORY;
