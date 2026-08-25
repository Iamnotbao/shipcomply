import { useCallback, useEffect, useRef } from "react";
import {
  getNextRowNavigation,
  getTotalPagesForNavigation,
} from "../tableKeyboardNavigation";

export default function useTableKeyboardNavigation({
  rows = [],
  getRowId,
  focusIndex,
  setFocusIndex,
  focusIndexRef,
  paginationModel,
  handlePaginationModelChange,
  totalData,
  isSearch,
  hasMore,
  onSelectChange,
  selectRows = [],
  onAdd,
  onEdit,
  onDelete,
  onDetail,
  gridRef,
}) {
  const pendingSelectIndexRef = useRef(null);

  const selectIndex = useCallback(
    (index, behavior = "smooth") => {
      if (rows.length === 0) return;

      const safeIndex = Math.min(Math.max(index, 0), rows.length - 1);
      const row = rows[safeIndex];
      if (!row) return;

      focusIndexRef.current = safeIndex;
      setFocusIndex(safeIndex);
      onSelectChange?.([row]);

      window.setTimeout(() => {
        const rowElement = document.querySelector(
          `[data-id="${getRowId(row)}"]`,
        );
        rowElement?.scrollIntoView({ behavior, block: "nearest" });
      }, 30);
    },
    [focusIndexRef, getRowId, onSelectChange, rows, setFocusIndex],
  );

  useEffect(() => {
    if (pendingSelectIndexRef.current === null || rows.length === 0) return;

    const index = Math.min(pendingSelectIndexRef.current, rows.length - 1);
    pendingSelectIndexRef.current = null;
    selectIndex(index, "auto");
  }, [rows, selectIndex]);

  useEffect(() => {
    if (rows.length === 0) {
      focusIndexRef.current = 0;
      setFocusIndex(0);
      return;
    }

    if (focusIndex >= rows.length) {
      const nextIndex = rows.length - 1;
      focusIndexRef.current = nextIndex;
      setFocusIndex(nextIndex);
    }
  }, [focusIndex, focusIndexRef, rows.length, setFocusIndex]);

  const handleKeyDown = useCallback(
    (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isEditable || event.key === "Tab") return;

      const { key, ctrlKey } = event;

      if (key === "ArrowDown" || key === "ArrowUp") {
        if (rows.length === 0) return;

        event.preventDefault();
        event.stopPropagation();

        const currentPage = paginationModel.page;
        const pageSize = paginationModel.pageSize;
        const totalPages = getTotalPagesForNavigation({
          isSearch,
          totalData,
          hasMore,
          currentPage,
          pageSize,
          localLength: rows.length,
        });
        const next = getNextRowNavigation({
          key,
          currentIndex: focusIndexRef.current,
          localLength: rows.length,
          currentPage,
          pageSize,
          totalPages,
        });

        if (!next) return;

        if (next.changePage) {
          pendingSelectIndexRef.current = next.index;
          focusIndexRef.current = next.index;
          setFocusIndex(next.index);
          handlePaginationModelChange({
            page: next.page,
            pageSize,
          });
          return;
        }

        selectIndex(next.index);
        return;
      }

      if (rows.length === 0 && key !== "=") return;

      const currentRow =
        selectRows?.[0] || rows[Math.min(focusIndexRef.current, rows.length - 1)];

      if (key === "Home") {
        event.preventDefault();
        selectIndex(0);
      } else if (key === "End") {
        event.preventDefault();
        selectIndex(rows.length - 1);
      } else if (key === "=") {
        event.preventDefault();
        onAdd?.();
      } else if (key === "`") {
        event.preventDefault();
        if (currentRow) onEdit?.(currentRow);
      } else if (key === "Delete") {
        event.preventDefault();
        if (currentRow) onDelete?.(currentRow);
      } else if (key.toLowerCase() === "f" && ctrlKey) {
        event.preventDefault();
        onSelectChange?.([...rows]);
        focusIndexRef.current = 0;
        setFocusIndex(0);
      } else if (key.toLowerCase() === "v" && ctrlKey) {
        event.preventDefault();
        if (currentRow) onDetail?.(currentRow);
      }
    },
    [
      focusIndexRef,
      handlePaginationModelChange,
      hasMore,
      isSearch,
      onAdd,
      onDelete,
      onDetail,
      onEdit,
      onSelectChange,
      paginationModel.page,
      paginationModel.pageSize,
      rows,
      selectIndex,
      selectRows,
      setFocusIndex,
      totalData,
    ],
  );

  const focusGrid = useCallback(() => {
    gridRef.current?.focus();
  }, [gridRef]);

  return {
    handleKeyDown,
    pendingSelectIndexRef,
    selectIndex,
    focusGrid,
  };
}
