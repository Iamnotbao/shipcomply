const { Op } = require("sequelize");
const DEPARTMENTS = require("./factory_deparments.model");
const FACTORY = require("../factories/factory.model");
const QueryHelper = require("../../utils/queryHelper");

async function listAll() {
  return await DEPARTMENTS.findAll({
     order: [["department_code", "ASC"]],
  });
}
async function getByID(factory_code, department_code) {
  try {
    const department = await DEPARTMENTS.findOne({
      where: {
        factory_code: factory_code,
        department_code: department_code,
      },
      include: [FACTORY],
    });
    return department;
  } catch (error) {
    console.log("Error from department Db: ", error);
  }
}
async function getByFac(factory_code) {
  try {
    const department = await DEPARTMENTS.findAll({
      where: {
        factory_code: factory_code,
      },
      order: [["department_code", "ASC"]],
    });
    return department;
  } catch (error) {
    console.log("Error from department Db: ", error);
  }
}
async function add(department, t) {
  try {
    const response = await DEPARTMENTS.create(department, {
      transaction: t,
    });
    return response;
  } catch (error) {
    console.log("Error from department db: ", error);
  }
}
async function edit(existDepartment, department, t) {
  try {
    const editDepartment = await existDepartment.update(department, {
      transaction: t,
    });
    return editDepartment;
  } catch (error) {
    console.log("Error from department repo: ", error);
  }
}
async function deleteDepartment(existDepartment, t) {
  try {
    await existDepartment.destroy({ transaction: t });
    return 1;
  } catch (error) {
    console.log("Cannot delete factory from db");
  }
}
async function deleteAllDepartments(departments) {
  try {
    const deleteCount = await DEPARTMENTS.destroy({
      where: {
        [Op.or]: departments.map((d) => ({
          factory_code: d.factory_code,
          department_code: d.department_code,
        })),
      },
    });
    return deleteCount;
  } catch (error) {
    console.log("Database can not delete all the data", error);
  }
}
async function searchDepartment(query) {
  try {
    const queryHelper = new QueryHelper(query, {
      DEPARTMENTS: ["department_code", "status"],
      FACTORY: ["factory_code"],
    }).filter();

    const facSearch = await DEPARTMENTS.findAll({
      where: queryHelper.whereMap.DEPARTMENTS || {},
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["department_code", "ASC"]],
    });

    return facSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}

module.exports = {
  listAll,
  edit,
  add,
  getByID,
  getByFac,
  deleteDepartment,
  deleteAllDepartments,
  searchDepartment,
};
