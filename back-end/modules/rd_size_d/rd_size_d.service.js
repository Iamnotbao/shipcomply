const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const rdSizeDRepository = require("./rd_size_d.repository");

async function getAllRdSizeD(
  factory_code,
  department_code,
  user_code,
  query_level
) {
  return await rdSizeDRepository.listAllRSD(
    factory_code,
    department_code,
    user_code,
    query_level
  );
}
async function getRdSizeDByID(factory_code, size_type, size_no) {
  return await rdSizeDRepository.getByID(factory_code, size_type, size_no);
}
async function getRdSizeDBySize(
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
  limit,
  offset
) {
  return await rdSizeDRepository.getBySizeType(
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
    limit,
    offset
  );
}
async function getDropBySize(
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus
) {
  try {
    const bd = await rdSizeDRepository.getDropdownBySize(
      factory_code,
      size_type,
      department_code,
      user_code,
      query_level,
      page,
      limit,
      search,
      isStatus
    );
    return bd;
  } catch (error) {
    console.log(error);
  }
}
async function addAcRSD(acImp, t) {
  try {
    const existRSD = await getRdSizeDByID(
      acImp.factory_code,
      acImp.size_type,
      acImp.size_no
    );
    if (existRSD) {
      const message =
        "Import material tracking is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await rdSizeDRepository.add(acImp, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from import material trackin service: ", error);
  }
}
async function editAcRsd(factory_code, size_type, size_no, rdSizeD, t) {
  try {
    const existRSD = await getRdSizeDByID(
      factory_code,
      size_type,
      size_no,
      rdSizeD
    );
    if (!existRSD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await rdSizeDRepository.edit(existRSD, rdSizeD, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from import material tracking service", error);
  }
}
async function deleteAcRSD(factory_code, size_type, size_no, t) {
  try {
    const existRSD = await getRdSizeDByID(
      factory_code,
      size_type,
      size_no,
      acImp
    );
    if (!existRSD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await rdSizeDRepository.deleteRSD(existRSD, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchRSD(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset
) {
  try {
    const rSDFound = await rdSizeDRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset
    );
    return rSDFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFRSD(filename) {
  const data = await getAllAcImp();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename, "Rd_Size_D");
  return filename;
}
async function exportExcelMaterialAcImp(filename, filters) {
  return await exportExcelMaterial(filename, filters);
}
async function exportExcelCustomAcImp(filename, filters) {
  return await exportExcelCustoms(filename, filters);
}
module.exports = {
  getAllRdSizeD,
  getRdSizeDByID,
  getRdSizeDBySize,
  getDropBySize,
  addAcRSD,
  editAcRsd,
  exportPDFRSD,
  searchRSD,
  deleteAcRSD,
  exportPDFRSD,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
};
