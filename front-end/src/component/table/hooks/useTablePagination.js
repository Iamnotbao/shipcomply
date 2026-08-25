import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDefaultPageSize } from "../../../constants/table";

const normalizeTableName = (title) =>
  title === "PERMISSION" ? "USER_PERMISSION_DEPARTMENT" : title;

const getInitialPaginationModel = ({
  title,
  tableName,
  currentPage,
  currentPageSize,
}) => {
  if (tableName === "AC_ITEM_M") {
    return {
      page: currentPage ?? 0,
      pageSize:
        currentPageSize ?? getDefaultPageSize(normalizeTableName(title)),
    };
  }

  return {
    page: 0,
    pageSize: getDefaultPageSize(normalizeTableName(title)),
  };
};

export default function useTablePagination({
  title,
  tableName,
  currentPage,
  currentPageSize,
  onPageChange,
  gridRef,
  focusIndexRef,
  setFocusIndex,
}) {
  const initialModel = useMemo(
    () =>
      getInitialPaginationModel({
        title,
        tableName,
        currentPage,
        currentPageSize,
      }),
    [title, tableName, currentPage, currentPageSize],
  );

  const [paginationModel, setPaginationModel] = useState(initialModel);
  const [pageSize, setPageSize] = useState(initialModel.pageSize);
  const [isPaginationChanging, setIsPaginationChanging] = useState(false);
  const currentPageRef = useRef(initialModel.page);

  useEffect(() => {
    if (currentPage === undefined) return;
    setPaginationModel((prev) => ({
      page: currentPage,
      pageSize: currentPageSize ?? prev.pageSize,
    }));
  }, [currentPage, currentPageSize]);

  useEffect(() => {
    if (!isPaginationChanging) return undefined;

    const timer = window.setTimeout(() => {
      gridRef.current?.focus();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [gridRef, isPaginationChanging, paginationModel.page]);

  const handlePaginationModelChange = useCallback(
    (model) => {
      currentPageRef.current = model.page;
      setIsPaginationChanging(true);
      setPaginationModel(model);
      setPageSize(model.pageSize);

      if (model.page !== paginationModel.page && !isPaginationChanging) {
        setFocusIndex(0);
        focusIndexRef.current = 0;
      }

      onPageChange?.(model.page, model.pageSize);

      window.setTimeout(() => {
        gridRef.current?.focus();
        setIsPaginationChanging(false);
      }, 150);
    },
    [
      focusIndexRef,
      gridRef,
      isPaginationChanging,
      onPageChange,
      paginationModel.page,
      setFocusIndex,
    ],
  );

  return {
    paginationModel,
    setPaginationModel,
    pageSize,
    setPageSize,
    isPaginationChanging,
    setIsPaginationChanging,
    currentPageRef,
    handlePaginationModelChange,
  };
}
