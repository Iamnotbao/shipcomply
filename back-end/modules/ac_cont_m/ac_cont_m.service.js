// ac_cont_m.service.js
const { generateExcel } = require("../../utils/excel");
const acContMRepository = require("./ac_cont_m.repository");

async function getAllAcContM(
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  return await acContMRepository.listAllAcContM(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
}
async function confirmAll(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) {
  return await acContMRepository.confirm(
    factory_code,
    department_code,
    user_code,
    query_level,
    cont_no,
  );
}
async function getAllAcContMWithView(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
) {
  return await acContMRepository.listAllAcContMWithView(
    factory_code,
    department_code,
    user_code,
    query_level,
    language,
  );
}

async function getAcContMByID(factory_code, cont_no) {
  return await acContMRepository.getByID(factory_code, cont_no);
}
async function getFieldByPVM(
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  category_code,
  vend_no,
  language,
  page,
  limit,
  search,
  isStatus
) {
  return await acContMRepository.fetchFieldByPoVenderM(
    factory_code,
    department_code,
    user_code,
    query_level,
    field,
    category_code,
    vend_no,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}
async function getBank(factory_code, field) {
  return await acContMRepository.fetchBankParameter(factory_code, field);
}
async function getBigCont(factory_code, gridData, page, limit, search) {
  return await acContMRepository.fetchBigContNo(
    factory_code,
    gridData,
    page,
    limit,
    search,
  );
}
async function getBigContNoExmp(factory_code, gridData, page, limit, search) {
  return await acContMRepository.fetchBigContNoExmp(
    factory_code,
    gridData,
    page,
    limit,
    search,
  );
}
async function addAcContM(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_type,
  acContM,
  pageSize,
  t,
) {
  try {
    const existContM = await getAcContMByID(
      acContM.factory_code,
      acContM.cont_no,
    );
    if (existContM) {
      const message =
        "Contract master is already exist and contract number cannot be duplicate or the same!";
      return { message };
    }
    const result = await acContMRepository.add(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_type,
      acContM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Error from contract master service: ", error);
  }
}

async function editAcContM(
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_type,
  cont_no,
  acContM,
  pageSize,
  t,
) {
  try {
    const existContM = await getAcContMByID(factory_code, cont_no);
    if (!existContM) {
      console.log("Contract master is not exist!");
      return null;
    }
    const result = await acContMRepository.edit(
      factory_code,
      department_code,
      user_code,
      query_level,
      cont_type,
      existContM,
      acContM,
      pageSize,
      t,
    );
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot edit from contract master service", error);
  }
}

async function deleteAcContM(factory_code, cont_no, t) {
  try {
    const existContM = await getAcContMByID(factory_code, cont_no);
    if (!existContM) {
      console.log("Contract master is not exist!");
      return null;
    }
    const result = await acContMRepository.deleteContM(existContM, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}

async function searchAcContM(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const acContMFound = await acContMRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return acContMFound;
  } catch (error) {
    console.log(error);
  }
}

async function exportExcelAcContM(
  filename,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  const data = await getAllAcContM(
    factory_code,
    department_code,
    user_code,
    query_level,
  );
  const plainFactory = data.map((d) => d.get({ plain: true }));
  return await generateExcel(plainFactory, filename);
}

module.exports = {
  getAllAcContM,
  getAllAcContMWithView,
  getAcContMByID,
  getFieldByPVM,
  getBigCont,
  getBigContNoExmp,
  getBank,
  addAcContM,
  editAcContM,
  deleteAcContM,
  searchAcContM,
  exportExcelAcContM,
  confirmAll
};
