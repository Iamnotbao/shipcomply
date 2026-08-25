const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_SRCORDER_M = sequelize.define(
  "AC_SRCORDER_M",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    order_type: {
      type: DataTypes.STRING(30),
    },
    order_date: {
      type:DataTypes.DATE,
    },
    order_no: {
      type: DataTypes.STRING(30),
    },
    order_seq: {
      type: DataTypes.INTEGER,
    },
    vend_no: {
      type: DataTypes.STRING(30),
    },
    ac_send: {
      type: DataTypes.STRING(30),
    },
    ac_code: {
      type: DataTypes.STRING(30),
    },
    cont_no: {
      type: DataTypes.STRING(200),
    },
    pr_unit: {
      type: DataTypes.STRING(30),
    },
    pr_formula: {
      type: DataTypes.INTEGER,
    },
    order_qty: {
      type: DataTypes.INTEGER,
    },
    req_ac: {
      type: DataTypes.STRING(1),
    },
    item_acno: {
      type: DataTypes.STRING(200),
    },
    order_acqty: {
      type: DataTypes.INTEGER,
    },
    chge_qty: {
      type: DataTypes.INTEGER,
    },
    rcpt_qty: {
      type: DataTypes.INTEGER,
    },

    pass_qty: {
      type: DataTypes.INTEGER,
    },
    plan_seq: {
      type: DataTypes.INTEGER,
    },
    currency: {
      type: DataTypes.STRING(30),
    },
    price: {
      type: DataTypes.INTEGER,
    },

    amount: {
      type: DataTypes.INTEGER,
    },
    vr_cfmday: {
      type: DataTypes.DATE,
    },
    req_acqty: {
      type: DataTypes.INTEGER,
    },
    chge_ordqty: {
      type: DataTypes.INTEGER,
    },
    ac_vend: {
      type: DataTypes.STRING(30),
    },
    locked_information: {
      type: DataTypes.STRING(600),
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    // grt_dept: {
    //   type: DataTypes.STRING(30),
    //   allowNull: true,
    // },
    // grt_user: {
    //   type: DataTypes.STRING(20),
    //   allowNull: true,
    // },
    // grt_date: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    //   allowNull: true,
    // },
    // last_user: {
    //   type: DataTypes.STRING(30),
    // },
    // last_date: {
    //   type: DataTypes.DATE,
    // },
  },
  {
    tableName: "ac_srcorder_m",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = AC_SRCORDER_M;
