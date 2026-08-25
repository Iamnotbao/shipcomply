const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const QueryHelper = require("../../utils/queryHelper");
const USER = require("./user.model");
const FACTORY = require("../factories/factory.model");
const DEPARTMENTS = require("../factory_departments/factory_deparments.model");
const { Sequelize } = require("sequelize");

async function findAll() {
  return await USER.findAll({
    include: [
      {
        model: FACTORY,
        attributes: [
          "factory_code",
          "factory_name_e",
          "factory_name_t",
          "factory_name_l",
          "factory_address",
          "factory_abbreviation",
          "factory_tax_no",
        ],
      },
      {
        model: DEPARTMENTS,
        attributes: [
          "factory_code",
          "department_code",
          "department_name_e",
          "department_name_t",
          "department_name_l",
          "status",
        ],
        required: false,
        where: Sequelize.where(
          Sequelize.col("USER.factory_code"),
          "=",
          Sequelize.col("DEPARTMENT.factory_code")
        ),
      },
    ],
    order: [
      ["factory_code", "ASC"],
      ["department_code", "ASC"],
      ["user_code", "ASC"],
    ],
  });
}
async function findAdmin() {
  return await USER.findOne({
    where: {
      user_code: "admin",
    },
    order: [
      ["factory_code", "ASC"],
      ["department_code", "ASC"],
      ["user_code", "ASC"],
    ],
    raw: true,
  });
}
async function countAll(factory_code, department_code) {
  return await USER.count({
    where: {
      factory_code: factory_code,
      department_code: department_code,
    },
  });
}
async function getByID(factory_code, department_code, user_code) {
  try {
    const foundUser = await USER.findOne({
      where: {
        factory_code,
        department_code,
        user_code,
      },
      include: [
        {
          model: FACTORY,
        },
        {
          model: DEPARTMENTS,
          where: {
            factory_code: factory_code,
            department_code: department_code,
          },
          required: false,
        },
      ],
    });

    if (!foundUser) {
      console.log("User does not exist in DB");
      return null;
    }

    return foundUser;
  } catch (error) {
    console.error("Error in getByID:", error);
    return null;
  }
}
async function getUUser(user_code) {
  try {
    const foundUser = await USER.findOne({
      where: {
        user_code,
      },
    });
    if (!foundUser) {
      console.log("User does not exist in DB");
      return null;
    }
    return foundUser;
  } catch (error) {
    console.error("Error in getByID:", error);
    return null;
  }
}
async function getByDepartment(factory_code, department_code) {
  const listByDepartment = await USER.findAll({
    where: {
      factory_code: factory_code,
      department_code: department_code,
    },
    order: [
      ["factory_code", "ASC"],
      ["department_code", "ASC"],
      ["user_code", "ASC"],
    ],
  });
  return listByDepartment;
}
async function getByFactory(factory_code) {
  const listByFactory = await USER.findAll({
    where: {
      factory_code: factory_code,
    },
  });
  return listByFactory;
}
async function add(user, t) {
  try {
    const addUser = await USER.create(user, { transaction: t });
    return addUser;
  } catch (error) {
    console.log("Error from db when add user", error);
    throw error;
  }
}
async function edit(existUser, editUser, t) {
  try {
    const edit = await existUser.update(editUser, { transaction: t });
    return edit;
  } catch (error) {
    console.log("Error from db when edit user", error);
  }
}
async function deleteU(existUser, t) {
  try {
    const deleteUser = await existUser.destroy({ transaction: t });
    return deleteUser;
  } catch (error) {
    console.log("Error from db when delete user", error);
  }
}
async function deleteAllU(users) {
  try {
    const deleteCount = await USER.destroy({
      where: {
        [Op.or]: users.map((u) => ({
          factory_code: u.factory_code,
          department_code: u.department_code,
          user_code: u.user_code,
        })),
      },
    });
    return deleteCount;
  } catch (error) {
    console.log("Database can not delete the data", error);
  }
}

async function search(keyword) {
  try {
    const queryHelper = new QueryHelper(keyword, {
      User: ["user_code", "supervisor_id", "allow_authorization", "status"],
      FACTORY: ["factory_code"],
      DEPARTMENTS: ["department_code"],
    }).filter();

    let userWhere = queryHelper.whereMap.User || {};
    let factoryWhere = null; // ← Đổi thành null thay vì {}
    let departmentWhere = null; // ← Đổi thành null thay vì {}

    if (queryHelper.whereMap.FACTORY) {
      const factoryConditions = queryHelper.whereMap.FACTORY[Op.and] || [];
      factoryConditions.forEach((condition) => {
        if (condition.factory_code) {
          userWhere = {
            ...userWhere,
            factory_code: condition.factory_code,
          };
        } else {
          // Có điều kiện factory_name
          if (!factoryWhere) factoryWhere = {};
          Object.assign(factoryWhere, condition);
        }
      });
    }

    if (queryHelper.whereMap.DEPARTMENTS) {
      const deptConditions = queryHelper.whereMap.DEPARTMENTS[Op.and] || [];
      deptConditions.forEach((condition) => {
        if (condition.department_code) {
          userWhere = {
            ...userWhere,
            department_code: condition.department_code,
          };
        } else {
          // Có điều kiện department_name
          if (!departmentWhere) departmentWhere = {};
          Object.assign(departmentWhere, condition);
        }
      });
    }

    const includes = [];

    // Nếu có điều kiện search factory_name
    if (factoryWhere !== null) {
      includes.push({
        model: FACTORY,
        where: factoryWhere,
        required: true, // INNER JOIN - chỉ lấy user có factory match
        attributes: [
          "factory_code",
          "factory_name_e",
          "factory_name_t",
          "factory_name_l",
          "factory_address",
          "factory_abbreviation",
          "factory_tax_no",
        ],
      });
    } else {
      // Không có điều kiện factory_name - include bình thường
      includes.push({
        model: FACTORY,
        attributes: [
          "factory_code",
          "factory_name_e",
          "factory_name_t",
          "factory_name_l",
          "factory_address",
          "factory_abbreviation",
          "factory_tax_no",
        ],
      });
    }

    // Nếu có điều kiện search department_name
    if (departmentWhere !== null) {
      includes.push({
        model: DEPARTMENTS,
        where: departmentWhere,
        required: true, // INNER JOIN - chỉ lấy user có department match
        attributes: [
          "factory_code",
          "department_code",
          "department_name_e",
          "department_name_t",
          "department_name_l",
          "status",
        ],
      });
    } else {
      includes.push({
        model: DEPARTMENTS,
        attributes: [
          "factory_code",
          "department_code",
          "department_name_e",
          "department_name_t",
          "department_name_l",
          "status",
        ],
        required: false,
        where: Sequelize.where(
          Sequelize.col("USER.factory_code"),
          "=",
          Sequelize.col("DEPARTMENT.factory_code")
        ),
      });
    }

    const userSearch = await USER.findAll({
      where: userWhere,
      include: includes,
      attributes: { exclude: ["grt_date", "last_date"] },
      order: [
        ["factory_code", "ASC"],
        ["department_code", "ASC"],
        ["user_code", "ASC"],
      ],
    });

    return userSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
async function importUserE(rows) {
  const t = await sequelize.transaction();
  try {
    for (const row of rows) {
      await USER.create(row, { transaction: t });
    }
    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    console.error("Import failed:", err);
    return { success: false, error: err };
  }
}
async function exportUserEx() {
  return await USER.findAll({ raw: true });
}
module.exports = {
  findAll,
  findAdmin,
  getByID,
  getUUser,
  add,
  edit,
  deleteU,
  deleteAllU,
  getByDepartment,
  getByFactory,
  search,
  importUserE,
  exportUserEx,
  countAll,
};
