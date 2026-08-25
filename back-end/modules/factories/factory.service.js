const { generatePDF } = require("../../utils/pdf");
const factoryReposity = require("./factory.repository");

async function testDB() {
  const response = await factoryReposity.test();
  return response;
}
async function getAllFactories(limit,offset) {
  return await factoryReposity.listAllFactories(limit,offset);
}
async function getFieldDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await factoryReposity.fetchFieldByFactory(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getFactoryByID(factory_code) {
  return await factoryReposity.getByID(factory_code);
}
async function addFactory(factory,pageSize, t) {
  try {
    const existFactory = await getFactoryByID(factory.factory_code);
    if (existFactory) {
      const message =
        "Factory is already exist and factory_code cannot be duplicate or the same !";
      return { message };
    }
    const result = await factoryReposity.add(factory,pageSize, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from factory service: ", error);
  }
}
async function editFactory(factory_code, factory,pageSize, t) {
  try {
    const existFactory = await getFactoryByID(factory_code);
    if (!existFactory) {
      console.log("Factory is not exist !");
      return null;
    }
    const result = await factoryReposity.edit(existFactory, factory,pageSize, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from factory service", error);
  }
}
async function deleteFactory(factory_code, t) {
  try {
    const existFactory = await getFactoryByID(factory_code);
    if (!existFactory) {
      console.log("Factory is not exist !");
      return null;
    }
    const result = await factoryReposity.deleteFac(existFactory, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchFactory(keyword, page, limit) {
  try {
    const factoryfound = await factoryReposity.search(keyword, page, limit);
    return factoryfound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFFactories(filename) {
  const data = await getAllFactories();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename);
  return filename;
}
module.exports = {
  testDB,
  getAllFactories,
  getFactoryByID,
  addFactory,
  editFactory,
  deleteFactory,
  searchFactory,
  exportPDFFactories,
  getFieldDropdown
};
