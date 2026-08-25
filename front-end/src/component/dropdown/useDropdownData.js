import { useEffect, useMemo, useState } from "react";

export default function useDropdownData({
  data,
  onFetchData,
  table,
  currentPage,
  pageSize,
  searchText,
  isOpen,
  totalItems,
}) {
  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState(Array.isArray(data) ? data : []);
  const [apiTotalItems, setApiTotalItems] = useState(totalItems || 0);
  const [apiPageSize, setApiPageSize] = useState(pageSize);

  const enableApiSearch = Boolean(onFetchData);

  useEffect(() => {
    if (!onFetchData && data) {
      setLocalData(Array.isArray(data) ? data : []);
    }
  }, [data, onFetchData]);

  useEffect(() => {
    if (!isOpen || !onFetchData) return undefined;

    let active = true;
    setLoading(true);

    const request =
      table === "AC_VEND_BASE_2"
        ? onFetchData()
        : onFetchData(currentPage, apiPageSize, searchText);

    Promise.resolve(request)
      .then((result) => {
        if (!active) return;
        const responseData = result?.data?.data || result?.data || result || [];
        const responseTotal = result?.data?.total ?? result?.total ?? 0;
        const responsePageSize = result?.data?.pageSize ?? apiPageSize;

        setLocalData(Array.isArray(responseData) ? responseData : []);
        setApiTotalItems(Number.parseInt(responseTotal, 10) || 0);
        setApiPageSize(Number.parseInt(responsePageSize, 10) || pageSize);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Error fetching dropdown data:", error);
        setLocalData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentPage, isOpen, onFetchData, apiPageSize, searchText, table, pageSize]);

  return useMemo(
    () => ({
      loading,
      localData,
      apiTotalItems,
      apiPageSize,
      setApiPageSize,
      enableApiSearch,
    }),
    [loading, localData, apiTotalItems, apiPageSize, enableApiSearch],
  );
}
