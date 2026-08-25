export const MODERN_TABLE_PILOT = new Set([
  "FACTORY",
  "PROGRAM",
  "AC_SHOE_M",
  "AC_PROD_M",
]);

export const canUseModernDataTable = (props = {}) => {
  if (!MODERN_TABLE_PILOT.has(props.tableName)) return false;

  // Keep complex selection/sub-table variants on the legacy implementation
  // until their business-specific behavior is migrated explicitly.
  if (props.isSubTable || props.subTable || props.customCheckboxColumn) {
    return false;
  }

  return true;
};
