export const MODERN_TABLE_PILOT = new Set([
  "PROGRAM",
  "AC_SHOE_M",
  "AC_PROD_M",
]);

const hasSidePanelData = (props) =>
  Boolean(props.factories || props.departments || props.users || props.programs);

export const canUseModernDataTable = (props = {}) => {
  if (!MODERN_TABLE_PILOT.has(props.tableName)) return false;

  // Keep complex selection/sub-table/side-panel variants on the legacy
  // implementation until each business-specific behavior is migrated.
  if (
    props.isSubTable ||
    props.subTable ||
    props.customCheckboxColumn ||
    hasSidePanelData(props)
  ) {
    return false;
  }

  return true;
};
