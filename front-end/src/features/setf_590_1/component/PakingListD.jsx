import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
const PakingListD = ({
  jumpToRow,
  setJumpToRow,
  data = [],
  setData,
  setSelectSSD,
  selectSSD = [],
  selectRows = [],
  currentPage,
  setCurrentPage,
  currentPageSize,
  setCurrentPageSize,
  setCurrentOffset,
  fetchDataByInmNo,
  totalData,
  handlePageChange,
  hasMore,
}) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();

  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "SETF_590",
            "detail",
            "paking_list_m",
            "PAKING_LIST_D",
          ),
        () => fetchTableControlTranslations("SETF_590"),
      ]);
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };

  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //selectRows
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.org_id ||
        !selectRows[0]?.se_id ||
        !selectRows[0]?.se_ver ||
        !selectRows[0]?.se_seq ||
        !selectRows[0]?.pack_gu ||
        !selectRows[0]?.ship_seq
      ) {
        setData([{ tableName: "PAKING_LIST_D", data: [] }]);
        setSelectSSD([]);
        return;
      }
      setCurrentPage(0);
      setCurrentOffset(0);
      setCurrentPageSize(10);
      await fetchDataByInmNo(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.org_id,
    selectRows?.[0]?.se_id,
    selectRows?.[0]?.se_ver,
    selectRows[0]?.se_seq,
    selectRows[0]?.pack_gu,
    selectRows[0]?.ship_seq,
  ]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };

  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  const mapLanguageToColumn = (language) => {
    const languageMap = {
      zh: "_t",
      en: "_e",
      vi: "_l",
    };

    return languageMap[language] || "_e";
  };
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
  return (
    <>
      <Box>
        <DataTable
          data={data[0]?.data}
          tableName={"PAKING_LIST_D"}
          selectRows={selectSSD}
          onSelectChange={setSelectSSD}
          columnTranslations={columnTranslations}
          controlTranslations={controlTranslations}
          language={language}
          getControlLabel={getControlLabel}
          getColumnLabel={getColumnLabel}
          jumpToRow={jumpToRow}
          isSubTable={true}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          currentPageSize={currentPageSize}
          totalData={totalData || 0}
          hasMore={hasMore}
          isToolbar={false}
        />
      </Box>
    </>
  );
};
export default PakingListD;
