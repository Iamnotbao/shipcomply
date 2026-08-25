// Page size options for different table types
export const PAGE_SIZE_OPTIONS = {
  BASIC_DATA_CATEGORY: [5, 10, 15],
  AC_VEND_BASE: [5, 10, 15],
  AC_SEND_BASE: [5, 10, 15],
  AC_ITEM_M: [5, 10, 15],
  AC_SHOE_M: [5, 10, 15],
  AC_PROD_M: [10, 20, 30],
  AC_BOM_M: [10, 20, 30],
  RD_SIZE_D: [10,15,20],
  FACTORY: [10, 20, 30],
  USER: [10, 20, 30],
  DEPARTMENTS: [10, 20, 30],
  USER_PERMISSION: [10, 20, 30],
  USER_PERMISSION_DEPARTMENT: [5, 10, 15],
  AC_REQ_M: [5, 10, 15],
  AC_INM_M: [5, 10, 15],
  AC_PROC_M: [5, 10, 15],
  AC_CHG_A: [10, 20, 30],
  AC_DESC_CHG: [3, 5],
  AC_PLAN_ORD: [3, 5],
  AC_PLAN_SIZE: [3, 5],
  AC_PLAN_PACK: [3, 5],
  VW_AC_SUM: [10, 15, 20],
  DEFAULT: [5, 10, 15],
};

/**
 * Get page size options for a specific table type
 * @param {string} tableName - The name of the table
 * @returns {number[]} Array of page size options
 */
export const getPageSizeOptions = (tableName) => {
  return PAGE_SIZE_OPTIONS[tableName] || PAGE_SIZE_OPTIONS.DEFAULT;
};

/**
 * Get default page size for a specific table type
 * @param {string} tableName - The name of the table
 * @returns {number} Default page size
 */
export const getDefaultPageSize = (tableName) => {
  const options = getPageSizeOptions(tableName);
  return options[0];
};
