const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_PROD_M = sequelize.define(
  "AC_PROD_M",
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
    prod_acno: {
      type: DataTypes.STRING(120),
      primaryKey: true,
      allowNull: false,
    },
    start_size: {
      type: DataTypes.STRING(30),
    },
    s_seq: {
      type: DataTypes.DECIMAL(6, 2),
      get() {
        const value = this.getDataValue("s_seq");
        return value !== null ? parseFloat(value) : null;
      },
      allowNull: true,
    },
    end_size: {
      type: DataTypes.STRING(30),
    },
    e_seq: {
      type: DataTypes.DECIMAL(6, 2),
      get() {
        const value = this.getDataValue("e_seq");
        return value !== null ? parseFloat(value) : null;
      },
      allowNull: true,
    },
    pt_per: {
      type: DataTypes.DECIMAL(6, 2),
      get() {
        const value = this.getDataValue("pt_per");
        return value !== null ? parseFloat(value) : null;
      },
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
    },
    bang_ke_size: {
      type: DataTypes.STRING(30),
      get() {
        const value = this.getDataValue("bang_ke_size");
        return value !== null ? value : this.getDataValue("start_size");
      },
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
    tableName: "ac_prod_m",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_PROD_M;
