const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_CONT_M = sequelize.define(
  "AC_CONT_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    cont_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    cont_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    issued_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expire_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_edate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vend_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    seller: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    p_seller: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    s_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    s_pic: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    s_position: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    s_accno: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    bvend_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    buyer: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    b_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    b_pic: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    b_position: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    b_accno: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    sum_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    sum_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    freight: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    insurance: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    term_pay: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    pay_term: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    time_delive: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    goods_origin: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    port_dis: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    bank: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    bank_ic: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    bank_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    d_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    cont_category: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    big_contno: {
      type: DataTypes.STRING(200),
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
      type: DataTypes.STRING(30),
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
    tableName: "ac_cont_m",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = AC_CONT_M;
