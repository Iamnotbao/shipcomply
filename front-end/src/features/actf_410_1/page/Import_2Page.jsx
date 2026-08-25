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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DataTable from "../../../component/table/DataTable";
import IvDTransDTwOPage from "./IvTransDTwOPage";
import EditImport_2Page from "./EditImport_2Page";
import {
  fetchAllVwAcSrcorder,
  searchVwAcSrcorderMByFilter,
} from "../../../service/vw_ac_srcorder/VwAcSrcorderService";
import { fetchDataByItemAcno } from "../../../service/ac_item_ref/AcItemRefService";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { fnQuery } from "../../../utils/fnQuery";
const Import_2Page = ({
  openImport = false,
  onClose,
  vwAcSrorderData,
  setVwAcSrorderData,
  selectVwAcSrcorder,
  setSelectVwAcSrcorder,
  IvDTransDTwOData,
  setIvDTransDTwOData,
  selectIvDTransDTwO,
  setSelectIvDTransDTwO,
  getColumnLabel,
  getControlLabel,
  language,
  fetchIvDTransDTwOByvwAcSrcorder,
  onCheckLeft,
  onSelectVwAcSrcorder,
  onSelectIvTransDTw,
  total,
  setTotal,
  totalITDT,
  setITDTTotal,
  onRightCheck,
  onCheckMax,
  isCheckMax,
  checkboxSelections,
  onCheckboxChange,
  selectionsVersion,
  onCheckVwAcSrcorder,
  onCheckIvDTransDTwO,
  onCustomsSelection,
  customSelections,
  onOpenEditVwAcSrcorder,
  openEditVwAcSrorder,
  onOpenEditVwAcSrcorderClose,
  ttl = 0,
  handleEditVwAcSrcorder,
  onConfirmAll,
  acReq,
  onUpdateBlQty,
  totalData,
  currentVwAcSrcorderPageSize,
  currentVwAcSrcorderPage,
  currentVwAcSrcorderOffset,
  fetchAllVwAcSrcOrder,
  setCurrentVwAcSrcorderOffset,
  setCurrentVwAcSrcorderPageSize,
  setCurrentVwAcSrcorderPage,
  currentITDTPageSize,
  currentITDTPage,
  currentITDTOffset,
  setCurrentITDTOffset,
  setCurrentITDTPageSize,
  setCurrentITDTPage,
  setJumptoRowIvTransDTw,
  jumptoRowIvTransDTw,
  setTotalData,
  user,
  authorization,
  selectRows,
  selectCheckVwAcSrcorder,
  searchFilterFromParent,
  totalITDTData,
  hasVASMore,
  setHasVASMore,
  hasITDTMore,
  setHasITDTMore,
  parentSearchFilter,
  onHandleCheck,
  searchData,
  setSearchData,
  isSearch,
  setIsSearch,
  mergeVirtualFields,
  onCheckBoxAll,
}) => {
  const [jumpToRow, setJumpToRow] = useState(null);
  const [searchFilter, setSearchFilter] = useState([]);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const { fetchTableControlTranslations } = useColumnTranslation();
  // const [customLeftSelections, setCustomLeftSelections] = useState([]);
  const fetchAllTranslations = async () => {
    try {
      console.log("dodnodnada");

      const [columns] = await fnQuery([
        () => fetchTableControlTranslations("ACTF_410"),
      ]);
      if (columns) setColumnTranslations(columns?.data);
      if (columns) {
        setControlTranslations(columns?.data);
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
 useEffect(() => {
  if (!openImport) return;
  if (!isSearch || !searchFilter) return;

  const keys = Object.keys(searchFilter?.search || {});
  if (keys.length === 0) return;

  handleSearchAcSrcorderM(
    searchFilter,
    currentVwAcSrcorderPageSize,
    currentVwAcSrcorderOffset,
    false, 
  );
}, [isCheckMax]); 
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleLeftCustomCheckboxChange = async (item, isChecked) => {
    const currentSelections = selectCheckVwAcSrcorder || [];

    let newSelections;

    if (isChecked) {
      newSelections = [...currentSelections, item];
    } else {
      const itemId = `${item.factory_code}-${item.id}`;
      newSelections = currentSelections.filter((sel) => {
        const selId = `${sel.factory_code}-${sel.id}`;
        return selId !== itemId;
      });
    }

    if (onCheckVwAcSrcorder) {
      const uncheckedRow = !isChecked ? item : null;
      await onCheckVwAcSrcorder(newSelections, uncheckedRow);
    }
  };

  const handleLeftSelectAll = async (isChecked) => {
    if (onCheckBoxAll) await onCheckBoxAll(isChecked);
  };
  const syncCheckAfterSearch = async (searchResult) => {
    const currentChecked = selectCheckVwAcSrcorder || [];
    if (currentChecked.length === 0) return []; //  return rỗng

    const stillChecked = currentChecked.filter((checkedItem) =>
      searchResult.some(
        (searchItem) =>
          `${searchItem.factory_code}-${searchItem.id}` ===
          `${checkedItem.factory_code}-${checkedItem.id}`,
      ),
    );

    const uncheckedItems = currentChecked.filter(
      (checkedItem) =>
        !searchResult.some(
          (searchItem) =>
            `${searchItem.factory_code}-${searchItem.id}` ===
            `${checkedItem.factory_code}-${checkedItem.id}`,
        ),
    );

    if (onHandleCheck) {
      for (const uncheckedItem of uncheckedItems) {
        await onHandleCheck(stillChecked, uncheckedItem);
      }
    }

    return stillChecked;
  };
  // Helper merge virtual fields

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
        setSearchFilter(null);
        setTotal(0);
        await fetchAllVwAcSrcOrder(true, 0, 10);
        return;
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentVwAcSrcorderPageSize;
      const actualOffset = isNewFilter
        ? 0
        : (offset ?? currentVwAcSrcorderOffset);

      setSearchFilter(filteredShoe);
      await handleSearchAcSrcorderM(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {
      console.log("cannot search because", error);
      // setIsSearch(false);
      setSelectVwAcSrcorder([]);
      await fetchAllVwAcSrcOrder(true, 0, 10);
    }
  };
  const handleSearchAcSrcorderM = async (
    newFilter,
    pageSize = 10,
    offset = 0,
    isNewSearch = true,
  ) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentVwAcSrcorderPage(0);
        setCurrentVwAcSrcorderPageSize(pageSize);
        setCurrentVwAcSrcorderOffset(0);
        setCurrentITDTPage(0);
        setCurrentITDTOffset(0);
      }

      const updateFilter = {
        ...newFilter,
        search: {
          ...newFilter.search,
          vend_no: selectRows[0]?.vend_no,
          invoice_no: selectRows[0]?.invoice_no,
        },
      };

      const response = await searchVwAcSrcorderMByFilter(
        user.access_token,
        updateFilter,
        user.factory,
        language,
        pageSize,
        offset,
        isCheckMax,
      );

      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchData(response.data);
        setSelectVwAcSrcorder([response.data[0]]);
        setJumpToRow(response.data[0]);

        if (offset === 0) {
          setTotalData(response.total);
        }
      const stillChecked = isNewSearch
        ? await syncCheckAfterSearch(response.data)
        : selectCheckVwAcSrcorder;  // ← giữ nguyên checked rows khi paginate

      const mergedData = mergeVirtualFields(response.data, stillChecked);
      setVwAcSrorderData(mergedData);
      fetchIvDTransDTwOByvwAcSrcorder();
    } else {
      // empty result: chỉ reset nếu là search mới
      if (isNewSearch) {
        setIsSearch(true);
        setSearchData([]);
        await syncCheckAfterSearch([]);
        if (onCheckVwAcSrcorder) {
          await onCheckVwAcSrcorder([], null);
        }
      }
      setVwAcSrorderData([]);
      setSelectVwAcSrcorder([]);
        setSelectVwAcSrcorder([]);
        setIvDTransDTwOData([{ tableName: "IV_TRANS_D_TW", data: [] }]);
        setSelectIvDTransDTwO([]);
        setTotalData(0);
        setITDTTotal(0);
        setCurrentVwAcSrcorderOffset(0);
        setCurrentVwAcSrcorderPage(0);
        setCurrentITDTOffset(0);
        setCurrentITDTPage(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectVwAcSrcorder([]);
      setIvDTransDTwOData([]);
    }
  };
const handlePageChange = async (newPage, newPageSize) => {
  const newOffset = newPage * newPageSize;
  setCurrentVwAcSrcorderPage(newPage);
  setCurrentVwAcSrcorderPageSize(newPageSize);
  setCurrentVwAcSrcorderOffset(newOffset);

  if (isSearch) {
    await handleSearchAcSrcorderM(searchFilter, newPageSize, newOffset, false); // ← false
    return;
  }
  await fetchAllVwAcSrcOrder(false, newOffset, newPageSize);
};
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
                {getControlLabel("ttl_import_2", "Direct Import")}
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
                    flexDirection: "row",
                    gap: 2,
                    mt: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      flex: "0 0 70%",
                      minWidth: 0,
                      display: "flex",
                    }}
                  >
                    <DataTable
                      data={vwAcSrorderData}
                      tableName={"VW_AC_SRCORDER"}
                      onSearch={handleSearchByFilter}
                      onEdit={onOpenEditVwAcSrcorder}
                      onSelectChange={onSelectVwAcSrcorder}
                      selectRows={selectVwAcSrcorder}
                      language={language}
                      columnTranslations={columnTranslations}
                      controlTranslations={controlTranslations}
                      getControlLabel={getControlLabel}
                      getColumnLabel={getColumnLabel}
                      jumpToRow={jumpToRow}
                      checkboxSelection={false}
                      customCheckboxColumn={true}
                      customSelections={selectCheckVwAcSrcorder}
                      onCustomCheckboxChange={handleLeftCustomCheckboxChange}
                      onCustomSelectAll={handleLeftSelectAll}
                      onCheckMax={onCheckMax}
                      isCheckMax={isCheckMax}
                      disableRowSelectionOnClick={true}
                      ttlQTY={ttl}
                      acReq={selectVwAcSrcorder[0]?.ac_req || 0}
                      totalData={totalData || 0}
                      onPageChange={handlePageChange}
                      currentPage={currentVwAcSrcorderPage}
                      currentPageSize={currentVwAcSrcorderPageSize}
                      hasMore={hasVASMore}
                      isSearch={isSearch}
                      isCheckAll={false}
                    />
                  </Box>
                  <Box sx={{ flex: "0 0 30%", minWidth: 0 }}>
                    <IvDTransDTwOPage
                      selectRows={selectVwAcSrcorder}
                      data={IvDTransDTwOData}
                      setData={setIvDTransDTwOData}
                      selectIvTransDTwO={selectIvDTransDTwO}
                      setSelectIvDTransDTwO={setSelectIvDTransDTwO}
                      getColumnLabel={getColumnLabel}
                      getControlLabel={getControlLabel}
                      fetchIvDTransDTwOByvwAcSrcorder={
                        fetchIvDTransDTwOByvwAcSrcorder
                      }
                      isSearch={isSearch}
                      searchData={searchData}
                      searchFilter={searchFilter}
                      language={language}
                      onSelectIvTransDTw={onSelectIvTransDTw}
                      total={total}
                      setTotal={setTotal}
                      onRightCheck={onRightCheck}
                      onCheckboxChange={onCheckboxChange}
                      checkboxSelections={checkboxSelections}
                      selectionsVersion={selectionsVersion}
                      onCheckIvDTransDTwO={onCheckIvDTransDTwO}
                      onCustomsSelection={onCustomsSelection}
                      customSelections={customSelections}
                      onConfirmAll={onConfirmAll}
                      openImport={openImport}
                      currentPage={currentITDTPage}
                      currentPageSize={currentITDTPageSize}
                      currentOffset={currentITDTOffset}
                      totalData={totalITDTData || 0}
                      hasMore={hasITDTMore}
                      setHasMore={setHasITDTMore}
                    />
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
      <EditImport_2Page
        open={openEditVwAcSrorder}
        onClose={onOpenEditVwAcSrcorderClose}
        vwAcSrcorder={selectVwAcSrcorder.length > 0 ? selectVwAcSrcorder[0] : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        handleEdit={onUpdateBlQty}
      />
    </>
  );
};
export default Import_2Page;
