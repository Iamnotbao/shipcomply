import { useState, useCallback } from 'react';

/**
 * Handle row selection state and logic
 * Supports both single and multiple selection modes
 * 
 * @param {boolean} multiSelect - Enable multiple selection
 * @returns {Object} Selection state and handlers
 */
export const useRowSelection = (multiSelect = false) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelect = useCallback((row) => {
    setSelectedRow(row);
  }, []);

  const handleRowsSelect = useCallback((rows) => {
    setSelectedRows(rows);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRow(null);
    setSelectedRows([]);
  }, []);

  const isRowSelected = useCallback((row, getRowId) => {
    if (!row) return false;
    
    if (multiSelect) {
      return selectedRows.some(r => getRowId(r) === getRowId(row));
    }
    
    return selectedRow && getRowId(selectedRow) === getRowId(row);
  }, [multiSelect, selectedRow, selectedRows]);

  const toggleRowSelection = useCallback((row, getRowId) => {
    if (!multiSelect) {
      setSelectedRow(row);
      return;
    }

    const rowId = getRowId(row);
    const isSelected = selectedRows.some(r => getRowId(r) === rowId);
    
    if (isSelected) {
      setSelectedRows(selectedRows.filter(r => getRowId(r) !== rowId));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  }, [multiSelect, selectedRows]);

  const selectAll = useCallback((rows) => {
    if (!multiSelect) return;
    setSelectedRows([...rows]);
  }, [multiSelect]);

  return {
    selectedRow,
    selectedRows,
    setSelectedRow: handleRowSelect,
    setSelectedRows: handleRowsSelect,
    clearSelection,
    isRowSelected,
    toggleRowSelection,
    selectAll,
  };
};
