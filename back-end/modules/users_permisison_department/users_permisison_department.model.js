const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const USER_PERMISSION_DEPARTMENT = sequelize.define(
  "USER_PERMISSION_DEPARTMENT",
  {
    user_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    factory_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    department_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
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
    grt_dept: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    last_user: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users_permission_department",
    schema: "Customs",
    timestamps: false,
  }
);

module.exports = USER_PERMISSION_DEPARTMENT;
