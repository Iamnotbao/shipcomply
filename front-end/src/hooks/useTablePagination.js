import { useState, useCallback, useEffect } from 'react';
import { getDefaultPageSize } from '../constants/table';

/**
 * Handle table pagination state and logic
 * 
 * @param {string} tableName - Name of the table
 * @param {number} initialPage - Initial page number (0-indexed)
 * @returns {Object} Pagination state and handlers
 */
export const useTablePagination = (tableName, initialPage = 0) => {
  const defaultPageSize = getDefaultPageSize(tableName);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset page when table changes
  useEffect(() => {
    setPage(0);
    setPageSize(getDefaultPageSize(tableName));
  }, [tableName]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when page size changes
  }, []);

  const getTotalPages = useCallback((totalRows) => {
    return Math.ceil(totalRows / pageSize);
  }, [pageSize]);

  const hasNextPage = useCallback((totalRows) => {
    return page < getTotalPages(totalRows) - 1;
  }, [page, getTotalPages]);

  const hasPreviousPage = useCallback(() => {
    return page > 0;
  }, [page]);

  const goToNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(0, prev - 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  const goToLastPage = useCallback((totalRows) => {
    setPage(getTotalPages(totalRows) - 1);
  }, [getTotalPages]);

  return {
    page,
    pageSize,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    getTotalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  };
};
