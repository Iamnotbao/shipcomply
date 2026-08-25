const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SD_ORD_M = sequelize.define(
  "SD_ORD_M",
  {
    org_id: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL(3, 0),
      allowNull: false,
      primaryKey: true,
    },
    se_type: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    se_mark: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    se_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    merchant: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pay_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    acc_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    po: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    mer_po: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    se_day: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prod_type: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    curr_no: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    se_money: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true,
    },
    pay_no: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    send_mode: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    send_addr: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    busi_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    grt_dept: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    grt_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    last_user: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    last_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lead_time: {
      type: DataTypes.DECIMAL(3, 0),
      allowNull: true,
    },
    is_dpoc: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: 'N',
    },
    cicut_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sales_type: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    status_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    vas_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    zipname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mtf_se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    shoe_no: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    prod_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: 'A',
    },
    cust_lot: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    size_type: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    cust_sizetype: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    pack_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    flow_grp: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    se_qty: {
      type: DataTypes.DECIMAL(16, 4),
      allowNull: true,
    },
    b_qty: {
      type: DataTypes.DECIMAL(16, 4),
      allowNull: true,
    },
    cr_reqdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nst: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nlt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sales_price: {
      type: DataTypes.DECIMAL(16, 4),
      allowNull: true,
    },
    sales_money: {
      type: DataTypes.DECIMAL(16, 4),
      allowNull: true,
    },
    rebate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    rebate_money: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true,
    },
    column1: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    column2: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column3: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column4: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column5: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column6: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column7: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    status: {
      type: DataTypes.DECIMAL(2, 0),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(4000),
      allowNull: true,
    },
    cur_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    cr_prod: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nst_confirm: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: 'N',
    },
    nlt_confirm: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: 'N',
    },
    delay_reason: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    plan_remark: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sap_item_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    mtf_se_seq: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: true,
    },
  },
  {
    tableName: "SD_ORD_M",
    schema: "pac",
    timestamps: false,
  }
);

module.exports = SD_ORD_M;