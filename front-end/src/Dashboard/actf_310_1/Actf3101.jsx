import { useEffect, useRef, useState } from "react";
import DataTable from "../../component/table/DataTable";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/notification/Notification";
import { fetchAcItemRefByID } from "../../service/ac_item_ref/AcItemRefService";
import {
  exportAcSrcorderMExcel,
  searchAcSrcorderMByFilter,
} from "../../service/ac_srcorder_m/AcSrcorderMService";
import {
  fetchAllAcReqOrderById,
  fetchAllAcReqOrderByReqNo,
} from "../../service/ac_req_order/AcReqOrder";
import {
  exportExcelOutVwAcChgSum,
  fetchVwAcChgSum,
  restoreS,
  searchVwAcChgSumByFilter,
  updateQty,
  verifyRemain,
} from "../../service/vw_ac_chgsum/vwAcChgSum";
import { fetchGroupFieldDropdown } from "../../service/vw_cont_imp/VwContImpService";
import { fetchFieldDropdown } from "../../service/vw_ac_chg/vwAcChg";
import VerifyRemainPopup from "../../features/actf_310_1/page/VerifyRemainPopup";
import { exportExcel, fetchVwAcChkT } from "../../service/vw_ac_chk_t/vwAcChkT";
import VwAcChkT from "../../features/actf_310_1/component/vwAcChkT";

const Actf3101 = () => {
  const [data, setData] = useState([]);
  const [vwAcChkTData, setVwAcChkTData] = useState([]);
  const [selectVACT, setSelectVACT] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [selectRows, setSelectRows] = useState([]);
  const [selectRowsVACT, setSelectRowsVACT] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumpToRowVACT, setJumpToRowVACT] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [openExportPopup, setOpenExportPopup] = useState(false);
  const [openVerifyRemain, setOpenVerifyRemain] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [currentVwAcSrcorderPage, setCurrentVwAcSrcorderPage] = useState(0);
  const [currentVwAcSrcorderPageSize, setCurrentVwAcSrcorderPageSize] =
    useState(5);
  const [currentVACTOffset, setCurrentVACTOffset] = useState(0);
  const [totalVACTData, setTotalVACTData] = useState(0);
  const [currentVACTPage, setCurrentVACTPage] = useState(0);
  const [currentVACTPageSize, setCurrentVACTPageSize] = useState(10);
  const [currentVwAcSrcorderOffset, setCurrentVwAcSrcorderOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasVACTMore, setHasVACTMore] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({});
  const toolbarRef = useRef(null);
  const [messageVC, setMessageVC] = useState("");
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();

  const fetchAll = async (authData = null, pageSize = 10, offset = 0) => {
    const authToUse = authData || authorization;
    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;


    setCurrentVwAcSrcorderPage(0);
    setCurrentVwAcSrcorderPageSize(pageSize);
    setCurrentVwAcSrcorderOffset(0);

    let basicData;
    [basicData] = await fnQuery([
      () =>
        fetchVwAcChgSum(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          language,
          pageSize,
          offset,
        ),
    ]);

    if (basicData) {
      if (basicData.total !== undefined && basicData.total !== null) {
        setTotalData(basicData.total);
      }

      setData([
        {
          tableName: "VW_AC_CHGSUM",
          data: basicData.data || [],
        },
      ]);
      setHasMore(basicData?.hasMore);
      if (basicData.data && basicData.data.length > 0) {
        setSelectRows([basicData.data[0]]);
        setJumpToRow(basicData.data[0]);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const controls = await fetchTableControlTranslations("ACTF_310");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_3101",
      );
      if (controls) setColumnTranslations(controls?.data);
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

  const fetchDataByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentVACTOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentVACTPageSize;
    const response = await fetchVwAcChkT(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      selectRows[0]?.ac_no,
      selectRows[0]?.ac_itemno,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setVwAcChkTData([{ tableName: "VW_AC_CHK_T", data: childrenData }]);
      if (response.total !== undefined && response.total !== null) {
        setTotalVACTData(response.total);
      }
      if (childrenData.length > 0) {
        setSelectVACT([childrenData[0]]);
      } else {
        setSelectVACT([]);
      }
    }
  };
  const fetchAcItemRefRecordFromDB = async (record) => {
    try {
      const response = await fetchAcItemRefByID(
        record?.factory_code,
        record?.item_acno,
        record?.item_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
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
    if (jumpToRow && jumpToRowVACT) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
        setJumpToRowVACT(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow, jumpToRowVACT]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================

  //handler toggle query permission
  const handleSelectQuery = async (row, value) => {
    const updateRow = {
      ...row,
      query_level: value,
    };
    await handleEdit(updateRow);
  };

  //handler search by code
  const handleSearch = async (newFilter, pageSize = 10, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentVwAcSrcorderPage(0);
        setCurrentVwAcSrcorderPageSize(pageSize);
        setCurrentVwAcSrcorderOffset(0);
      }
      const response = await searchVwAcChgSumByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );

      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchData(response.data);
        setData([{ tableName: "VW_AC_CHGSUM", data: response.data }]);
        setSelectRows([response.data[0]]);
        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([]);
        setSelectRows([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setIsSearch(false);
      setSearchData([]);
      setSelectRows([]);
      await fetchAll();
    }
  };

  const handleExportOpen = async (filters = {}) => {
    setSearchFilter(filters);
    setOpenExportPopup(true);
  };
  const handleExportClose = () => {
    setOpenExportPopup(false);
  };
  const handleOpenVerifyRemain = async () => {
    try {
      const result = await verifyRemain(
        user?.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.ac_itemno,
        language,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_verify_remain",
          result?.message,
        );
      } else if (result && !result?.success) {
        showErrorToast(
          getControlLabel,
          "noti_failed_verify_remain_1",
          result?.message,
        );
        setMessageVC(result?.message || "Verification failed");
        setOpenVerifyRemain(true);
      }
    } catch (error) {
      console.log("This hass been error in remain verify", error);
      showErrorToast(
        getControlLabel,
        "noti_failed_verify_remain_2",
        error?.message,
      );
    }
  };
  const handleCloseVerifyRemain = () => {
    setOpenVerifyRemain(false);
  };

  const handleOutExcel = async () => {
    try {
      const result = await exportExcelOutVwAcChgSum(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        searchFilter?.search,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_excel`,
          "Export excel successfully",
        );
      }
    } catch (error) {
      console.log("the error", error);
      showErrorToast(
        getControlLabel,
        `noti_failed_excel`,
        "Export excel failed",
      );
    }
  };
  const handleExcel = async () => {
    try {
      const result = await exportExcel(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        selectRows[0]?.ac_no,
        selectRows[0]?.ac_itemno,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_excel`,
          "Export excel successfully",
        );
      }
    } catch (error) {
      console.log("the error", error);
      showErrorToast(
        getControlLabel,
        `noti_failed_excel`,
        "Export excel failed",
      );
    }
  };
  const handleRestoreStatus = async () => {
    try {
      const result = await restoreS(
        user?.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.src,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_restore`,
          result?.message,
        );
        await fetchAll();
      }
    } catch (error) {
      console.log("the error", error);
      showErrorToast(getControlLabel, `noti_fail_restore`, error?.message);
    }
  };
  const handleUpdateQty = async () => {
    try {
      const result = await updateQty(
        user?.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.ac_itemno,
        selectRows[0]?.qty,
        selectRows[0]?.over_qty,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_update_qty`,
          "Update qty successfully",
        );
      }
    } catch (error) {
      console.log("the error", error);
      showErrorToast(
        getControlLabel,
        `noti_failed_update_qty`,
        "Failed update qty",
      );
    }
  };
  //handler search by category
  const handleSearchAcSrcorderM = async (
    newFilter,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentVwAcSrcorderPage(0);
        setCurrentVwAcSrcorderPageSize(pageSize);
        setCurrentVwAcSrcorderOffset(0);
      }

      const response = await searchAcSrcorderMByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );

      if (response) {
        setIsSearch(true);
        setSearchData([]);
        setTotalData(response.total);
        setData([{ tableName: "VW_AC_CHGSUM", data: response.data }]);

        if (response.data.length > 0) {
          setSelectRows([response.data[0]]);
          setJumpToRow(response.data[0]);
        } else {
          setSelectRows([]);
          setCurrentVwAcSrcorderPage(0);
          setCurrentVwAcSrcorderPageSize(pageSize);
          setCurrentVwAcSrcorderOffset(0);
          setTotalData(0);
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("handleSearchItemAcno error:", error);
      setIsSearch(false);
      setSearchData([]);
      setSelectRows([]);
      setVwAcChkTData([{ tableName: "AC_ITEM_REF", data: [] }]);
    }
  };

  //handler search by filter
  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setCurrentVwAcSrcorderPage(0);
        setCurrentVwAcSrcorderPageSize(10);
        setCurrentVwAcSrcorderOffset(0);

        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }

      const actualPageSize = pageSize ?? currentVwAcSrcorderPageSize;
      const actualOffset = offset ?? currentVwAcSrcorderOffset;

      setSearchFilter(filteredShoe);
      const hasAIM =
        "status" in search || "vend_no" in search || "item_acno" in search;
      const hasOther = keys.some(
        (k) =>
          k !== "status" &&
          k !== "vend_no" &&
          k !== "item_acno" &&
          k !== "order_date",
      );

      if (hasAIM && !hasOther) {
        await handleSearchAcSrcorderM(
          filteredShoe,
          actualPageSize,
          actualOffset,
        );
      } else {
        await handleSearch(filteredShoe, actualPageSize, actualOffset);
      }
    } catch (error) {
      console.log("cannot search because", error);
      setIsSearch(false);
      setSelectRows([]);
      await fetchAll();
    }
  };

  //handler toggle modify level
  const handleSelectModify = async (row, value) => {
    const updateRow = {
      ...row,
      modify_level: value,
    };
    await handleEdit(updateRow);
  };

  //handler select row permission
  const handleSelectChoose = (rows) => {
    setSelectRows([...rows]);
  };
  //handler export pdf
  const handleAcSrcorderMExcel = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const filename = formData.get("filename");

    const exportFile = {
      ...searchFilter,
      factory_code: user?.factory,
      filename: filename,
    };
    await exportAcSrcorderMExcel(filename, exportFile);
    handleExportClose();
    showSuccessToast(
      getControlLabel,
      `noti_success_excel`,
      "Export excel successfully",
    );
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVwAcSrcorderPage(newPage);
    setCurrentVwAcSrcorderPageSize(newPageSize);
    setCurrentVwAcSrcorderOffset(newOffset);

    if (isSearch) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }

    // Normal fetch
    const responseData = await fetchVwAcChgSum(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title || "1",
      language,
      newPageSize,
      newOffset,
    );

    setData([
      {
        tableName: "VW_AC_CHGSUM",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleVACTPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVACTPage(newPage);
    setCurrentVACTPageSize(newPageSize);
    setCurrentVACTOffset(newOffset);
    await fetchDataByAcno(false, newOffset, newPageSize);
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
  const createAcItemnoCallback = (field = "ac_itemno") => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title ||
            "1",
          language,
          page,
          pageSize,
          searchText,
          false,
          field,
        );

        const newData = [
          ...result?.data,
          {
            ac_itemno: "",
          },
        ];

        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching basic data:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createStocTypeCallback = () => {
    return async (page, pageSize, searchText) => {
      const staticData = [
        { stoc_type: "1", code_no: "1", code_name: "1-Non-bonded" },
        { stoc_type: "2", code_no: "2", code_name: "2 – Bonded" },
        { stoc_type: "9", code_no: "9", code_name: "3 – None" },
        { stoc_type: "0", code_no: "0", code_name: "4 – VAT" },
        { stoc_type: "", code_no: "", code_name: "null" },
      ];
      const filtered = searchText
        ? staticData.filter(
            (d) =>
              d.code_no.includes(searchText) ||
              d.code_name.toLowerCase().includes(searchText.toLowerCase()),
          )
        : staticData;
      return { data: filtered, total: filtered.length, pageSize };
    };
  };
  const createContnoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchGroupFieldDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title ||
            "1",
          page,
          pageSize,
          searchText,
        );
        const newData = [
          ...result?.data,
          {
            cont_no: "",
            issued_date: "",
            expire_date: "",
          },
        ];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const getFetchData = {
    ac_chgno: createAcItemnoCallback("ac_chgno"),
    stoc_type: createStocTypeCallback(),
    ac_itemno: createAcItemnoCallback(),
    cont_no: createContnoCallback(),
  };
  //========== END LABEL TRANSLATION HANDLER ==============
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
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <Box>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"VW_AC_CHGSUM"}
                    selectRows={selectRows}
                    onSelectChange={handleSelectChoose}
                    onSelectModify={handleSelectModify}
                    onSelectQuery={handleSelectQuery}
                    onSearch={handleSearchByFilter}
                    onExcelWithCondition={handleExportOpen}
                    isSearch={isSearch}
                    searchData={searchData}
                    columnTranslations={columnTranslations}
                    controlTranslations={controlTranslations}
                    language={language}
                    getControlLabel={getControlLabel}
                    getColumnLabel={getColumnLabel}
                    jumpToRow={jumpToRow}
                    subAuthentication={authorization}
                    handleSearchByCode={handleSearch}
                    fetchAcItemRefRecordFromDB={fetchAcItemRefRecordFromDB}
                    totalData={totalData || 0}
                    onPageChange={handlePageChange}
                    currentPage={currentVwAcSrcorderPage}
                    currentPageSize={currentVwAcSrcorderPageSize}
                    hasMore={hasMore}
                    getFetchData={getFetchData}
                    dropDownValues={dropdownValues}
                    setDropdownValues={setDropdownValues}
                    ref={toolbarRef}
                    onOutExcel={handleOutExcel}
                    onVerifyRemain={handleOpenVerifyRemain}
                    onRestoreStatus={handleRestoreStatus}
                    onPDF={handleExcel}
                  />
                </Box>
                <Box>
                  <VwAcChkT
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    parentSelectRows={selectRows.length > 0 ? selectRows : []}
                    isSearch={isSearch}
                    searchData={searchData}
                    handleSearchByCode={handleSearch}
                    data={vwAcChkTData}
                    setData={setVwAcChkTData}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    setSelectVwAcChkT={setSelectVACT}
                    selectVwAcChkT={selectVACT}
                    jumpToRow={jumpToRowVACT}
                    setJumpToRow={setJumpToRowVACT}
                    user={user}
                    handlePageChange={handleVACTPageChange}
                    currentPage={currentVACTPage}
                    setCurrentPage={setCurrentVACTPage}
                    currentPageSize={currentVACTPageSize}
                    setCurrentPageSize={setCurrentVACTPageSize}
                    currentOffset={currentVACTOffset}
                    setCurrentOffset={setCurrentVACTOffset}
                    totalData={totalVACTData}
                    fetchDataByAcno={fetchDataByAcno}
                    hasMore={hasVACTMore}
                    setHasMore={setHasVACTMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      <VerifyRemainPopup
        openLink={openVerifyRemain}
        onClose={handleCloseVerifyRemain}
        getControlLabel={getControlLabel}
        onSave={handleAcSrcorderMExcel}
        message={messageVC}
        onUpdateQty={handleUpdateQty}
      />
    </>
  );
};

export default Actf3101;
