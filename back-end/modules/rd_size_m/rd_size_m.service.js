const rdSizeMRepository = require("./rd_size_m.repository");

async function getAllSizeDataDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  isStatus
) {
  return await rdSizeMRepository.fetchSizeDataDropdown(
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
  return await rdSizeMRepository.fetchFieldByVendNo(
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
  return await rdSizeMRepository.fetchFieldDropdown(
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
  getAllSizeDataDropdown,
  getAllFieldByVendNo,
  getAllFieldDropdown
};
