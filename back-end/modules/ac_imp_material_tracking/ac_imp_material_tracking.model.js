const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AC_IMP_MATERIAL_TRACKING = sequelize.define(
  "AC_IMP_MATERIAL_TRACKING",
  {
    factory_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    invoice_no: {
      type: DataTypes.STRING(200),
      allowNull: false,
      primaryKey: true,
    },
    sort: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    declaration_category: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    record_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    loading_way: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    exporting_countries: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    b_l: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    loading_port: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unloading_port: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    shipside: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    bill_of_lading_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    departure_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_arrival_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_arrival_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoice_amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    qty_of_pieces: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    gross_weight: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    packaging_unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    material_description: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    factory_materials: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    shipping_payment_way: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    import_delay_reason: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    container_quantity: {
      type: DataTypes.DECIMAL(14, 4),
      allowNull: true,
    },
    date_completion_procedures: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    declaration_retrieve_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_ac: {
      type: DataTypes.STRING(1),
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
    tableName: "ac_imp_material_tracking",
    schema: "Customs",
    timestamps: false,
  },
);

module.exports = AC_IMP_MATERIAL_TRACKING;
