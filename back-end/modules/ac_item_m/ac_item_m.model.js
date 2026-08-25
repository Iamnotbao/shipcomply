const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_ITEM_M = sequelize.define(
  "AC_ITEM_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    item_acno: {
      type: DataTypes.STRING(120),
      primaryKey: true,
    },
    item_acname_l: {
      type: DataTypes.STRING(600),
    },
    item_acname_t: {
      type: DataTypes.STRING(600),
    },
    item_acname_e: {
      type: DataTypes.STRING(600),
    },
    ac_item: {
      type: DataTypes.STRING(200),
    },
    unit: {
      type: DataTypes.STRING(30),
    },
    tax_per: {
      type: DataTypes.DECIMAL(6,2),
    },
    loss_per: {
      type: DataTypes.DECIMAL(6,2),
    },
    ac_type: {
      type: DataTypes.STRING(30),
    },
     locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
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
  },
  {
    tableName: "ac_item_m",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_ITEM_M;
