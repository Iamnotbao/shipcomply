const basicDataRepo = require("./basic_data.repository");
const factoryService = require("../factories/factory.service");
const QueryHelper = require("../../utils/queryHelper");
const { generatePDF } = require("../../utils/pdf");
const {
  getBasicCategoryDataByID,
} = require("../basic_data_category/basic_data_category.service");
async function getAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await basicDataRepo.listAll(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAllWithCategory(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await basicDataRepo.listAllWithCategory(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function updateStatusBD(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  data,
) {
  try {
    const updateSAIR = await basicDataRepo.updateStatus(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      data,
    );
    return updateSAIR;
  } catch (error) {
    console.log(error);
  }
}
async function getBasicDataByID(factory_code, category_code, code_no) {
  try {
    const factory = await basicDataRepo.getByID(
      factory_code,
      category_code,
      code_no,
    );
    return factory;
  } catch (error) {
    console.log(error);
  }
}
async function getByFactory(factory_code) {
  try {
    const factories = await basicDataRepo.getByFac(factory_code);
    return factories;
  } catch (error) {
    console.log(error);
  }
}
async function getByCategory(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const bd = await basicDataRepo.getByCate(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return bd;
  } catch (error) {
    console.log(error);
  }
}
async function getDropdownByCategory(
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus,
  language,
) {
  try {
    const valid_category = await getBasicCategoryDataByID(
      factory_code,
      category_code,
    );
    if (!valid_category) {
      throw new Error(
        `Category is not exist: factory_code=${factory_code}, category_code=${category_code}`,
      );
    }

    if (valid_category.status !== 7) {
      throw new Error("Category is inactive");
    }

    const bd = await basicDataRepo.getDropdownByCate(
      factory_code,
      category_code,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      isStatus,
      language,
    );
    return bd;
  } catch (error) {
    console.log(error);
  }
}
async function fetchDetailsForM(
  factory_code,
  category_code,
  whereClauseBasicData,
  factoryWhere,
) {
  try {
    const bd = await basicDataRepo.fetchDetailsForMaster(
      factory_code,
      category_code,
      whereClauseBasicData,
      factoryWhere,
    );
    return bd;
  } catch (error) {
    console.log(error);
  }
}
async function createBasicData(
  factory_code,
  department_code,
  user_code,
  query_level,
  basicData,
  pageSize,
  t,
) {
  try {
    const validFactory = await factoryService.getFactoryByID(
      basicData.factory_code,
    );

    if (!validFactory) {
      const message = "This factory is not exist!";
      return { message };
    }
    const existBasicData = await getBasicDataByID(
      basicData.factory_code,
      basicData.category_code,
      basicData.code_no,
    );
    if (existBasicData) {
      const message = "This basic data is already in the db!";
      return { message };
    }
    const result = await basicDataRepo.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      basicData,
      pageSize,
      t,
    );
    if (result == null) {
      console.log("Cannot add from the repository ");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Error from create basic_data service: ", error);
  }
}
async function editBasicData(
  factory_code,
  department_code,
  user_code,
  query_level,
  category_code,
  code_no,
  basicData,
  pageSize,
  t,
) {
  try {
    const existBasicData = await getBasicDataByID(
      factory_code,
      category_code,
      code_no,
    );
    if (!existBasicData) {
      console.log("Basic Data is not in the db!");
      return null;
    }
    const editBasicData = await basicDataRepo.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existBasicData,
      basicData,
      pageSize,
      t,
    );
    if (!editBasicData) {
      console.log("Basic Data cannot edit! ");
      return null;
    }
    return editBasicData;
  } catch (error) {
    console.log("Basic Data cannot edit from service!");
  }
}
async function deleteBasicData(factory_code, category_code, code_no, t) {
  try {
    const existBasicData = await getBasicDataByID(
      factory_code,
      category_code,
      code_no,
    );
    if (!existBasicData) {
      console.log("Basic Data is not in the db!");
      return null;
    }

    const deleteBD = await basicDataRepo.deleteBasicData(existBasicData, t);
    if (!deleteBD) {
      console.log("Cannot delete because null");
      return null;
    }
    return deleteDepartment;
  } catch (error) {
    console.log("Basic Data cannot delete from service");
  }
}
async function deleteAllFactoryDepartment(departments) {
  try {
    const deleteDepartments =
      await basicDataRepo.deleteAllDepartments(departments);
    if (!deleteDepartments) {
      console.log("Cannot delete all because null");
      return null;
    }
    return deleteDepartments;
  } catch (error) {
    console.log("Basic Data cannot delete all from service");
  }
}
async function searchByBasicData(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const response = await basicDataRepo.searchBasicData(
      search,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return response;
  } catch (error) {
    console.log("Error has been run from service", error);
  }
}
async function exportPDFBasicData(filename) {
  try {
    const data = await basicDataRepo.listAll();
    const plainDepartments = data.map((f) => f.get({ plain: true }));
    await generatePDF(plainDepartments, filename, "BASIC_DATA");
    return filename;
  } catch (error) {
    console.log("Error", error);
  }
}
module.exports = {
  getAll,
  getAllWithCategory,
  getBasicDataByID,
  getByFactory,
  getByCategory,
  getDropdownByCategory,
  fetchDetailsForM,
  updateStatusBD,
  createBasicData,
  editBasicData,
  deleteBasicData,
  deleteAllFactoryDepartment,
  searchByBasicData,
  exportPDFBasicData,
};
