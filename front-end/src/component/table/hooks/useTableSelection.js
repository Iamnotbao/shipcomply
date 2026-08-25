import { useCallback, useMemo } from "react";

const sameIdList = (left = [], right = []) => {
  if (left.length !== right.length) return false;

  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
};

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
  const selectedIds = useMemo(
    () => (selectRows || []).filter(Boolean).map((row) => getRowId(row)),
    [getRowId, selectRows],
  );

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

      // Do not call the controlled parent setter again when the clicked row is
      // already the active row. This keeps DataGrid/parent selection sync from
      // becoming a render feedback loop.
      if (selectedIds.includes(id)) return;

      onSelectChange?.([params.row]);
    },
    [
      focusContextRef,
      focusIndexRef,
      getRowId,
      gridRef,
      isSubTable,
      onSelectChange,
      rows,
      selectedIds,
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

        // DataGrid can re-emit a controlled selection model while props are
        // synchronizing. Ignore it when the actual ids have not changed.
        if (sameIdList(includedIds, selectedIds)) return;

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
    [getRowId, onSelectionChange, rows, selectCheckRef, selectedIds],
  );

  const getRowClassName = useCallback(
    (params) =>
      selectedIds.includes(getRowId(params.row)) ? "Mui-selected-row" : "",
    [getRowId, selectedIds],
  );

  return {
    selectedIds,
    handleRowClick,
    handleRowSelectionChange,
    getRowClassName,
  };
}
