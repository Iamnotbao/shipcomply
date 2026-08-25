const { generateExcel } = require("../../utils/excel");
const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const vwAcIssueTRepository = require("./vw_ac_issue_t.repository");

async function getListOfVAIT(factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    language,
    limit,
    offset,) {
  return await vwAcIssueTRepository.listOfVwAcIssueT(
   factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    language,
    limit,
    offset,
  );
}
async function searchVwAcIssueT(
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) {
  try {
    const acCIFound = await vwAcIssueTRepository.search(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
    );
    return acCIFound;
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  getListOfVAIT,
  searchVwAcIssueT,
};
