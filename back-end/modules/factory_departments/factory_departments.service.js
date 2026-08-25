const fDeparmentRepo = require("./factory_departments.repository");
const factoryService = require("../factories/factory.service");
const QueryHelper = require("../../utils/queryHelper");
const { generatePDF } = require("../../utils/pdf");
async function getAll() {
  return await fDeparmentRepo.listAll();
}
async function getDepartmentByID(factory_code, department_code) {
  try {
    const factory = await fDeparmentRepo.getByID(factory_code, department_code);
    return factory;
  } catch (error) {
    console.log(error);
  }
}
async function getByFactory(factory_code) {
  try {
    const factories = await fDeparmentRepo.getByFac(factory_code);
    return factories;
  } catch (error) {
    console.log(error);
  }
}
async function createDepartment(department, t) {
  try {
    console.log("service pass: ", department);

    const validFactory = await factoryService.getFactoryByID(
      department.factory_code
    );

    const existDepartment = await getDepartmentByID(
      department.factory_code,
      department.department_code
    );
    if (!validFactory) {
      console.log("This factory is not exist!");
      return null;
    }
    if (existDepartment) {
      const message ="Department is already exist and department_code cannot be the same!"
      return {message};
    }
    const result = await fDeparmentRepo.add(department, t);
    if (result == null) {
      console.log("Cannot add from the repository ");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Error from create department service: ", error);
  }
}
async function editDepartment(factory_code, department_code, department, t) {
  try {
    const existDepartment = await getDepartmentByID(
      factory_code,
      department_code
    );
    if (!existDepartment) {
      console.log("Department is not in the db!");
      return null;
    }
    const editDepartment = await fDeparmentRepo.edit(
      existDepartment,
      department
    );
    if (!editDepartment) {
      console.log("Department cannot edit! ");
      return null;
    }
    return editDepartment;
  } catch (error) {
    console.log("Department cannot edit from service!");
  }
}
async function deleteFactoryDepartment(factory_code, department_code, t) {
  try {
    const existDepartment = await getDepartmentByID(
      factory_code,
      department_code
    );
    if (!existDepartment) {
      console.log("Department is not in the db!");
      return null;
    }

    const deleteDepartment = await fDeparmentRepo.deleteDepartment(
      existDepartment,
      t
    );
    if (!deleteDepartment) {
      console.log("Cannot delete because null");
      return null;
    }
    return deleteDepartment;
  } catch (error) {
    console.log("Department cannot delete from service");
  }
}
async function deleteAllFactoryDepartment(departments) {
  try {
    const deleteDepartments = await fDeparmentRepo.deleteAllDepartments(
      departments
    );
    if (!deleteDepartments) {
      console.log("Cannot delete all because null");
      return null;
    }
    return deleteDepartments;
  } catch (error) {
    console.log("Department cannot delete all from service");
  }
}
async function searchByDepartment(search) {
  try {
    const response = await fDeparmentRepo.searchDepartment(search)
    return response;
  } catch (error) {
    console.log("Error has been run from service",error);
    
  }
}
async function exportPDFDepartment(filename) {
    try {
      const data = await fDeparmentRepo.listAll();
      const plainDepartments = data.map(f => f.get({ plain: true }));
       await generatePDF(plainDepartments,filename,"DEPARTMENTS");
      return filename;
    } catch (error) {
      console.log("Error",error);
    }
}
module.exports = {
  getAll,
  getDepartmentByID,
  getByFactory,
  createDepartment,
  editDepartment,
  deleteFactoryDepartment,
  deleteAllFactoryDepartment,
  searchByDepartment,
  exportPDFDepartment
};
