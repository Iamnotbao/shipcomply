import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
const VwAcReqD = ({
  data,
  setData,
  setSelectVwAcReqD,
  selectVwAcReqD,
  isSearch = false,
  selectRows,
  searchData,
  fetchDataByComInvoice,
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
        () => fetchTableControlTranslations("ACTF_210"),
      ]);
      if (controls) {
        setColumnTranslations(columns?.data);
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
        !selectRows[0]?.ac_no
      ) {
        setData([{ tableName: "VW_ACREQ_D", data: [] }]);
        setSelectVwAcReqD([]);
        return;
      }
      setCurrentPage(0);
      setCurrentOffset(0);
      setCurrentPageSize(10);
      await fetchDataByComInvoice(true, 0, 10);
    };
    handleDataFetch();
  }, [selectRows?.[0]?.factory_code, selectRows?.[0]?.ac_no]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleSelectChoose = (rows) => {
    setSelectVwAcReqD(rows);
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
              tableName={"VW_ACREQ_D"}
              selectRows={selectVwAcReqD}
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
            />
          </div>
        </Stack>
      </Box>
    </>
  );
};
export default VwAcReqD;
