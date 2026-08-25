const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acProdMRepository = require("./ac_prod_m.repository");

async function getAllAcProdM(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acProdMRepository.listAllASR(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}

async function getAcProdMDropdown(factory_code, language, page, limit, search) {
  return await acProdMRepository.listAcProdMDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
}
async function getAcProdMByID(factory_code, customs_shoe_id, prod_acno) {
  return await acProdMRepository.getByID(
    factory_code,
    customs_shoe_id,
    prod_acno,
  );
}
async function getAcProdMByShoe(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acProdM = await acProdMRepository.getByShoe(
      factory_code,
      customs_shoe_id,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acProdM;
  } catch (error) {
    console.log(error);
  }
}
async function updateStatusAProdM(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  data,
) {
  try {
    const updateAPM = await acProdMRepository.updateStatus(
      factory_code,
      customs_shoe_id,
      department_code,
      user_code,
      query_level,
      data,
    );
    return updateAPM;
  } catch (error) {
    console.log(error);
  }
}
async function addAcProdM(
  factory_code,
  department_code,
  user_code,
  query_level,
  acProdM,
  pageSize,
  t,
) {
  try {
    const existAPM = await getAcProdMByID(
      acProdM.factory_code,
      acProdM.customs_shoe_id,
      acProdM.prod_acno,
    );
    if (existAPM) {
      const message =
        "AC Prod M is already exist and prod no cannot be duplicate or the same !";
      return { message };
    }
    const result = await acProdMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acProdM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from import material trackin service: ", error);
  }
}
async function editAcProdM(
  factory_code,
  department_code,
  user_code,
  query_level,
  customs_shoe_id,
  prod_no,
  acProdM,
  pageSize,
  t,
) {
  try {
    const existAPM = await getAcProdMByID(
      factory_code,
      customs_shoe_id,
      prod_no,
    );
    if (!existAPM) {
      console.log("AC Prod M is not exist !");
      return null;
    }
    const result = await acProdMRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existAPM,
      acProdM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcProdM(factory_code, customs_shoe_id, prod_no, t) {
  try {
    const existAPM = await getAcProdMByID(
      factory_code,
      customs_shoe_id,
      prod_no,
    );
    if (!existAPM) {
      console.log("AC Prod M is not exist !");
      return null;
    }
    const result = await acProdMRepository.deleteASR(existAPM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcProdM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  try {
    const acSRFound = await acProdMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return acSRFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcProdM(filename) {
  const data = await get();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename);
  return filename;
}
// async function exportExcelMaterialAcImp(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomAcImp(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllAcProdM,
  getAcProdMByID,
  getAcProdMByShoe,
  updateStatusAProdM,
  addAcProdM,
  editAcProdM,
  exportPDFAcProdM,
  searchAcProdM,
  deleteAcProdM,
  getAcProdMDropdown
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
