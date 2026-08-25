const basicDataCategoryRepo = require("./basic_data_category.repository");
const basicDataService = require("../basic_data/basic_data.service");
const factoryService = require("../factories/factory.service");
const QueryHelper = require("../../utils/queryHelper");
const { generatePDF } = require("../../utils/pdf");
async function getAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await basicDataCategoryRepo.listAll(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getAllWithBasicData(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await basicDataCategoryRepo.listAllWithBasicData(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getBasicCategoryDataByID(factory_code, category_code) {
  try {
    const factory = await basicDataCategoryRepo.getByID(
      factory_code,
      category_code,
    );
    return factory;
  } catch (error) {
    console.log(error);
  }
}
async function getByFactory(factory_code) {
  try {
    const factories = await basicDataCategoryRepo.getByFac(factory_code);
    return factories;
  } catch (error) {
    console.log(error);
  }
}
async function getByDeclareCate(factory_code, category_code, filter) {
  try {
    const result = await basicDataCategoryRepo.getByDeclareCategory(
      factory_code,
      category_code,
      filter,
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function createBasicDataCategory(
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
    const existBasicData = await getBasicCategoryDataByID(
      basicData.factory_code,
      basicData.category_code,
    );
    if (existBasicData) {
      const message = "This basic data category is already in the db!";
      return { message };
    }
    const result = await basicDataCategoryRepo.add(
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
    console.log("Error from create basic_data category service: ", error);
  }
}
async function editBasicCategoryData(
  factory_code,
  department_code,
  user_code,
  query_level,
  category_code,
  basicData,
  pageSize,
  t,
) {
  try {
    const existBasicData = await getBasicCategoryDataByID(
      factory_code,
      category_code,
    );
    if (!existBasicData) {
      console.log("Basic Data category is not in the db!");
      return null;
    }
    const editBasicData = await basicDataCategoryRepo.edit(
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
      console.log("Basic Data category cannot edit! ");
      return null;
    }
    return editBasicData;
  } catch (error) {
    console.log("Basic Data category cannot edit from service!");
  }
}
async function deleteBasicData(factory_code, category_code, t) {
  try {
    const existBasicData = await getBasicDataByID(factory_code, category_code);
    if (!existBasicData) {
      console.log("Basic Data category is not in the db!");
      return null;
    }

    const deleteBD = await basicDataCategoryRepo.deleteBasicData(
      existBasicData,
      t,
    );
    if (!deleteBD) {
      console.log("Cannot delete because null");
      return null;
    }
    return deleteDepartment;
  } catch (error) {
    console.log("Basic Data category cannot delete from service");
  }
}
async function deleteAllFactoryDepartment(departments) {
  try {
    const deleteDepartments =
      await basicDataCategoryRepo.deleteAllDepartments(departments);
    if (!deleteDepartments) {
      console.log("Cannot delete all because null");
      return null;
    }
    return deleteDepartments;
  } catch (error) {
    console.log("Basic Data category cannot delete all from service");
  }
}
async function searchBasicDataCategory(
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const response = await basicDataCategoryRepo.searchBasicDataCate(
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
async function exportPDFBasicDataCategory(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const data = await basicDataService.getAllWithCategory(
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    const plainData = data.map((item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const flattened = { ...plain };
      if (plain.CATEGORY) {
        flattened.category_name_t = plain.CATEGORY.category_name_t || "";
        flattened.category_name_e = plain.CATEGORY.category_name_e || "";
        flattened.category_name_l = plain.CATEGORY.category_name_l || "";
        flattened.category_status = plain.CATEGORY.status || "";
        delete flattened.CATEGORY;
      }
      return flattened;
    });
    await generatePDF(plainData, filename, "BASIC_DATA");
    return filename;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}
module.exports = {
  getAll,
  getAllWithBasicData,
  getBasicCategoryDataByID,
  getByDeclareCate,
  getByFactory,
  createBasicDataCategory,
  editBasicCategoryData,
  deleteBasicData,
  deleteAllFactoryDepartment,
  searchBasicDataCategory,
  exportPDFBasicDataCategory,
};
