const vwAcIssueTService = require("./vw_ac_issue_t.service");
const fs = require("fs");

async function getListOfVAIT(req, res) {
  const {factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    language,
    limit,
    offset,} = req.query;
  const result = await vwAcIssueTService.getListOfVAIT(
    factory_code,
    department_code,
    user_code,
    query_level,
    conf_seq,
    language,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get list of vw ac cont imp!",
      success: false,
      tableName: "VW_AC_ISSUE_T",
    });
  }
  return res.status(200).json({
    message: "Get  vw ac cont imp by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "VW_AC_ISSUE_T",
  });
}

async function searchVwAcIssueT(req, res) {
  const { search } = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  try {
    const shoes = await vwAcIssueTService.searchVwAcIssueT(
      factory_code,
      department_code,
      user_code,
      query_level,
      search,
    );
    return res.json({
      message: "search vw cont imp successfully!",
      success: true,
      data: shoes,
      tableName: "VW_AC_ISSUE_T",
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getListOfVAIT,
  searchVwAcIssueT,
};
