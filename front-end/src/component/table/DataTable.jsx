import DataTableLegacy from "./DataTableLegacy";
import DataTableModern from "./DataTableModern";
import { canUseModernDataTable } from "./modernTableConfig";

export default function DataTable(props) {
  return canUseModernDataTable(props) ? (
    <DataTableModern {...props} />
  ) : (
    <DataTableLegacy {...props} />
  );
}
