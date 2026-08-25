const QueryHelper = require("../../utils/queryHelper");
const PROGRAM = require("../program/program.model");
const User = require("../users/user.model");
const USER_PERMISSION = require("./users_permission.model");
const pool = require("../../config/db");
const { QueryTypes } = require("sequelize");
async function getAll() {
  try {
    return await USER_PERMISSION.findAll({
      order: [["program_code", "ASC"]],
    });
  } catch (error) {
    console.log("Cannot get all user_permissions from db", error);
  }
}
async function getPermission(
  factory_code,
  department_code,
  user_code,
  program_code
) {
  const fields = [
    "modify_level",
    "query_level",
    "allow_add",
    "allow_query",
    "allow_modify",
    "allow_delete",
    "allow_cancel",
    "allow_confirm",
    "allow_unconfirm",
    "allow_check",
    "allow_uncheck",
    "allow_close",
  ];
  const t = await pool.transaction();
  try {
    await pool.query('SET search_path TO "Customs", public;', {
      transaction: t,
      type: pool.QueryTypes.RAW,
    });

    const results = await Promise.all(
      fields.map(async (f) => {
        try {
          const row = await pool.query(
            `SELECT "Customs".get_user_permission($1, $2, $3, $4, $5) AS title;`,
            {
              bind: [factory_code, department_code, user_code, program_code, f],
              transaction: t,
              type: pool.QueryTypes.SELECT,
            }
          );
          return {
            field: f,
            title: row[0]?.title,
            type: "control",
          };
        } catch (error) {
          console.error(`Error for field ${f}:`, error.original?.message);
          return {
            field: f,
            title: null,
          };
        }
      })
    );

    await t.commit();
    return results;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
async function getByID(factory_code, user_code, department_code, program_code) {
  try {
    const user_permission = await USER_PERMISSION.findOne({
      where: {
        factory_code: factory_code,
        user_code: user_code,
        department_code: department_code,
        program_code: program_code,
      },
      include: [
        {
          model: PROGRAM,
        },
      ],
    });
    if (!user_permission) {
      console.log("User_permission is not found!");
      return null;
    }
    return user_permission;
  } catch (error) {
    console.log("Error from db when query user_permission!", error);
  }
}
async function getByUser(user_code) {
  try {
    const user_permissions = await USER_PERMISSION.findAll({
      where: {
        user_code: user_code,
      },
    });

    if (!user_permissions) {
      console.log(
        "User_permission is not found by user with these code: " + user_code
      );
      return null;
    }
    return user_permissions;
  } catch (error) {
    console.log("Error from db when query user_permission!", error);
  }
}
async function getByFacAndUser(factory_code, department_code, user_code) {
  try {
    const user_permissions = await USER_PERMISSION.findAll({
      where: {
        factory_code: factory_code,
        department_code: department_code,
        user_code: user_code,
      },
      order: [["program_code", "ASC"]],
    });

    if (!user_permissions) {
      console.log(
        "User_permission is not found by user with these code: " + user_code
      );
      return null;
    }
    return user_permissions;
  } catch (error) {
    console.log("Error from db when query user_permission!", error);
  }
}
async function add(existUserPermission, t) {
  try {
    const addPermission = await USER_PERMISSION.create(existUserPermission, {
      transaction: t,
    });
    return addPermission;
  } catch (error) {
    console.log("Cannot add permission from the db ", error);
    throw error;
  }
}
async function search(keyword) {
  try {
    const queryHelper = new QueryHelper(keyword, {
      USER_PERMISSION: ["program_code"],
      User: ["user_code", "factory_code"],
    }).filter();
    const permissionSearch = await USER_PERMISSION.findAll({
      where: queryHelper.whereMap.USER_PERMISSION || {},
      include: [
        {
          model: User,
          where: queryHelper.whereMap.User || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["program_code", "ASC"]],
    });
    return permissionSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
  }
}
async function edit(existUserPermission, editUsersPermission, t) {
  try {
    console.log("editUserPermission",editUsersPermission);
    
    const editPermision = await existUserPermission.update(
      editUsersPermission,
      { transaction: t }
    );
    return editPermision;
  } catch (error) {
    console.log("Cannot edit permission from the db", error);
  }
}
async function deletePermisison(existUserPermission, t) {
  try {
    const deletePermision = await existUserPermission.destroy({
      transaction: t,
    });
    return deletePermision;
  } catch (error) {
    console.log("Cannot delete permission from db", error);
  }
}
async function copy(old_user, new_user, grt_user, t) {
  try {
    //Copy tất cả department records 
   const sql1 = `
  INSERT INTO "Customs".users_permission_department
    (user_code, factory_code, department_code, status, grt_date, grt_user, last_user, last_date)
  SELECT
    :new_user,
    factory_code,
    department_code,
    status,
    NOW(),
    :grt_user,
    :grt_user,
    NOW()
  FROM "Customs".users_permission_department
  WHERE user_code = :old_user
  ON CONFLICT (user_code, factory_code, department_code)
  DO UPDATE SET
    status    = EXCLUDED.status,
    last_user = EXCLUDED.last_user,
    last_date = EXCLUDED.last_date
`;

const sql2 = `
  INSERT INTO "Customs".users_permission
    (factory_code, department_code, user_code, program_code,
     query_level, modify_level,
     allow_query, allow_add, allow_modify, allow_delete,
     allow_check, allow_uncheck, allow_confirm, allow_unconfirm,
     allow_cancel, allow_close,
     grt_dept, grt_user, grt_date, last_user, last_date, status)
  SELECT
    factory_code, department_code,
    :new_user,
    program_code,
    query_level, modify_level,
    allow_query, allow_add, allow_modify, allow_delete,
    allow_check, allow_uncheck, allow_confirm, allow_unconfirm,
    allow_cancel, allow_close,
    grt_dept,
    :grt_user, NOW(),
    :grt_user, NOW(),
    status
  FROM "Customs".users_permission
  WHERE user_code = :old_user
  ON CONFLICT (user_code, factory_code, department_code, program_code)
  DO UPDATE SET
    query_level    = EXCLUDED.query_level,
    modify_level   = EXCLUDED.modify_level,
    allow_query    = EXCLUDED.allow_query,
    allow_add      = EXCLUDED.allow_add,
    allow_modify   = EXCLUDED.allow_modify,
    allow_delete   = EXCLUDED.allow_delete,
    allow_check    = EXCLUDED.allow_check,
    allow_uncheck  = EXCLUDED.allow_uncheck,
    allow_confirm  = EXCLUDED.allow_confirm,
    allow_unconfirm= EXCLUDED.allow_unconfirm,
    allow_cancel   = EXCLUDED.allow_cancel,
    allow_close    = EXCLUDED.allow_close,
    status         = EXCLUDED.status,
    last_user      = EXCLUDED.last_user,
    last_date      = EXCLUDED.last_date
`;

    await pool.query(sql1, {
      replacements: { old_user, new_user, grt_user },
      type: QueryTypes.INSERT,
      transaction: t,
    });

    await pool.query(sql2, {
      replacements: { old_user, new_user, grt_user },
      type: QueryTypes.INSERT,
      transaction: t,
    });

  } catch (error) {
    throw error;
  }
}
module.exports = {
  getAll,
  getByID,
  getPermission,
  getByFacAndUser,
  getByUser,
  add,
  edit,
  deletePermisison,
  search,
  copy
};
