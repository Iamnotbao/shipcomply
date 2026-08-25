const cdCodeRepository = require("./cd_code.repository");

async function getAllFieldDropdownn(
  factory_code,
  rule_no,
  language,
  page,
  limit,
  search,
) {
  return await cdCodeRepository.fetchFieldDropdown(
    factory_code,
    rule_no,
    language,
    page,
    limit,
    search,
  );
}
async function getAllFieldByVendNo(
  factory_code,
  field,
  category_code,
  vend_no,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await cdCodeRepository.fetchFieldByVendNo(
    factory_code,
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
module.exports = {
  getAllFieldDropdownn,
  getAllFieldByVendNo,
};
