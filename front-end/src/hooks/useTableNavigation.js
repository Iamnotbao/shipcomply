import { useCallback } from 'react';

/**
 * Handle table navigation with arrow keys, Home, and End
 * Automatically handles page changes when navigating beyond current page
 * 
 * @param {Object} params - Navigation parameters
 * @param {Array} params.data - Current page data
 * @param {Object} params.selectedRow - Currently selected row
 * @param {number} params.page - Current page number
 * @param {number} params.pageSize - Page size
 * @param {number} params.totalRows - Total number of rows
 * @param {Function} params.onPageChange - Page change handler
 * @param {Function} params.onRowSelect - Row selection handler
 * @param {Function} params.getRowId - Function to get row ID
 * @returns {Object} Navigation handlers
 */
export const useTableNavigation = ({
  data = [],
  selectedRow,
  page = 0,
  pageSize = 10,
  totalRows = 0,
  onPageChange,
  onRowSelect,
  getRowId,
}) => {
  const totalPages = Math.ceil(totalRows / pageSize);

  /**
   * Navigate to next row (Arrow Down)
   */
  const handleArrowDown = useCallback(() => {
    if (!data || data.length === 0) return;

    if (!selectedRow) {
      // No selection, select first row
      onRowSelect(data[0]);
      return;
    }

    const currentIndex = data.findIndex(
      (row) => getRowId(row) === getRowId(selectedRow)
    );

    if (currentIndex === -1) {
      // Current row not found, select first
      onRowSelect(data[0]);
      return;
    }

    if (currentIndex < data.length - 1) {
      // Move to next row in current page
      onRowSelect(data[currentIndex + 1]);
    } else if (page < totalPages - 1) {
      // At last row, move to next page
      onPageChange(page + 1);
      // Note: Parent component should handle selecting first row of new page
    }
  }, [data, selectedRow, page, totalPages, onPageChange, onRowSelect, getRowId]);

  /**
   * Navigate to previous row (Arrow Up)
   */
  const handleArrowUp = useCallback(() => {
    if (!data || data.length === 0) return;

    if (!selectedRow) {
      // No selection, select last row
      onRowSelect(data[data.length - 1]);
      return;
    }

    const currentIndex = data.findIndex(
      (row) => getRowId(row) === getRowId(selectedRow)
    );

    if (currentIndex === -1) {
      // Current row not found, select last
      onRowSelect(data[data.length - 1]);
      return;
    }

    if (currentIndex > 0) {
      // Move to previous row in current page
      onRowSelect(data[currentIndex - 1]);
    } else if (page > 0) {
      // At first row, move to previous page
      onPageChange(page - 1);
      // Note: Parent component should handle selecting last row of new page
    }
  }, [data, selectedRow, page, onPageChange, onRowSelect, getRowId]);

  /**
   * Jump to first row (Home)
   */
  const handleHome = useCallback(() => {
    if (!data || data.length === 0) return;

    // Go to first page and select first row
    if (page !== 0) {
      onPageChange(0);
      // Note: Parent component should handle selecting first row
    } else {
      onRowSelect(data[0]);
    }
  }, [data, page, onPageChange, onRowSelect]);

  /**
   * Jump to last row (End)
   */
  const handleEnd = useCallback(() => {
    if (!data || data.length === 0) return;

    // Go to last page and select last row
    const lastPage = totalPages - 1;
    if (page !== lastPage) {
      onPageChange(lastPage);
      // Note: Parent component should handle selecting last row
    } else {
      onRowSelect(data[data.length - 1]);
    }
  }, [data, page, totalPages, onPageChange, onRowSelect]);

  /**
   * Navigate to specific row index (0-based, relative to current page)
   */
  const navigateToIndex = useCallback((index) => {
    if (!data || data.length === 0) return;
    
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onRowSelect(data[clampedIndex]);
  }, [data, onRowSelect]);

  return {
    handleArrowDown,
    handleArrowUp,
    handleHome,
    handleEnd,
    navigateToIndex,
  };
};
