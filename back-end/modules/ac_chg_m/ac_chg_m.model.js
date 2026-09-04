const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_CHG_M = sequelize.define(
  "AC_CHG_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    ac_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    ac_chgno: {
      type: DataTypes.STRING(200),
    },
    ac_chgn: {
      type: DataTypes.STRING(60),
    },
    ac_chgo: {
      type: DataTypes.STRING(60),
    },
    ac_chgs: {
      type: DataTypes.STRING(60),
    },
    ac_type: {
      type: DataTypes.STRING(1),
      defaultValue: "1",
    },
    ac_unit: {
      type: DataTypes.STRING(30),
    },
    ac_addr: {
      type: DataTypes.STRING(600),
    },
    org_tax: {
      type: DataTypes.STRING(200),
    },
    org_addr: {
      type: DataTypes.STRING(600),
    },
    cust_tax: {
      type: DataTypes.STRING(200),
    },
    cust_addr: {
      type: DataTypes.STRING(600),
    },
    rec_addr: {
      type: DataTypes.STRING(600),
    },
    agent_make: {
      type: DataTypes.STRING(30),
    },
    chg_type: {
      type: DataTypes.STRING(30),
    },
    license: {
      type: DataTypes.STRING(30),
    },
    lic_date: {
      type: DataTypes.DATE,
    },
    lic_edate: {
      type: DataTypes.DATE,
    },
    cont_no: {
      type: DataTypes.STRING(200),
    },
    com_invoice: {
      type: DataTypes.STRING(200),
    },
    trans_name: {
      type: DataTypes.STRING(200),
    },
    vehicle_no: {
      type: DataTypes.STRING(200),
    },
    arr_date: {
      type: DataTypes.DATE,
    },
    deliver: {
      type: DataTypes.STRING(600),
    },
    trans_type: {
      type: DataTypes.STRING(200),
    },
    trans_date: {
      type: DataTypes.DATE,
    },
    in_port: {
      type: DataTypes.STRING(30),
    },
    unload_port: {
      type: DataTypes.STRING(30),
    },
    out_date: {
      type: DataTypes.DATE,
    },
    out_port: {
      type: DataTypes.STRING(30),
    },
    curr_no: {
      type: DataTypes.STRING(30),
    },
    curr_rate: {
      type: DataTypes.DECIMAL(18, 8),
    },
    payment: {
      type: DataTypes.STRING(30),
    },
    tax: {
      type: DataTypes.DECIMAL(14, 4),
    },
    add_tax: {
      type: DataTypes.DECIMAL(14, 4),
    },
    oth_cost: {
      type: DataTypes.DECIMAL(14, 4),
    },
    peice: {
      type: DataTypes.DECIMAL(14, 4),
    },
    sum_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    suttle: {
      type: DataTypes.DECIMAL(14, 4),
    },
    gross: {
      type: DataTypes.DECIMAL(14, 4),
    },
    sum_money: {
      type: DataTypes.DECIMAL(14, 4),
    },
    trade: {
      type: DataTypes.STRING(30),
    },
    min_cont: {
      type: DataTypes.STRING(200),
    },
    in_country: {
      type: DataTypes.STRING(60),
    },
    ac_row: {
      type: DataTypes.STRING(600),
    },
    ac_bom: {
      type: DataTypes.STRING(600),
    },
    shoe_id: {
      type: DataTypes.STRING(30),
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
    },
    last_user: {
      type: DataTypes.STRING(30),
    },
    last_date: {
      type: DataTypes.DATE,
    },
    out_country: {
      type: DataTypes.STRING(30),
    },
    b_unit: {
      type: DataTypes.STRING(30),
    },
    com_date: {
      type: DataTypes.DATE,
    },
    sort: {
      type: DataTypes.STRING(200),
    },
    old_no: {
      type: DataTypes.STRING(20),
    },
    lation: {
      type: DataTypes.STRING(200),
    },
    js_no: {
      type: DataTypes.STRING(200),
    },
    js_date: {
      type: DataTypes.DATE,
    },
    soso: {
      type: DataTypes.STRING(200),
    },
    complete_type: {
      type: DataTypes.STRING(1),
    },
    d_type: {
      type: DataTypes.STRING(1),
    },
    pass_date: {
      type: DataTypes.DATE,
    },
    stoc_type: {
      type: DataTypes.STRING(1),
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "ac_chg_m",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_CHG_M;
