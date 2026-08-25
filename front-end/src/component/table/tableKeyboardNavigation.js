export const getTotalPagesForNavigation = ({
  isSearch,
  totalData,
  hasMore,
  currentPage,
  pageSize,
  localLength,
}) => {
  if (isSearch && totalData > 0) {
    return Math.ceil(totalData / pageSize);
  }

  if (hasMore) {
    return currentPage + 2;
  }

  return Math.ceil((totalData || localLength) / pageSize);
};

export const getNextRowNavigation = ({
  key,
  currentIndex,
  localLength,
  currentPage,
  pageSize,
  totalPages,
}) => {
  if (localLength === 0) return null;

  if (key === "ArrowDown") {
    if (currentIndex < localLength - 1) {
      return {
        index: currentIndex + 1,
        page: currentPage,
        changePage: false,
      };
    }

    if (currentPage < totalPages - 1) {
      return {
        index: 0,
        page: currentPage + 1,
        changePage: true,
      };
    }

    return null;
  }

  if (key === "ArrowUp") {
    if (currentIndex > 0) {
      return {
        index: currentIndex - 1,
        page: currentPage,
        changePage: false,
      };
    }

    if (currentPage > 0) {
      return {
        index: Math.max(pageSize - 1, 0),
        page: currentPage - 1,
        changePage: true,
      };
    }
  }

  return null;
};

export const getNextListIndex = ({ key, currentIndex, length }) => {
  if (length <= 0) return -1;

  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;

  if (key === "ArrowDown") {
    return Math.min(safeCurrentIndex + 1, length - 1);
  }

  if (key === "ArrowUp") {
    return Math.max(safeCurrentIndex - 1, 0);
  }

  return safeCurrentIndex;
};
