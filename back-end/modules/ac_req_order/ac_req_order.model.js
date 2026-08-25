const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_REQ_ORDER = sequelize.define(
  "AC_REQ_ORDER",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    req_no: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    req_seq: {
      type: DataTypes.DECIMAL(14, 4),
      primaryKey: true,
      allowNull: false,
    },
    order_type: {
      type: DataTypes.STRING(2),
      primaryKey: true,
    },
    src_id: {
      type: DataTypes.DECIMAL(14, 4),
    },
    order_date: {
      type: DataTypes.DATE,
    },
    order_no: {
      type: DataTypes.STRING(30),
    },
    order_seq: {
      type: DataTypes.DECIMAL(14, 4),
    },
    ac_send: {
      type: DataTypes.STRING(30),
    },
    cont_no: {
      type: DataTypes.STRING(200),
    },
    ac_code: {
      type: DataTypes.STRING(30),
    },
    item_acno: {
      type: DataTypes.STRING(30),
    },

    order_acqty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    req_acqty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    chge_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    rcpt_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    pass_qty: {
      type: DataTypes.DECIMAL(14, 4),
    },
    req_qc: {
      type: DataTypes.DECIMAL(14, 4),
    },
    req_qty: {
      type: DataTypes.INTEGER,
    },
    currency: {
      type: DataTypes.STRING(30),
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
    },
    amount: {
      type: DataTypes.DECIMAL(14, 4),
    },
    chk_no: {
      type: DataTypes.STRING(30),
    },
    chk_seq: {
     type: DataTypes.DECIMAL(14, 4),
    },
    locked_information: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER(1),
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
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "ac_req_order",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_REQ_ORDER;
