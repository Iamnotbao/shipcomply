import { useEffect, useState } from "react";
import DataTable from "../../component/table/DataTable";
import { Box, Container, Paper, Stack } from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import { showSuccessToast } from "../../utils/notification/Notification";
import {
  fetchAcItemRefByID,
  fetchAllConfirmedAcItemRefs,
  fetchDataByItemAcno,
  searchAcItemRefByFilter,
} from "../../service/ac_item_ref/AcItemRefService";
import AcReqOrder from "../../features/actf_410_1/component/AcReqOrder";
import {
  exportAcSrcorderMExcel,
  fetchAllAcSrcorderM,
  searchAcSrcorderMByFilter,
} from "../../service/ac_srcorder_m/AcSrcorderMService";
import ExportPopup from "../../features/actf_410_2/page/ExportPopup";
import { set } from "react-hook-form";
import {
  fetchAllAcReqOrderById,
  fetchAllAcReqOrderByReqNo,
} from "../../service/ac_req_order/AcReqOrder";

const AcSrcorderM = () => {
  const [data, setData] = useState([]);
  const [acReqOrderMData, setAcReqOrderMData] = useState([]);
  const [selectAcReqOrder, setSelectAcReqOrder] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [selectRows, setSelectRows] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumpToRowAcItemRef, setJumpToRowAcItemRef] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [openExportPopup, setOpenExportPopup] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [currentVwAcSrcorderPage, setCurrentVwAcSrcorderPage] = useState(0);
  const [currentVwAcSrcorderPageSize, setCurrentVwAcSrcorderPageSize] =
    useState(5);
  const [currentAROOffset, setCurrentAROOffset] = useState(0);
  const [totalAROData, setTotalAROData] = useState(0);
  const [currentAROPage, setCurrentAROPage] = useState(0);
  const [currentAROPageSize, setCurrentAROPageSize] = useState(10);
  const [currentVwAcSrcorderOffset, setCurrentVwAcSrcorderOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAROMore, setHasAROMore] = useState(false);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();

  const fetchAll = async (
    authData = null,
    pageSize = 5, 
    offset = 0, 
  ) => {
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
        fetchAllAcSrcorderM(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
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
          tableName: "AC_SRCORDER_M",
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
      const columns = await fetchTableColumnTranslations(
        "ACTF_410",
        "master",
        "ac_srcorder_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_410");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_4102",
      );
      if (columns) setColumnTranslations(columns?.data);
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
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAcItemMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.item_acno,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAllDataById = async (
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
        : currentAROOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentAROPageSize;
    const response = await fetchAllAcReqOrderById(
      selectRows[0]?.factory_code,
      user?.factory,
      user?.department,
      authorization?.find((item) => item.field === "query_level")?.title,
      selectRows[0]?.id,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];
        // if (response.total !== undefined && response.total !== null) {
        //   setTotalAROData(response.total);
        // }
        setHasAROMore(response?.hasMore);
        if (shouldResetPagination) {
          setCurrentAROPage(0);
          setCurrentAROOffset(0);
        }
        childrenData = response.data.filter((child) =>
          searchData.some(
            (searchItem) =>
              searchItem.factory_code === selectedParent.factory_code &&
              searchItem.req_no === selectedParent.req_no &&
              searchItem.req_seq === child.req_seq,
          ),
        );
      }
      setAcReqOrderMData([{ tableName: "AC_REQ_ORDER", data: childrenData }]);
      if (response.total !== undefined && response.total !== null) {
        setTotalAROData(response.total);
      }
      if (childrenData.length > 0) {
        setSelectAcReqOrder([childrenData[0]]);
      } else {
        setSelectAcReqOrder([]);
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
    if (jumpToRow && jumpToRowAcItemRef) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
        setJumpToRowAcItemRef(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow, jumpToRowAcItemRef]);
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
  const handleSearch = async (newFilter, pageSize = 5, offset = 0) => {
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

      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchData(response.data);
        setData([{ tableName: "AC_SRCORDER_M", data: response.data }]);
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
  //handler search by category
  const handleSearchAcSrcorderM = async (
    newFilter,
    pageSize = 5,
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
        setData([{ tableName: "AC_SRCORDER_M", data: response.data }]);
        if (response.data.length > 0) {
          setSelectRows([response.data[0]]);
          setJumpToRow(response.data[0]);
          setTotalData(response.total);
        } else {
          setSelectRows([]);
          setTotalData(0);
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("handleSearchItemAcno error:", error);
      setIsSearch(false);
      setSearchData([]);
      setSelectRows([]);
      setAcReqOrderMData([{ tableName: "AC_ITEM_REF", data: [] }]);
    }
  };

  //handler search by filter
  //  KIỂM TRA CẢ null VÀ undefined
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setCurrentVwAcSrcorderPage(0);
        setCurrentVwAcSrcorderPageSize(5);
        setCurrentVwAcSrcorderOffset(0);

        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }

      const actualPageSize = pageSize ?? currentVwAcSrcorderPageSize;
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter
        ? 0
        : (offset ?? currentVwAcSrcorderOffset);

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


    //  CẬP NHẬT 3 STATE
    setCurrentVwAcSrcorderPage(newPage);
    setCurrentVwAcSrcorderPageSize(newPageSize);
    setCurrentVwAcSrcorderOffset(newOffset);

    if (isSearch) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }
    // Normal fetch
    const responseData = await fetchAllAcSrcorderM(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title || "1",
      newPageSize,
      newOffset,
    );

    setData([
      {
        tableName: "AC_SRCORDER_M",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAROPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;

    setCurrentAROPage(newPage);
    setCurrentAROPageSize(newPageSize);
    setCurrentAROOffset(newOffset);

    const responseData = await fetchAllAcReqOrderByReqNo(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title || "1",
      selectRows[0]?.req_no,
      newPageSize,
      newOffset,
    );
    setData([
      {
        tableName: "AC_SRCORDER_M",
        data: responseData.data || [],
      },
    ]);

    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
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
                    tableName={"AC_SRCORDER_M"}
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
                  />
                </Box>
                <Box>
                  <AcReqOrder
                    parentKeyField="id"
                    jumpToRow={jumpToRowAcItemRef}
                    setJumpToRow={setJumpToRowAcItemRef}
                    data={acReqOrderMData}
                    setData={setAcReqOrderMData}
                    selectAcReqOrder={selectAcReqOrder}
                    setSelectAcReqOrder={setSelectAcReqOrder}
                    fetchDataByReqNo={fetchAllDataById}
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    handleSearchByCode={handleSearch}
                    isHide={true}
                    totalAROData={totalAROData || 0}
                    onPageChange={handleAROPageChange}
                    currentAROPage={currentAROPage}
                    currentAROPageSize={currentAROPageSize}
                    setCurrentAROOffset={setCurrentAROOffset}
                    setCurrentAROPage={setCurrentAROPage}
                    setCurrentAROPageSize={setCurrentAROPageSize}
                    hasMore={hasAROMore}
                    setHasMore={setHasAROMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      <ExportPopup
        openLink={openExportPopup}
        onClose={handleExportClose}
        getControlLabel={getControlLabel}
        onSave={handleAcSrcorderMExcel}
      />
    </>
  );
};

export default AcSrcorderM;
