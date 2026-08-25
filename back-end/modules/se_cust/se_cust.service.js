const seCustRepository = require("./se_cust.repository");

async function getAllCustDataDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  isStatus
) {
  return await seCustRepository.fetchCustDataDropdown(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    isStatus
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
  return await seCustRepository.fetchFieldByVendNo(
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
async function getAllFieldDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  extraField,
  isStatus
) {
  return await seCustRepository.fetchFieldDropdown(
    factory_code,
    field ,
    language,
    page,
    limit,
    search,
    extraField,
    isStatus
  );
}
module.exports = {
  getAllCustDataDropdown,
  getAllFieldByVendNo,
  getAllFieldDropdown
};
