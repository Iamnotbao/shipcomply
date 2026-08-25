const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_SHIPING_M = sequelize.define(
  "AC_SHIPING_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    cust_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
     si_seq: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: false,
      primaryKey: true,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(20),
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
    tableName: "ac_shiping_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_SHIPING_M;
