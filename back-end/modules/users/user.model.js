const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const USER = sequelize.define(
  "USER",
  {
    factory_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    department_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    user_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    user_name_t: {
      type: DataTypes.STRING(600),
    },
    user_name_e: {
      type: DataTypes.STRING(600),
    },
    user_name_l: {
      type: DataTypes.STRING(600),
    },
    user_password: {
      type: DataTypes.STRING(80),
    },
    supervisor_id:{
        type:DataTypes.STRING(20)
    },
    allow_authorization:{
        type:DataTypes.STRING(1),
        defaultValue:"Y",
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
     grt_dept: {
      type: DataTypes.STRING(20),
      allowNull:true
    },
    grt_user: {
      type: DataTypes.STRING(20),
      allowNull:true
    },
    grt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull:true
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = USER;
