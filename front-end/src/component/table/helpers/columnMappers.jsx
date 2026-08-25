import React from "react";
import moment from "moment";

/**
 * Helper functions to map column rendering logic
 * These handle special cases for different table types and fields
 */

/**
 * Render date cell with formatting
 */
export const renderDateCell = (params) => {
  if (!params.value) return "";
  return moment(params.value).format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Render factory name based on language
 */
export const renderFactoryName = (params, factories, nameField) => {
  if (!params?.row) return null;
  const fact = factories[0]?.data.find(
    (f) => f.factory_code === params.row.factory_code
  );
  return <span>{fact?.[nameField] || params.row.factory_name || ""}</span>;
};

/**
 * Render department name based on language
 */
export const renderDepartmentName = (params, deptList, nameField) => {
  if (!params?.row) return null;
  const dept = deptList?.find(
    (d) =>
      d.factory_code === params.row.factory_code &&
      d.department_code === params.row.department_code
  );
  return <span>{dept?.[nameField] || params.row.department_name || ""}</span>;
};

/**
 * Check if column should have date rendering
 */
export const isDateColumn = (field) => {
  return field === "grt_date" || field === "last_date";
};

/**
 * Check if column should have switch rendering (USER_PERMISSION)
 */
export const isSwitchColumn = (field, tableName) => {
  return tableName === "USER_PERMISSION" && field.startsWith("allow_");
};

/**
 * Check if column is factory_name in USER_PERMISSION_DEPARTMENT
 */
export const isFactoryNameColumn = (field, tableName) => {
  return tableName === "USER_PERMISSION_DEPARTMENT" && field === "factory_name";
};

/**
 * Check if column is department_name in USER_PERMISSION_DEPARTMENT
 */
export const isDepartmentNameColumn = (field, tableName) => {
  return (
    tableName === "USER_PERMISSION_DEPARTMENT" && field === "department_name"
  );
};

/**
 * Check if column is level dropdown (USER_PERMISSION)
 */
export const isLevelDropdownColumn = (field, tableName) => {
  return tableName === "USER_PERMISSION" && field.endsWith("_level");
};

/**
 * Check if column is checkbox (AC_VEND_BASE)
 */
export const isCheckboxColumn = (field, tableName) => {
  return (
    (tableName === "AC_VEND_BASE" && field === "is_default") ||
    field === "req_qc"
  );
};
