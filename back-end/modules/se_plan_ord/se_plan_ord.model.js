const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SE_PLAN_ORD = sequelize.define(
  "SE_PLAN_ORD",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    se_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    se_ver: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    se_seq: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    pack_gu: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    ship_seq: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      primaryKey: true,
    },
    send_addr: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    send_type: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    ship_comp: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    cbm: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    p_shipdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    p_shipqty: {
      type: DataTypes.DECIMAL(16, 4),
      allowNull: true,
    },
    p_exdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    f_exdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ex_note: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    ex_status: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    sales_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    col5: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "航務代理",
    },
    col6: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "目的地",
    },
    column1: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "貨櫃場/倉庫",
    },
    column2: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "INVOICE NO#",
    },
    column3: {
      type: DataTypes.STRING(600),
      allowNull: true,
      defaultValue: "N",
      comment: "生效?",
    },
    column4: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "ETD",
    },
    book_no: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "Booking No",
    },
    qc_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qc_user: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    col7: {
      type: DataTypes.STRING(600),
      allowNull: true,
      defaultValue: "7",
      comment: "轉海關",
    },
    remark: {
      type: DataTypes.STRING(600),
      allowNull: true,
      comment: "備注說明",
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-New新單, 2-Check復核, 7-Confirm確認, 0-Cancel取消, 9-Close關閉",
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
    tableName: "se_plan_ord",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = SE_PLAN_ORD;