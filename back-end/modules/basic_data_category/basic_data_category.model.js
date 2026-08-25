const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BASIC_DATA_CATEGORY = sequelize.define(
  "BASIC_DATA_CATEGORY",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    category_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    category_name_t: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    category_name_e: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    category_name_l: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(600),
    },
    grt_user: {
      type: DataTypes.STRING(600),
    },
    grt_date: {
      type: DataTypes.DATE,
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
     locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "basic_data_category",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = BASIC_DATA_CATEGORY;
