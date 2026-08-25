import { useMemo } from "react";
import TableColumns from "../TableColumns";
import { filterColumnsByLanguage } from "../../../utils/table";
import { DateCell } from "../cells";
import { isDateColumn } from "../helpers/columnMappers.jsx";

export default function useModernTableColumns({
  tableName,
  language,
  columnTranslations = [],
  getColumnLabel,
}) {
  return useMemo(() => {
    const baseColumns = TableColumns[tableName] || [];

    const translatedColumns = baseColumns.map((column) => {
      const translation = columnTranslations.find(
        (item) => item.field === column.field,
      );
      const isStatus = column.field === "status";
      const translatedTitle =
        translation?.title ||
        getColumnLabel?.(column.field, column.headerName) ||
        column.headerName;

      return {
        ...column,
        field: isStatus ? "statusText" : column.field,
        headerName:
          (isStatus
            ? columnTranslations.find((item) => item.field === "status")?.title
            : translatedTitle) || column.headerName,
        ...(isDateColumn(column.field) && {
          renderCell: (params) => <DateCell value={params.value} />,
        }),
      };
    });

    return filterColumnsByLanguage(translatedColumns, language);
  }, [columnTranslations, getColumnLabel, language, tableName]);
}
