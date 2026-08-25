const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_PROC_M = sequelize.define(
  "AC_PROC_M",
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
    d_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
      comment: "報關類別: 3-Import VN; 6-其它Others",
    },
    ac_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "報關日期",
    },
    in_cont: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "進口合同號",
    },
    ac_outer: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "出口地址",
    },
    rec_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "交貨地點",
    },
    rec_person: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "賣方加工廠商",
    },
    in_curr: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(進)幣別",
    },
    in_crate: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "(進)匯率",
    },
    in_settle: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(進)結算方式",
    },
    out_org: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "賣方加工廠商地址",
    },
    out_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(出)報關類別",
    },
    out_license: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "出口執照",
    },
    out_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "出口日期",
    },
    out_cont: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "出口合同號",
    },
    out_vdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "(出)合同滿期日",
    },
    in_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(進)報關類別",
    },
    in_license: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "進口執照 - Auto from GF_PARAM_VALUE",
    },
    in_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "進口日期",
    },
    in_vdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "(進)合同滿期日",
    },
    vat_invoice: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "VAT發票",
    },
    com_invoice: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "貿易發票",
    },
    sort: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "大品名",
    },
    out_settle: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(出)結算方式",
    },
    out_curr: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "(出)幣別",
    },
    out_crate: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "(出)匯率",
    },
    tax: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "總稅額 - Auto calculated",
    },
    add_tax: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "附加稅額 - Auto calculated",
    },
    oth_cost: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "其它費 - 暫不使用",
    },
    peice: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "件數",
    },
    sum_qty: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "總數量 - Auto calculated",
    },
    suttle: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "淨重 - 暫不使用",
    },
    gross: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "毛重",
    },
    sum_money: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
      comment: "總金額 - Auto calculated",
    },
    ac_chgo: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: "報關單號-O",
    },
    ac_chgn: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: "報關單號-N",
    },
    ac_chgs: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: "報關單號-S",
    },
    ac_chgeno: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "報關單號 - Concat of S/N/O",
    },
    ex_user: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "辦理執照人",
    },
    col1: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "賣方加工廠商稅號",
    },
    col2: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "作廢公文號",
    },
    col3: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    col4: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    com_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "貿易發票日期",
    },
    vat_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "VAT發票日期",
    },
    col6: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    in_port: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    unload_port: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    min_cont: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "Annex",
    },
    b_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "暫不使用",
    },
    trans_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "暫不使用",
    },
    arr_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "暫不使用",
    },
    out_country: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    deliver: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "暫不使用",
    },
    js_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "繳稅編號",
    },
    js_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "繳稅日期",
    },
    soso: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "SOSO",
    },
    complete_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
      comment: "暫不使用",
    },
    ac_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
      comment: "暫不使用",
    },
    ac_inner: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "暫不使用",
    },
    stoc_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
      comment: "倉別: 1-非保稅; 2-保稅; 3-NONE; 4-VAT",
    },
    mark: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "A",
      comment: "單據類別: A-轉廠進口報關單；B-非保稅材料",
    },
    vend_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "暫不使用",
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-New; 2-Check; 7-Confirm; 0-Cancel; 9-Close",
    },
    grt_dept: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "建檔部門",
    },
    grt_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "建檔用戶",
    },
    grt_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "建檔時間",
    },
    last_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "修改人",
    },
    last_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "修改時間",
    },
    locked_information: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "資料鎖信息",
    },
  },
  {
    tableName: "ac_proc_m",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_PROC_M;