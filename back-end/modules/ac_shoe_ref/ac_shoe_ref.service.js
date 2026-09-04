const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const acShoeRefRepository = require("./ac_shoe_ref.repository");

async function getAllAcShoeRef(
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acShoeRefRepository.listAllASR(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function checkValidData(
  factory_code,
  department_code,
  user_code,
  query_level,
  row,
) {
  const validData = await getAllAcShoeRef(
    factory_code,
    department_code,
    user_code,
    query_level,
    null,
    null,
    "",
  );
  const validItem = new Set(validData?.data?.map((item) => item?.prod_no));
  const isValid = validItem?.has(row.prod_no);
  return isValid;
}
async function getAcShoeRefByID(factory_code, customs_shoe_id, prod_no) {
  return await acShoeRefRepository.getByID(
    factory_code,
    customs_shoe_id,
    prod_no,
  );
}
async function updateStatusAcShoeRef(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  data,
) {
  try {
    const updateAPM = await acShoeRefRepository.updateStatus(
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
async function getByNoneViewItemNo(prod_no) {
  return await acShoeRefRepository.getByNoViewProdNo(prod_no);
}
async function getAcShoeRefByShoe(
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) {
  return await acShoeRefRepository.getByShoe(
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
}
async function getListViewProdNo(page, limit, search) {
  return await acShoeRefRepository.getListOfProdNo(page, limit, search);
}
async function addAcShoeRef(
  factory_code,
  department_code,
  user_code,
  query_level,
  acShoeRef,
  pageSize,
  t,
) {
  try {
    const existASR = await getAcShoeRefByID(
      acShoeRef.factory_code,
      acShoeRef.customs_shoe_id,
      acShoeRef.prod_no,
    );
    if (existASR) {
      const message =
        "AC Shoe Ref is already exist and prod no cannot be duplicate or the same !";
      return { message };
    }
    const result = await acShoeRefRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      acShoeRef,
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
async function editAcShoeRef(
  factory_code,
  department_code,
  user_code,
  query_level,
  customs_shoe_id,
  prod_no,
  acShoeRef,
  pageSize,
  t,
) {
  try {
    const existASR = await getAcShoeRefByID(
      factory_code,
      customs_shoe_id,
      prod_no,
    );
    if (!existASR) {
      console.log("ac shoe ref is not exist !");
      return null;
    }
    const result = await acShoeRefRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      existASR,
      acShoeRef,
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
async function deleteAcShoeRef(factory_code, customs_shoe_id, prod_no, t) {
  try {
    const existASR = await getAcShoeRefByID(
      factory_code,
      customs_shoe_id,
      prod_no,
    );
    if (!existASR) {
      console.log("Ac shoe ref is not exist !");
      return null;
    }
    const result = await acShoeRefRepository.deleteASR(existASR, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchAcShoeRef(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const acSRFound = await acShoeRefRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return acSRFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcShoeRef(filename) {
  const data = await getAllAcShoeRef();
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
  getAllAcShoeRef,
  getAcShoeRefByID,
  getAcShoeRefByShoe,
  getListViewProdNo,
  getByNoneViewItemNo,
  updateStatusAcShoeRef,
  addAcShoeRef,
  editAcShoeRef,
  exportPDFAcShoeRef,
  searchAcShoeRef,
  deleteAcShoeRef,
  checkValidData,
  // exportExcelMaterialAcImp,
  // exportExcelCustomAcImp
};
