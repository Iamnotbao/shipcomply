// sap_trans_type.model.js
const { DataTypes } = require("sequelize");
const pool = require("../../config/db.js");

const SAP_TRANS_TYPE = pool.define(
  "SAP_TRANS_TYPE",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    type_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    type_name: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    material_out: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    ship_out: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
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
    schema: "Customs",
    tableName: "SAP_TRANS_TYPE",
    timestamps: false,
  }
);

module.exports = SAP_TRANS_TYPE;