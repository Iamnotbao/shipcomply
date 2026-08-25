const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SD_ORD_M_C = sequelize.define(
  "SD_ORD_M_C",
  {
    org_id: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
      comment: "组织代码",
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
      comment: "订单号",
    },
    se_type: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: "订单类别",
    },
    se_mark: {
      type: DataTypes.STRING(1),
      allowNull: false,
      comment: "訂單形態",
    },
    se_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "下单客戶",
    },
    merchant: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "貿易商",
    },
    pay_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "付款客戶",
    },
    acc_custid: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "收货客戶",
    },
    po: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "下單客户订单号",
    },
    mer_po: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "直接客戶訂單號",
    },
    se_day: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "下单日期",
    },
    prod_type: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: "產品類別",
    },
    curr_no: {
      type: DataTypes.STRING(8),
      allowNull: true,
      comment: "币別",
    },
    se_money: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true,
      comment: "总金额",
    },
    pay_no: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "交易條件",
    },
    send_mode: {
      type: DataTypes.STRING(8),
      allowNull: true,
      comment: "送貨方式",
    },
    send_addr: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "送貨地點",
    },
    busi_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "業務員",
    },
    grt_dept: {
      type: DataTypes.STRING(8),
      allowNull: true,
      comment: "权限部门",
    },
    grt_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "权限用戶",
    },
    last_user: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "最后修改人",
    },
    lead_time: {
      type: DataTypes.DECIMAL(3, 0),
      allowNull: true,
      comment: "最后修改日",
    },
    is_dpoc: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "N",
    },
    cicut_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
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
      type: DataTypes.DATE,
      allowNull: true,
    },
    zipname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ori_se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    mtf_se_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
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
      defaultValue: "A",
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
      type: DataTypes.DATE,
      allowNull: true,
    },
    nst: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nlt: {
      type: DataTypes.DATE,
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
    last_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
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
      type: DataTypes.DATE,
      allowNull: true,
    },
    nst_confirm: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "N",
    },
    nlt_confirm: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "N",
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
    pack_gu: {
      type: DataTypes.DECIMAL(4, 0),
      allowNull: false,
      defaultValue: 1,
      primaryKey: true,
    },
    ctn_pairs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pack_made: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "N",
    },
  },
  {
    tableName: "sd_ord_m_c",
    schema: "pac",
    timestamps: false,
  }
);

module.exports = SD_ORD_M_C;