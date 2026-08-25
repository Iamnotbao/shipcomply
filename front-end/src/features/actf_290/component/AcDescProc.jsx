import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import { exportExcelVwApDueAll } from "../../../service/vw_apdue_all/vwApdueAll";
const AcDescProc = ({
  data,
  setData,
  setSelectADP,
  selectADP,
  isSearch = false,
  selectRows,
  handleSearchByAcProdM,
  searchData,
  fetchDataByAcNo,
  totalData,
  onPageChange,
  currentPage,
  currentPageSize,
  setCurrentPage,
  setCurrentOffset,
  setCurrentPageSize,
  subAuthentication,
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
        () => fetchTableControlTranslations("ACTF_290"),
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
        !selectRows[0]?.ac_no
      ) {
        setData([{ tableName: "VW_APDUE_ALL", data: [] }]);
        setSelectADP([]);
        return;
      }
      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (!isSearch) {
        setCurrentPage(0);
        setCurrentOffset(0);
        setCurrentPageSize(10);
        await fetchDataByAcNo(true, 0, 10);
      }
    };
    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.ac_no,
    isSearch,
    searchData.length,
  ]);

  const handleSelectChoose = (rows) => {
    setSelectADP(rows);
  };
  const handlePDF = async () => {
    await exportExcelVwApDueAll(
      selectRows?.[0]?.factory_code,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      language,
    );
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
            <Typography variant="h5" textAlign={"center"} fontWeight={"bold"}>
           {/*    {getControlLabel("ttl_table_d_2", "VW_APDUE_ALL")} */}
            </Typography>
            <DataTable
              data={data[0]?.data}
              tableName={"VW_APDUE_ALL"}
              selectRows={selectADP}
              onSelectChange={handleSelectChoose}
              onSearch={handleSearchByAcProdM}
              onPDF={handlePDF}
              columnTranslations={columnTranslations}
              controlTranslations={controlTranslations}
              language={language}
              getControlLabel={getControlLabel}
              getColumnLabel={getColumnLabel}
              onPageChange={onPageChange}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              hasMore={hasMore}
            />
          </div>
        </Stack>
      </Box>
    </>
  );
};
export default AcDescProc;
