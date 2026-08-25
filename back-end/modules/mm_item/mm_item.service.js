const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const mMItemRepository = require("./mm_item.repository");

async function getAllMMItem(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await mMItemRepository.listAllMMI(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function getAllItemNo(page, limit, search) {
  return await mMItemRepository.listAllItemNoMMI(page, limit, search);
}
async function checkValidData(row) {
  const validData = await getAllItemNo(null, null, "");
  const validItemNo = new Set(validData?.data?.map((item) => item?.item_no));
  const isValid =  validItemNo?.has(row.item_no);
  return isValid;
}
async function getMMItemByID(item_no) {
  return await mMItemRepository.getByID(item_no);
}
async function getRdSizeDBySize(
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
) {
  return await mMItemRepository.getBySizeType(
    factory_code,
    size_type,
    department_code,
    user_code,
    query_level,
  );
}
async function addMMI(mMItem, t) {
  try {
    const existMMI = await getMMItemByID(mMItem.item_no);
    if (existMMI) {
      const message =
        "Import material tracking is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await mMItemRepository.add(mMItem, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    message = error;
    console.log("error from import material trackin service: ", error);
    return { message };
  }
}
async function editAcRsd(factory_code, size_type, size_no, rdSizeD, t) {
  try {
    const existRSD = await getRdSizeDByID(
      factory_code,
      size_type,
      size_no,
      rdSizeD,
    );
    if (!existRSD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await mMItemRepository.edit(existRSD, rdSizeD, t);
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
      acImp,
    );
    if (!existRSD) {
      console.log("Import material tracking is not exist !");
      return null;
    }
    const result = await mMItemRepository.deleteRSD(existRSD, t);
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
) {
  try {
    const rSDFound = await mMItemRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
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
  getAllMMItem,
  getAllItemNo,
  getMMItemByID,
  getRdSizeDBySize,
  addMMI,
  editAcRsd,
  exportPDFRSD,
  searchRSD,
  deleteAcRSD,
  exportPDFRSD,
  exportExcelMaterialAcImp,
  exportExcelCustomAcImp,
  checkValidData,
};
