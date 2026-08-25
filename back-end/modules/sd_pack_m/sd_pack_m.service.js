const sdPackMRepository = require("./sd_pack_m.repository");

async function getAllSeIdDataDropdown(
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  isStatus,
) {
  return await sdPackMRepository.fetchSeIdDataDropdown(
    factory_code,
    field,
    language,
    page,
    limit,
    search,
    isStatus,
  );
}

module.exports = {
  getAllSeIdDataDropdown,
};
