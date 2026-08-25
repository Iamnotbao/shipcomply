
const vwAcChgRepository = require("./vw_ac_chg.repository");


async function fetchFieldDropdown(
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  field
) {
  return await vwAcChgRepository.fetchFieldDataDropdown(
     factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
    field
  );
}

module.exports = {
  fetchFieldDropdown,
};
