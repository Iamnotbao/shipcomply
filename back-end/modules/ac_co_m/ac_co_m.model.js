const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_CO_M = sequelize.define(
  "AC_CO_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    co_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    cust_id: {
      type: DataTypes.STRING(30),
    },
    sales_id: {
      type: DataTypes.INTEGER,
    },
    sales_no: {
      type: DataTypes.STRING(30),
    },
    sales_seq: {
      type: DataTypes.DECIMAL(6, 2),
    },
    se_id: {
      type: DataTypes.STRING(30),
    },
    se_seq: {
      type: DataTypes.DECIMAL(6, 2),
    },
    ship_seq: {
      type: DataTypes.DECIMAL(6, 2),
    },
    mer_po: {
      type: DataTypes.STRING(200),
    },
    po: {
      type: DataTypes.STRING(200),
    },
    fa_cbm: {
      type: DataTypes.DECIMAL(14, 4),
    },
    boat_company: {
      type: DataTypes.STRING(600),
    },
    destination: {
      type: DataTypes.STRING(600),
    },
    board_date: {
      type: DataTypes.DATEONLY,
    },
    bl_no: {
      type: DataTypes.STRING(30),
    },
    sort: {
      type: DataTypes.STRING(30),
    },
    print_id: {
      type: DataTypes.STRING(30),
    },
    boat_cbm: {
      type: DataTypes.DECIMAL(14, 4),
    },
    otcbm: {
      type: DataTypes.DECIMAL(14, 4),
    },
    sorting_cbm: {
      type: DataTypes.DECIMAL(14, 4),
    },
    co_no: {
      type: DataTypes.STRING(30),
    },
    el_no: {
      type: DataTypes.STRING(30),
    },
    elno: {
      type: DataTypes.STRING(30),
    },
    is_prt: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
    },
    boat_name: {
      type: DataTypes.STRING(200),
    },
    ar_no: {
      type: DataTypes.STRING(30),
    },
    ws_no: {
      type: DataTypes.STRING(30),
    },
    ql_date: {
      type: DataTypes.DATEONLY,
    },
    gross: {
      type: DataTypes.DECIMAL(14, 4),
    },
    by_out: {
      type: DataTypes.DATEONLY,
    },
    docend_date: {
      type: DataTypes.DATEONLY,
    },
    se_ver: {
      type: DataTypes.DECIMAL(6, 2),
    },
    pack_gu: {
      type: DataTypes.DECIMAL(6, 2),
    },
    ship_order: {
      type: DataTypes.STRING(200),
    },
    zip_invoice: {
      type: DataTypes.STRING(200),
    },
    invoice_no: {
      type: DataTypes.STRING(200),
    },
    net_weight: {
      type: DataTypes.DECIMAL(14, 4),
    },
    col1: {
      type: DataTypes.STRING(200),
    },
    col2: {
      type: DataTypes.STRING(200),
    },
    col3: {
      type: DataTypes.STRING(200),
    },
    col4: {
      type: DataTypes.STRING(200),
    },
    note: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
    },
    grt_dept: {
      type: DataTypes.STRING(30),
    },
    grt_user: {
      type: DataTypes.STRING(30),
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
    locked_information: {
      type: DataTypes.STRING(600),
    },
  },
  {
    tableName: "ac_co_m",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_CO_M;