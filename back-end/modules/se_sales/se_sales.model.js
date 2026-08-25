const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_SALES = sequelize.define(
  "SE_SALES",
  {
    org_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    sales_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ou_re: {
      type: DataTypes.STRING(1),
      defaultValue: "1",
    },
    sales_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    send_type: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    send_corp: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    col1: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: "來源",
    },
    col2: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "出貨單號",
    },
    col3: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    col4: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    send_addr: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    status_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(600),
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
    tableName: "sales_sh",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_SALES;