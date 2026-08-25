import { useCallback } from "react";

export default function useTableSelection({
  rows = [],
  selectRows = [],
  getRowId,
  onSelectChange,
  onSelectionChange,
  selectCheckRef,
  isSubTable = false,
  gridRef,
  setFocusContext,
  setIsFocused,
  focusContextRef,
  focusIndexRef,
  setFocusIndex,
}) {
  const handleRowClick = useCallback(
    (params) => {
      if (!isSubTable) {
        focusContextRef.current = "table";
        setFocusContext("table");
        setIsFocused(true);
        gridRef.current?.focus();
      }

      const id = getRowId(params.row);
      const rowIndex = rows.findIndex((row) => getRowId(row) === id);

      if (rowIndex !== -1) {
        focusIndexRef.current = rowIndex;
        setFocusIndex(rowIndex);
      }

      const isSelected = selectRows.some((row) => getRowId(row) === id);
      onSelectChange(isSelected ? selectRows : [params.row]);
    },
    [
      focusContextRef,
      focusIndexRef,
      getRowId,
      gridRef,
      isSubTable,
      onSelectChange,
      rows,
      selectRows,
      setFocusContext,
      setFocusIndex,
      setIsFocused,
    ],
  );

  const handleRowSelectionChange = useCallback(
    (newSelection) => {
      if (!onSelectionChange) return;

      let selectedObjects = [];
      let uncheckedRow = null;

      if (newSelection?.type === "exclude") {
        const excludedIds = new Set(Array.from(newSelection.ids || []));
        selectedObjects =
          excludedIds.size === 0
            ? [...rows]
            : rows.filter((row) => !excludedIds.has(getRowId(row)));
      } else if (newSelection?.type === "include") {
        const includedIds = Array.from(newSelection.ids || []);
        const includedSet = new Set(includedIds);
        const previousRows = selectCheckRef?.current || [];

        if (previousRows.length > 0) {
          uncheckedRow = previousRows.find(
            (row) => !includedSet.has(getRowId(row)),
          );
        }

        selectedObjects = includedIds
          .map((id) => rows.find((row) => getRowId(row) === id))
          .filter(Boolean);
      }

      if (onSelectionChange.length === 2) {
        onSelectionChange(selectedObjects, uncheckedRow);
      } else {
        onSelectionChange(selectedObjects);
      }
    },
    [getRowId, onSelectionChange, rows, selectCheckRef],
  );

  const getRowClassName = useCallback(
    (params) =>
      selectRows.some((row) => getRowId(row) === getRowId(params.row))
        ? "Mui-selected-row"
        : "",
    [getRowId, selectRows],
  );

  return {
    handleRowClick,
    handleRowSelectionChange,
    getRowClassName,
  };
}
