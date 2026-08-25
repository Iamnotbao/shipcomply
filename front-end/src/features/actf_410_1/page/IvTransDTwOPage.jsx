import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { fnQuery } from "../../../utils/fnQuery";

const IvDTransDTwOPage = ({
  openImport = false,
  data,
  setData,
  getColumnLabel,
  getControlLabel,
  selectIvTransDTwO,
  selectRows,
  fetchIvDTransDTwOByvwAcSrcorder,
  language,
  onSelectIvTransDTw,
  total,
  onRightCheck,
  onCheckboxChange,
  checkboxSelections,
  onCheckIvDTransDTwO,
  selectionsVersion,
  onCustomsSelection,
  customSelections,
  onConfirmAll,
  currentPage,
  currentPageSize,
  currentOffset,
  totalData,
  hasMore,
  setHasMore
}) => {
  const [jumpToRow, setJumpToRow] = useState(null);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const { fetchTableControlTranslations, fetchTableColumnTranslations } =
    useColumnTranslation();
  // 1️⃣ Fetch data when parent changes
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.order_no ||
        !selectRows[0]?.order_seq
      ) {
        onCustomsSelection([]);
        setData([]);
        return;
      }
      await fetchIvDTransDTwOByvwAcSrcorder();
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.order_no,
    selectRows?.[0]?.order_seq,
  ]);
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_410",
            "detail",
            "ac_req_m",
            "IV_TRANS_D_TW",
          ),
        () => fetchTableControlTranslations("ACTF_410"),
      ]);
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      if (controls) {
        setControlTranslations(controls?.data);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  useEffect(() => {
    if (openImport) {
      fetchAllTranslations();
    }
  }, [openImport]);
  // 2️⃣ Restore selections AFTER data is loaded
  useEffect(() => {
    if (!data || data.length === 0) {
      console.log(" No data, clearing selections");
      onCustomsSelection([]);
      return;
    }

    if (!selectRows || selectRows.length === 0) {
      console.log(" No selectRows");
      onCustomsSelection([]);
      return;
    }

    const rowKey = `${selectRows[0].factory_code}-${selectRows[0].id}`;
    const savedSelections = checkboxSelections?.get(rowKey);

    console.log(`🔍 Restoring for ${rowKey}:`, savedSelections);

    if (savedSelections && savedSelections.length > 0) {
      onCustomsSelection(savedSelections);
    } else {
      console.log("📭 No saved selections");
      onCustomsSelection([]);
    }
  }, [
    data?.length,
    selectRows?.[0]?.id,
    checkboxSelections,
    selectionsVersion,
  ]);

  //  Handler cho custom checkbox
  const handleCustomCheckboxChange = (item, isChecked) => {
    let newSelections;

    if (isChecked) {
      //  Lưu object thay vì ID
      newSelections = [...customSelections, item];
    } else {
      //  Xóa object bằng cách so sánh ID
      const itemId = `${item.factory_code}-${item.trans_no}-${item.trans_seq}`;
      newSelections = customSelections.filter((sel) => {
        const selId = `${sel.factory_code}-${sel.trans_no}-${sel.trans_seq}`;
        return selId !== itemId;
      });
    }

    console.log(" Updated selections (objects):", newSelections);
    onCustomsSelection(newSelections); //  Array of objects

    // Không cần convert, đã là objects rồi
    if (onCheckIvDTransDTwO) {
      onCheckIvDTransDTwO(newSelections);
    }

    if (onCheckboxChange) {
      onCheckboxChange(newSelections);
    }

    if (onRightCheck) {
      onRightCheck(newSelections);
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      //  Lưu toàn bộ objects
      onCustomsSelection([...data]);

      if (onCheckboxChange) {
        onCheckboxChange(data);
      }
      if (onRightCheck) {
        onRightCheck(data);
      }
    } else {
      onCustomsSelection([]);
      if (onCheckboxChange) {
        onCheckboxChange([]);
      }
      if (onRightCheck) {
        onRightCheck([]);
      }
    }
  };

  const handleSelectionChange = (rows) => {
    if (onSelectIvTransDTw) {
      onSelectIvTransDTw(rows);
    }
  };

  const parentKey = selectRows?.[0]
    ? `${selectRows[0].factory_code}-${selectRows[0].order_no}-${selectRows[0].order_seq}`
    : "no-parent";

  return (
    <DataTable
      key={parentKey}
      data={data}
      tableName={"IV_TRANS_D_TW"}
      selectRows={selectIvTransDTwO}
      columnTranslations={columnTranslations}
      controlTranslations={controlTranslations}
      language={language}
      getControlLabel={getControlLabel}
      getColumnLabel={getColumnLabel}
      jumpToRow={jumpToRow}
      checkboxSelection={false} //  TẮT built-in checkbox
      customCheckboxColumn={true} //  BẬT custom checkbox
      customSelections={customSelections} //  Pass selections
      onCustomCheckboxChange={handleCustomCheckboxChange}
      onCustomSelectAll={handleSelectAll}
      onSelectionChange={handleSelectionChange}
      total={total}
      onSelectChange={onSelectIvTransDTw}
      disableRowSelectionOnClick={true}
      onConfirmAll={onConfirmAll}
      currentPage={currentPage}
      currentPageSize={currentPageSize}
      totalData={totalData}
      hasMore={hasMore}
    />
  );
};

export default IvDTransDTwOPage;
