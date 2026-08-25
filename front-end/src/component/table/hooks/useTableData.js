import { useEffect, useMemo, useRef, useState } from "react";

export const getStatusText = (status) => {
  const value = String(status ?? "");

  switch (value) {
    case "0":
      return "Cancel-0";
    case "1":
      return "New-1";
    case "2":
      return "Checked-2";
    case "7":
      return "Confirm-7";
    case "9":
      return "Close-9";
    default:
      return status;
  }
};

export default function useTableData(data = []) {
  const [tableData, setTableData] = useState(Array.isArray(data) ? data : []);
  const prevDataRef = useRef(data);

  useEffect(() => {
    if (prevDataRef.current === data) return;

    setTableData(Array.isArray(data) ? [...data] : []);
    prevDataRef.current = data;
  }, [data]);

  const rows = useMemo(
    () =>
      tableData.map((row) =>
        row
          ? {
              ...row,
              statusText: getStatusText(row.status),
            }
          : row,
      ),
    [tableData],
  );

  return {
    tableData,
    setTableData,
    rows,
  };
}
