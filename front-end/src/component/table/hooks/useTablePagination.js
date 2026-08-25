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

const isSamePaginationModel = (left, right) =>
  left?.page === right?.page && left?.pageSize === right?.pageSize;

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
  const paginationModelRef = useRef(initialModel);
  const focusTimerRef = useRef(null);

  useEffect(() => {
    paginationModelRef.current = paginationModel;
  }, [paginationModel]);

  useEffect(() => {
    if (currentPage === undefined) return;

    const nextModel = {
      page: currentPage,
      pageSize: currentPageSize ?? paginationModelRef.current.pageSize,
    };

    if (isSamePaginationModel(paginationModelRef.current, nextModel)) return;

    paginationModelRef.current = nextModel;
    currentPageRef.current = nextModel.page;
    setPaginationModel(nextModel);
    setPageSize((prev) =>
      prev === nextModel.pageSize ? prev : nextModel.pageSize,
    );
  }, [currentPage, currentPageSize]);

  useEffect(
    () => () => {
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
      }
    },
    [],
  );

  const handlePaginationModelChange = useCallback(
    (model) => {
      const previousModel = paginationModelRef.current;
      if (isSamePaginationModel(previousModel, model)) return;

      paginationModelRef.current = model;
      currentPageRef.current = model.page;
      setIsPaginationChanging(true);
      setPaginationModel(model);
      setPageSize((prev) => (prev === model.pageSize ? prev : model.pageSize));

      if (model.page !== previousModel.page) {
        setFocusIndex(0);
        focusIndexRef.current = 0;
      }

      onPageChange?.(model.page, model.pageSize);

      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
      }

      focusTimerRef.current = window.setTimeout(() => {
        gridRef.current?.focus();
        setIsPaginationChanging(false);
      }, 150);
    },
    [focusIndexRef, gridRef, onPageChange, setFocusIndex],
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
