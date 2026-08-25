import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
const VwAcIssueT = ({
  data,
  setData,
  setSelectVAIT,
  selectVAIT,
  isSearch = false,
  selectRows,
  searchData,
  fetchDataByConfSeqWithVAIT,
  setJumpToRow,
  jumpToRow,
  totalData,
  onPageChange,
  currentOffset,
  currentPage,
  currentPageSize,
  setCurrentPage,
  setCurrentOffset,
  setCurrentPageSize,
  hasMore,
  setHasMore,
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
  const { user } = useAuth();

  const fetchAllTranslations = async () => {
    try {
      const [controls] = await fnQuery([
        () => fetchTableControlTranslations("ACTF_240"),
      ]);
      if (controls) {
        setColumnTranslations(controls?.data);
      }
      if (controls) {
        setControlTranslations(controls?.data);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.conf_seq
      ) {
        setData([{ tableName: "VW_AC_ISSUE_T", data: [] }]);
        setSelectVAIT([]);
        return;
      }
      setCurrentPage(0);
      setCurrentOffset(0);
      setCurrentPageSize(10);
      await fetchDataByConfSeqWithVAIT(true, 0, 10);
    };
    handleDataFetch();
  }, [selectRows?.[0]?.factory_code, selectRows?.[0]?.conf_seq]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleSelectChoose = (rows) => {
    setSelectVAIT(rows);
  };
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
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  return (
    <>
      <Box>
        <Stack
          direction="row"
          flexWrap="wrap"
          sx={{ rowGap: 1, width: "100%" }}
        >
          <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <DataTable
              data={data[0]?.data}
              tableName={"VW_AC_ISSUE_T"}
              selectRows={selectVAIT}
              onSelectChange={handleSelectChoose}
              columnTranslations={columnTranslations}
              controlTranslations={controlTranslations}
              language={language}
              getControlLabel={getControlLabel}
              getColumnLabel={getColumnLabel}
              isSubTable={true}
              totalData={totalData || 0}
              onPageChange={onPageChange}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              hasMore={hasMore}
              setHasMore={setHasMore}
              isToolbar={false}
            />
          </div>
        </Stack>
      </Box>
    </>
  );
};
export default VwAcIssueT;
