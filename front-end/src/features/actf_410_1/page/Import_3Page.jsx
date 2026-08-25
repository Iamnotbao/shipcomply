import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
  InputBase,
  Paper,
  CircularProgress,
} from "@mui/material";

import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "../../../component/table/DataTable";
import {
  exportVwAcAllChkExcel,
  fetchAllVwAcAllChk,
  searchVAAByFilter,
} from "../../../service/vw_ac_allchk/VwAcAllChkService";
import { showSuccessToast } from "../../../utils/notification/Notification";
import ExportVwAcAllChkPopup from "./ExportVwAcAllChkPopup";
const Import_3Page = ({
  openImport = false,
  onClose,
  selectVwAcAllChk,
  data,
  setData,
  onCheckVwAcAllChk,
  onSelectvwAcAllChk,
  onCheckBox,
  onConfirmAll,
  ttlQTY,
  acReq,
  hasMore,
  setHasMore,
  totalData,
  currentOffset,
  currentPage,
  currentPageSize,
  onPageChange,
  setCurrentPage,
  setCurrentPageSize,
  setCurrentOffset,
  setTotalData,
  setSelectVwAcAllChk,
  parentSearchFilter,
  selectCheckVwAcAllChk,
  setSelectCheckVwAcAllChk,
  onCheckBoxAll,
  selectRows,
  fetchAllVwAcAllChkByReqNo,
  isSearch,
  setIsSearch,
  isLoading,
  setIsLoading,
}) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [openExportPopup, setOpenExportPopup] = useState(false);
  const [jumpToRow, setJumpToRow] = useState(null);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();

  const fetchAllTranslations = async () => {
    try {
      const [columns] = await fnQuery([
        () => fetchTableControlTranslations("ACTF_410"),
      ]);
      if (columns) setColumnTranslations(columns?.data);
      if (columns) {
        setControlTranslations(columns?.data);
      }
    } catch (error) {
      console.error("Error fetching translations:", error);
    }
  };
  useEffect(() => {
    if (openImport) {
      fetchAllTranslations();
    }
  }, [openImport]);
  //selectRows

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  const handleExcel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const allFields = Object.fromEntries(formData.entries());
    const filters = {
      ...searchFilter,
      factory_code: user?.factory,
      ...allFields,
    };
    await exportVwAcAllChkExcel(filters);
    handleExportClose();
    showSuccessToast(
      getControlLabel,
      `noti_success_excel`,
      "Export excel successfully",
    );
  };
  const handleExportOpen = async () => {
    setOpenExportPopup(true);
  };
  const handleLeftCustomCheckboxChange = (item, isChecked) => {
    let newSelections;
    if (isChecked) {
      newSelections = [...selectCheckVwAcAllChk, item];
    } else {
      const itemId = `${item.rcpt_date}-${item.chk_no}-${item.chk_seq}`;
      newSelections = selectCheckVwAcAllChk.filter((sel) => {
        const selId = `${sel.rcpt_date}-${sel.chk_no}-${sel.chk_seq}`;
        return selId !== itemId;
      });
    }
    setSelectCheckVwAcAllChk(newSelections);
    if (onCheckVwAcAllChk) {
      // Tìm hàng bị uncheck nếu có
      const uncheckedRow = !isChecked ? item : null;
      onCheckVwAcAllChk(newSelections, uncheckedRow);
    }
  };
  const handleLeftSelectAll = async (isChecked) => {
    if (onCheckBoxAll) await onCheckBoxAll(isChecked);
  };
  const handleExportClose = () => {
    setOpenExportPopup(false);
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
  const handleSearchVwAcChkALl = async (
    newFilter,
    pageSize = 10,
    offset = 0,
    isNewSearch = true, // ← thêm param
  ) => {
    setIsLoading(true);
    try {
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      const updateFilter = {
        ...newFilter,
        search: {
          ...newFilter.search,
          vend_no: selectRows[0]?.vend_no,
          ac_type: selectRows[0]?.ac_type,
        },
      };
      const response = await searchVAAByFilter(
        user?.access_token,
        updateFilter,
        user.factory,
        language,
        pageSize,
        offset,
      );

      if (response && response.data && response.data.length > 0) {
        //  Sync check giống Import_2
        const stillChecked = isNewSearch
          ? await syncCheckAfterSearch(response.data)
          : selectCheckVwAcAllChk; // paginate → giữ nguyên

        const mergedData = response.data.map((row) => {
          const rowKey = `${row.rcpt_date}-${row.chk_no}-${row.chk_seq}`;
          const checkedVersion = stillChecked.find(
            (c) => `${c.rcpt_date}-${c.chk_no}-${c.chk_seq}` === rowKey,
          );
          return checkedVersion
            ? {
                ...row,
                bl_qty: checkedVersion.bl_qty,
                ac_req: checkedVersion.ac_req,
                is_check: "Y",
              }
            : row;
        });

        setIsSearch(true);
        setData(mergedData);
        setSelectVwAcAllChk([response.data[0]]);
        setJumpToRow(response.data[0]);
        if (offset === 0) setTotalData(response.total);
      } else {
        if (isNewSearch) {
          setIsSearch(true);
          await syncCheckAfterSearch([]);
        }
        setData([]);
        setSelectVwAcAllChk([]);
        setTotalData(0);
        setCurrentOffset(0);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSelectVwAcAllChk([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData(0);
        setIsLoading(true);
        try {
          await fetchAllVwAcAllChkByReqNo(true, 0, 10);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      console.log("go inside search this ");

      setSearchFilter(filteredShoe);
      await handleSearchVwAcChkALl(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {
      console.log("cannot search because", error);
      setIsLoading(true);
      // setIsSearch(false);
      setSelectVwAcAllChk([]);
      try {
        await fetchAllVwAcAllChkByReqNo(true, 0, 10);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    setIsLoading(true);
    try {
      if (isSearch) {
        await handleSearchVwAcChkALl(
          searchFilter,
          newPageSize,
          newOffset,
          false,
        );
        return;
      }
      await fetchAllVwAcAllChkByReqNo(false, newOffset, newPageSize);
    } finally {
      setIsLoading(false);
    }
  };
  const syncCheckAfterSearch = async (searchResult) => {
    const currentChecked = selectCheckVwAcAllChk || [];
    if (currentChecked.length === 0) return [];

    const stillChecked = currentChecked.filter((checkedItem) =>
      searchResult.some(
        (searchItem) =>
          `${searchItem.rcpt_date}-${searchItem.chk_no}-${searchItem.chk_seq}` ===
          `${checkedItem.rcpt_date}-${checkedItem.chk_no}-${checkedItem.chk_seq}`,
      ),
    );

    const uncheckedItems = currentChecked.filter(
      (checkedItem) =>
        !searchResult.some(
          (searchItem) =>
            `${searchItem.rcpt_date}-${searchItem.chk_no}-${searchItem.chk_seq}` ===
            `${checkedItem.rcpt_date}-${checkedItem.chk_no}-${checkedItem.chk_seq}`,
        ),
    );

    // Uncheck những item không còn trong search result
    if (onCheckVwAcAllChk) {
      for (const uncheckedItem of uncheckedItems) {
        await onCheckVwAcAllChk(stillChecked, uncheckedItem);
      }
    }

    return stillChecked;
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
      <Dialog open={openImport} onClose={onClose} maxWidth="xxl" fullWidth>
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              mb={2}
            >
              <Typography
                variant="h4"
                textTransform={"uppercase"}
                fontWeight={600}
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_import_3", "VN Import")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 10, width: "100%" }}
            >
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      flex: "0 0 auto",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {isLoading && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(255,255,255,0.6)",
                          zIndex: 9999,
                        }}
                      >
                        <CircularProgress size={48} />
                      </Box>
                    )}
                    <DataTable
                      data={data}
                      tableName={"VW_AC_ALLCHK"}
                      onSearch={handleSearchByFilter}
                      onSelectChange={onSelectvwAcAllChk}
                      selectRows={
                        selectVwAcAllChk.length > 0 ? selectVwAcAllChk : []
                      }
                      onPDF={handleExportOpen}
                      columnTranslations={columnTranslations}
                      controlTranslations={controlTranslations}
                      language={language}
                      getControlLabel={getControlLabel}
                      getColumnLabel={getColumnLabel}
                      checkboxSelection={false}
                      customCheckboxColumn={true}
                      customSelections={selectCheckVwAcAllChk}
                      onCustomCheckboxChange={handleLeftCustomCheckboxChange}
                      onCustomSelectAll={handleLeftSelectAll}
                      ttlQTY={ttlQTY}
                      acReq={acReq}
                      onConfirmAll={onConfirmAll}
                      jumpToRow={jumpToRow}
                      currentPage={currentPage}
                      currentPageSize={currentPageSize}
                      totalData={totalData}
                      onPageChange={handlePageChange}
                      hasMore={hasMore}
                      isSearch={isSearch}
                      isCheckAll={false}
                      // checkboxSelection={true}
                      // selectedItemRefs={selectedItemRefs}
                      // onSelectionChange={setSelectedItemRefs}
                      // onDirectImport={handleOpenDirectImport}
                      // onVNImport={handleOpenVNImport}
                    />
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>
          <ExportVwAcAllChkPopup
            openLink={openExportPopup}
            onClose={handleExportClose}
            getControlLabel={getControlLabel}
            onSave={handleExcel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Import_3Page;
