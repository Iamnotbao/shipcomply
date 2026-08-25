const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const USER_PERMISSION = sequelize.define(
  "USER_PERMISSION",
  {
    factory_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    department_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    user_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    program_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    query_level: {
      type: DataTypes.STRING(30),
      defaultValue: "1",
      validate: {
        isIn: [["3", "2", "1"]],
      },
      allowNull: false,
    },
    modify_level: {
      type: DataTypes.STRING(30),
      defaultValue: "1",
      validate: {
        isIn: [["3", "2", "1"]],
      },
      allowNull: false,
    },
    allow_query: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_add: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_modify: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_delete: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_cancel: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_confirm: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_close: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_check: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_uncheck: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    allow_unconfirm: {
      type: DataTypes.STRING(1),
      defaultValue: "Y",
      validate: {
        isIn: [["N", "Y"]],
      },
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false,
    },
    grt_dept: {
      type: DataTypes.STRING(600),
    },
    grt_user: {
      type: DataTypes.STRING(600),
    },
    grt_date: {
      type: DataTypes.DATE,
    },
    last_user: {
      type: DataTypes.STRING(20),
    },
    last_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users_permission",
    schema: "Customs",
    timestamps: false,
  }
);
module.exports = USER_PERMISSION;
