const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_SHIPING_D = sequelize.define(
  "SE_SHIPING_D",
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
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    si_type: {
      type: DataTypes.STRING(2),
      primaryKey: true,
      allowNull: false,
    },
    bl: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    bl_adress: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    nb: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    nb_adress: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    two_nb: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    co: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    p_adress: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    agent: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col1: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    col2: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
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
    tableName: "se_shiping_d",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = SE_SHIPING_D;
