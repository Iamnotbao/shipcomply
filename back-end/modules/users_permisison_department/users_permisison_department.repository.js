const QueryHelper = require("../../utils/queryHelper");
const USER_PERMISSION_DEPARTMENT = require("./users_permisison_department.model");
const pool = require("../../config/db");

async function listAll() {
  return await USER_PERMISSION_DEPARTMENT.findAll({
    order: [
      ["factory_code", "ASC"],
      ["department_code", "ASC"],
      ["user_code", "ASC"],
    ],
  });
}
async function getPermissionByQuery(){
  const t = await pool.transaction();
  try {
    await pool.query('SET search_path TO "Customs", public;', {
        transaction:t,
        type:  pool.QueryTypes.RAW,
    });
    const row = await pool.query(`SELECT * FROM "Customs".get_user_permission($1, $2, $3, $4) AS title;`,{
      bind:["2010","AAO","admin","allow_add"],
      type:pool.QueryTypes.SELECT,
      transaction:t
    })
    return {
      field:"allow_add",
      title:row[0]?.title,
      type:"column"
    }
  } catch (error) {
    
  }
}
async function getByID(factory_code, department_code, user_code) {
  const userPerDept = await USER_PERMISSION_DEPARTMENT.findOne({
    where: {
      factory_code: factory_code,
      department_code: department_code,
      user_code: user_code,
    },
  });
  if (!userPerDept) {
    console.log("No users_permission_department founds!");
    return null;
  }
  return userPerDept;
}
async function getByUser(user_code) {
  const userPerDept = await USER_PERMISSION_DEPARTMENT.findAll({
    where: {
      user_code: user_code,
    },
  });
  if (!userPerDept) {
    console.log("No users_permission_department founds!");
    return null;
  }
  return userPerDept;
}
async function add(userPerDept, t) {
  try {
    const adduserPerDept = await USER_PERMISSION_DEPARTMENT.create(
      userPerDept,
      {
        transaction: t,
      }
    );
    return adduserPerDept;
  } catch (error) {
    console.log("Cannot add program from db", error);
  }
}
async function edit(existUPD, userPerDept, t) {
  try {
    const editUPD = await existUPD.update(userPerDept, {
      transaction: t,
    });
    return editUPD;
  } catch (error) {
    console.log("Cannot edit program from db", error);
  }
}
async function deleteUPD(existUserPerDept, t) {
  try {
    const deleteUDP = await existUserPerDept.destroy({ transaction: t });
    return deleteUDP;
  } catch (error) {
    console.log("Cannot delete program from db", error);
  }
}
async function search(keyword) {
  try {
    const fields = [
      "user_code",
      "factory_code",
      "department_code",
      "status",
      "grt_dept",
      "grt_user",
      "last_user",
      "grt_date",
      "last_date",
    ];
    const queryHelper = new QueryHelper(keyword, {
      USER_PERMISSION_DEPARTMENT: fields,
    }).filter();
    const userDP = await USER_PERMISSION_DEPARTMENT.findAll({
      where: queryHelper.whereMap.USER_PERMISSION_DEPARTMENT || {},
      order: [
        ["factory_code", "ASC"],
        ["department_code", "ASC"],
        ["user_code", "ASC"],
      ],
    });
    return userDP;
  } catch (error) {
    console.log("Database can not search the data", error);
  }
}
module.exports = { listAll, getByID, add, edit, deleteUPD, search,getByUser };
