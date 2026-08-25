import { useCallback, useEffect, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import { exportPDF } from "../../service/se_shipping_m/seShippingM";
import SdPriceItem from "../../features/setf_120/component/SdPriceItem";
import { fetchSdOM, searchSdOMByFilter } from "../../service/sd_ord_m/sdOrdM";
import { fetchAllSPI } from "../../service/sd_price_item/sdPriceItem";

const Setf120 = () => {
  const [data, setData] = useState([]);
  const [openAddSSD, setOpenAddSSD] = useState(false);
  const [sSDData, setSSDData] = useState([]);
  const [jumpToRowSSD, setJumpToRowSSD] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const theme = useTheme();
  const [selectRows, setSelectRows] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [selectSSD, setSelectSSD] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [searchBasicDataFilter, setSearchBasicDataFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentSSDPageSize, setCurrentSSDPageSize] = useState(10);
  const [currentSSDPage, setCurrentSSDPage] = useState(0);
  const [currentSSDOffset, setCurrentSSDOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [totalSSDData, setTotalSSDData] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAIDMore, setHasAIDMore] = useState(false);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();
  //========== FETCH DATA SECTION ================

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);

    let acInmM;
    [acInmM] = await fnQuery([
      () =>
        fetchSdOM(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          language,
          pageSize,
          offset,
        ),
    ]);

    if (acInmM) {
      setData([
        {
          tableName: "SD_ORD_M",
          data: acInmM.data,
        },
      ]);
      setHasMore(acInmM?.hasMore);
      setSelectRows([acInmM.data[0]]);
      setJumpToRow(acInmM.data[0]);
    }
  };
  //fetch all permisison by user
  const fetchDataByInmNo = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentSSDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentSSDPageSize;
    const response = await fetchAllSPI(
      user?.access_token,
      user?.factory,
      selectRows[0]?.se_id,
      selectRows[0]?.se_ver,
      selectRows[0]?.se_seq,
      user?.department,
      user?.user_code,
      allow,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setSSDData([{ tableName: "SD_PRICE_ITEM", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalSSDData(response.total);
      // }
      setHasAIDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectSSD([childrenData[0]]);
      } else {
        setSelectSSD([]);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "SETF_120",
        "master",
        "sd_ord_m",
      );
      const controls = await fetchTableControlTranslations("SETF_120");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "SETF_120",
      );

      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (auth) setAuthorizations(auth?.data);
      1;
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "cust_id" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "cust_id",
      );
      let response;

      if (hasAIM && !hasOther) {

        if (response && response.data) {
          setData([{ tableName: "SD_ORD_M", data: response.data }]);

          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.cust_id}-${parseFloat(currentSelection.si_seq)}`;
            const foundRecord = response.data.find(
              (item) =>
                `${item.factory_code}-${item.cust_id}-${parseFloat(item.si_seq)}` ===
                currentKey,
            );

            if (foundRecord) {
              setSelectRows([foundRecord]);
              setJumpToRow(foundRecord);
            } else if (response.data.length > 0) {
              setSelectRows([response.data[0]]);
              setJumpToRow(response.data[0]);
            } else {
              setSelectRows([]);
            }
          }
        }
      }
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchSdOM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "SD_ORD_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.cust_id}-${parseFloat(currentSelection.si_seq)}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.cust_id}-${parseFloat(item.si_seq)}` ===
              currentKey,
          );

          if (updatedRecord) {
            setSelectRows([updatedRecord]);
            setJumpToRow(updatedRecord);
          } else if (responseData.data.length > 0) {
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
    }
  };

  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    const init = async () => {
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language]);

  useEffect(() => {
    if (
      !isSearch &&
      selectRows &&
      selectRows.length > 0 &&
      selectRows[0]?.inm_no
    ) {
      fetchDataByInmNo();
    } else {
      setSSDData([{ tableName: "SD_PRICE_ITEM", data: [] }]);
      setSelectSSD([]);
    }
  }, [selectRows?.[0]?.inm_no, isSearch]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================

  //handler search by category
  const handleSearchMaster = async (newFilter, pageSize = 10, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
        setCurrentSSDPage(0);
        setCurrentSSDOffset(0);
      }
      const response = await searchSdOMByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        language,
        pageSize,
        offset,
      );
      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchFilter(newFilter);
        setSearchData([]);
        setData([{ tableName: "SD_ORD_M", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);

        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }

        const airResponse = await fetchAllSPI(
          user?.access_token,
          user?.factory_code,
          response.data[0]?.se_id,
          response.data[0]?.se_ver,
          response.data[0]?.se_seq,
          user.department,
          user.user_code,
          allow,
          language,
          currentSSDPageSize,
          0,
        );
        if (airResponse && airResponse.data) {
          setSSDData([{ tableName: "SD_PRICE_ITEM", data: airResponse.data }]);
          setTotalSSDData(airResponse.total || 0);
          if (airResponse.data.length > 0) {
            setSelectSSD([airResponse.data[0]]);
            setJumpToRowSSD(airResponse.data[0]);
          } else {
            setSelectSSD([]);
            setJumpToRowSSD(null);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "SD_ORD_M", data: [] }]);
        setSelectRows([]);
        setSSDData([{ tableName: "SD_PRICE_ITEM", data: [] }]);
        setSelectSSD([]);
        setTotalData(0);
        setTotalSSDData(0);
        setCurrentOffset(0);
        setCurrentPage(0);
        setCurrentSSDOffset(0);
        setCurrentSSDPage(0);
        setCurrentPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("handleSearchCategory error:", error);
      setIsSearch(false);
      setSearchData([]);
      setData([{ tableName: "SD_ORD_M", data: [] }]);
      setSelectRows([]);
      setSSDData([{ tableName: "SD_PRICE_ITEM", data: [] }]);
      setSelectSSD([]);
    }
  };
  //handler search by filter
  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsSearch(false);
        setSearchData([]);
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setSearchFilter(null);
        setSearchBasicDataFilter(null);
        setSelectRows([]);
        setSSDData([{ tableName: "SD_PRICE_ITEM", data: [] }]);
        setSelectSSD([]);
        setTotalData(0);
        setJumpToRowSSD(null);
        await fetchAll();
        return;
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      await handleSearchMaster(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {
      console.log("cannot search because", error);

      setIsSearch(false);
      setSelectRows([]);

      setSSDData([{ tableName: "SD_PRICE_ITEM", data: [] }]);
      setSelectSSD([]);

      await fetchAll();
    }
  };

  //handler select row permission
  const handleSelectChoose = (rows) => {
    setSelectRows([...rows]);
  };
  //handler export pdf
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    await exportPDF(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      searchFilter?.search,
    );
  };
  //==========END HANDLER SECTION ================

  //========== LABEL TRANSLATION HANDLER ==============

  //handler translation by control ui
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  //handler translation by column table
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
      zh: "_t", // Chinese
      en: "_e", // English
      vi: "_l", // Vietnamese
    };
    return languageMap[language] || "_e";
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    if (isSearch && searchFilter) {
      await handleSearchMaster(searchFilter, newPageSize, newOffset);
      return;
    }
    const responseData = await fetchSdOM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([
      {
        tableName: "SD_ORD_M",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAIDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSSDPage(newPage);
    setCurrentSSDPageSize(newPageSize);
    setCurrentSSDOffset(newOffset);

    await fetchDataByInmNo(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  //========== END LABEL TRANSLATION HANDLER ==============
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;

  return (
    <>
      {/* ========== MAIN CONTENT AREA ========== */}
      <Box>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            {" "}
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box>
                <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"SD_ORD_M"}
                    selectRows={selectRows}
                    onSelectChange={handleSelectChoose}
                    onSearch={handleSearchByFilter}
                    onPDF={handlePDF}
                    isSearch={isSearch}
                    searchData={searchData}
                    columnTranslations={columnTranslations}
                    controlTranslations={controlTranslations}
                    language={language}
                    getControlLabel={getControlLabel}
                    getColumnLabel={getColumnLabel}
                    jumpToRow={jumpToRow}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                    currentPageSize={currentPageSize}
                    totalData={totalData}
                    hasMore={hasMore}
                  />
                </Box>
                <Box>
                  <SdPriceItem
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    parentSelectRows={selectRows.length > 0 ? selectRows : []}
                    isSearch={isSearch}
                    searchData={searchData}
                    data={sSDData}
                    setData={setSSDData}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    setSelectSSD={setSelectSSD}
                    selectSSD={selectSSD}
                    jumpToRow={jumpToRowSSD}
                    setJumpToRow={setJumpToRowSSD}
                    user={user}
                    currentPage={currentSSDPage}
                    setCurrentPage={setCurrentSSDPage}
                    currentPageSize={currentSSDPageSize}
                    setCurrentPageSize={setCurrentSSDPageSize}
                    currentOffset={currentSSDOffset}
                    setCurrentOffset={setCurrentSSDOffset}
                    searchBasicDataFilter={searchBasicDataFilter}
                    fetchDataByInmNo={fetchDataByInmNo}
                    totalData={totalSSDData}
                    setTotalData={setTotalSSDData}
                    handlePageChange={handleAIDPageChange}
                    hasMore={hasAIDMore}
                    setHasMore={setHasAIDMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Setf120;
