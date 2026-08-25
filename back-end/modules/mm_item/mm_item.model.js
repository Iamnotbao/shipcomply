const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const MM_ITEM = sequelize.define(
  "MM_ITEM",
  {
    org_id: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    item_no: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    name_s: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    name_t: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    name_e: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    name_j_t: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    name_j_s: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    name_j_e: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    bom_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    b_u: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    source_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    kind_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    item_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    money_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    ver: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    valid_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    wkwy_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    column1: {
      type: DataTypes.STRING(200),
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
    rec_id: {
      type: DataTypes.STRING(30),
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
    last_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    last_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acct_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    is_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    src: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    cust_color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    mold: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    size_group: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    column7: {
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
    vend_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unit_weight: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    color_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    column8: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column9: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    column10: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    length: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    high: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    last_proddate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_confirm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    confirm_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirm_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    operation_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cust_prod: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    item_attribute: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    size_kind: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    d_color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    t_color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    r_note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    out_itemno: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    rb_prod: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    rpu_prod: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    is_xn: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    attr_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    cust_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    safe_qty: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    tariffs: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    mk_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    ts_code: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    cr_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    zipname: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    item_group: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    spg_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    order_sizerange: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    other_code: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_dispo: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_dismm: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_sbdkz: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_lgpro: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_rgekz: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    item_brand: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_item_type: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_last_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_art_remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    sap_midsole: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    sap_art_remark2: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    tableName: "mm_item",
    schema: "public",
    timestamps: false,
  }
);

module.exports = MM_ITEM;
