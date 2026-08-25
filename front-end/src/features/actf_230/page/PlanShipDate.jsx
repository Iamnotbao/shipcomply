import { useEffect, useState,useRef } from "react";
import DataTable from "../../../component/table/DataTable";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import CloseIcon from "@mui/icons-material/Close";
import { exportExcelAcItemM } from "../../../service/ac_item_m/AcItemMService";
import {
  fetchAllPlanOrd,
  searchPlanOrdFilter,
} from "../../../service/plan_ord/planOrd";

const PlanShipDate = ({
  openLink = false,
  onClose,
  data,
  setData,
  jumpToRow,
  setJumpToRow,
  selectSOMC,
  setSelectSOMC,
  subAuthentication = [],
  currentPage,
  currentPageSize,
  setCurrentOffset,
  totalData,
  setTotalData,
  hasMore,
  setHasMore,
  isSearch,
  setIsSearch,
  setSearchFilter,
  setCurrentPage,
  setCurrentPageSize,
  onPageChange,
  user,
  openPopup,
  setOpenPopup,
  handlePlanDate,
  onClosePopup,
  onOpenPopup,
  selectCheckSOMC,
  setSelectCheckSOMC,
  handleCheckboxChange,
  selectionsVersion,
  onTransfer,
  onCheckBoxAll,
}) => {
  const theme = useTheme();
  const [selectPermission, setSelectPermission] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const isPaginatingRef = useRef(false);
  const { fetchTableControlTranslations, language } = useColumnTranslation();

  const fetchAllTranslations = async () => {
    try {
      const [controls] = await fnQuery([
        () => fetchTableControlTranslations("ACTF_230"),
      ]);
      const mergedComplexColumn = [...controls?.data];
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

  const fetchAll = async (authData = null, pageSize = 10, offset = 0) => {
    const authToUse = authData || subAuthentication;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);

    let acInmM;
    [acInmM] = await fnQuery([
      () =>
        fetchAllPlanOrd(
          user?.access_token,
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          language,
          pageSize,
          offset,
        ),
    ]);
    console.log("adokaowda", acInmM);

    if (acInmM) {
      setData([
        {
          tableName: "PLAN_ORD",
          data: acInmM.data,
        },
      ]);
      setHasMore(acInmM?.hasMore);
      setSelectSOMC([acInmM.data[0]]);
      setJumpToRow(acInmM.data[0]);
    }
  };

  useEffect(() => {
    if (openLink) {
      fetchAll();
    }
  }, [openLink]);

  useEffect(() => {
    console.log(" Language changed to:", language);
    fetchAllTranslations();
  }, [language]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handlePDF = async () => {
    if (selectedItemRefs.length === 0) {
      toast.warning("Please select items to export!");
      return;
    }

    try {
      const cleanedData = selectedItemRefs.map(
        ({ statusText, ...cleanItem }) => {
          return cleanItem;
        },
      );
      await exportExcelAcItemM(cleanedData);
      toast.success("Export successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed!");
    }
  };

  const handleSearch = async (
    newFilter,
    pageSize = 10,
    offset = 0,
    isNewSearch = true,
  ) => {
    try {
       const isNewSearch = !isPaginatingRef.current;
        isPaginatingRef.current = false; // reset sau khi dùng
      const allow = Array.isArray(subAuthentication)
        ? subAuthentication.find((item) => item.field === "query_level")?.title
        : null;
      const search = newFilter.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsSearch(false);
        setTotalData(0);
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setSearchFilter(null);
        setSelectSOMC([]);
        await fetchAll();
        return;
      }
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
      }
      const response = await searchPlanOrdFilter(
        newFilter,
        user.access_token,
        user.factory,
        user.department,
        user.user_code,
        allow,
        language,
        pageSize,
        offset,
      );
      setIsSearch(true);
      setSearchFilter(newFilter);
     
    if (response && response.data && response.data.length > 0) {
      //  Chỉ sync khi search mới, không sync khi paginate
      if (isNewSearch) {
        await syncCheckAfterSearch(response.data);
      }

      setData([{ tableName: "PLAN_ORD", data: response.data }]);
      setTotalData(response?.total);
      setSelectSOMC([response.data[0]]);
      setJumpToRow(response.data[0]);
      if (offset === 0 && response.data.length > 0) {
        setTotalData(response.total);
      }
    } else {
      if (isNewSearch) {
        await syncCheckAfterSearch([]);
      }
      setData([{ tableName: "PLAN_ORD", data: [] }]);
      setTotalData(0);
    }
  } catch (error) {
    console.error("Search error:", error);
    await fetchAll();
  }
};
  const syncCheckAfterSearch = async (searchResult) => {
    const currentChecked = selectCheckSOMC || [];
    console.log("kkk", currentChecked);
    console.log("mm", searchResult);
    if (currentChecked.length === 0) return [];

    const stillChecked = currentChecked.filter((checkedItem) =>
      searchResult.some(
        (searchItem) =>
          `${searchItem.factory_code}-${searchItem.se_id}-${searchItem.se_seq}-${searchItem.se_ver}-${searchItem.pack_gu}-${searchItem.ship_seq}` ===
          `${checkedItem.factory_code}-${checkedItem.se_id}-${checkedItem.se_seq}-${checkedItem.se_ver}-${checkedItem.pack_gu}-${checkedItem.ship_seq}`,
      ),
    );
    const uncheckedItems = currentChecked.filter(
      (checkedItem) =>
        !searchResult.some(
          (searchItem) =>
            `${searchItem.factory_code}-${searchItem.se_id}-${searchItem.se_seq}-${searchItem.se_ver}-${searchItem.pack_gu}-${searchItem.ship_seq}` ===
            `${checkedItem.factory_code}-${checkedItem.se_id}-${checkedItem.se_seq}-${checkedItem.se_ver}-${checkedItem.pack_gu}-${checkedItem.ship_seq}`,
        ),
    );

    if (handleCheckboxChange) {
      for (const uncheckedItem of uncheckedItems) {
        await handleCheckboxChange(stillChecked, uncheckedItem);
      }
    }
    return stillChecked;
  };
  const handleCustomCheckboxChange = async (item, isChecked) => {
    const currentSelections = selectCheckSOMC || [];
    if (Array.isArray(item)) {
      console.log("🟢 SELECT ALL detected in SdOrdMCLink", item);

      if (isChecked) {
        if (handleCheckboxChange) {
          await handleCheckboxChange(item, null);
        }
      } else {
        // Uncheck all
        if (handleCheckboxChange) {
          await handleCheckboxChange([], null);
        }
      }
      return;
    }
    let newSelections;

    if (isChecked) {
      newSelections = [...currentSelections, item];
    } else {
      const itemId = `${item.factory_code}-${item.se_id}-${item.se_seq}-${item.se_ver}-${item.pack_gu}-${item.ship_seq}`;
      newSelections = currentSelections.filter((sel) => {
        const selId = `${sel.factory_code}-${sel.se_id}-${sel.se_seq}-${sel.se_ver}-${sel.pack_gu}-${sel.ship_seq}`;
        return selId !== itemId;
      });
    }
    if (handleCheckboxChange) {
      const uncheckedRow = !isChecked ? item : null;
      await handleCheckboxChange(newSelections, uncheckedRow);
    }
  };
  const handleLeftSelectAll = async (isChecked) => {
    if (onCheckBoxAll) await onCheckBoxAll(isChecked);
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
const handlePageChangeWrapper = (page, size) => {
  isPaginatingRef.current = true; 
  onPageChange(page, size);
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
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;

  return (
    <>
      <Dialog open={openLink} onClose={()=>onClose(null)} maxWidth="xl">
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
                {getControlLabel("ttl_plan_ship_date", "Plan Ship Date")}
              </Typography>
              <Button onClick={()=>onClose(null)} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 1, width: "100%" }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data || []}
                  tableName={"PLAN_ORD"}
                  selectRows={selectSOMC}
                  onSelectChange={setSelectSOMC}
                  onSearch={handleSearch}
                  onPDF={handlePDF}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  isSubTable={true}
                  isPopup={true}
                  totalData={totalData}
                  onPageChange={handlePageChangeWrapper}
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                  hasMore={hasMore}
                  isSearch={isSearch}
                  onPlanDate={onOpenPopup}
                  checkboxSelection={false}
                  customCheckboxColumn={true}
                  customSelections={selectCheckSOMC}
                  onCustomCheckboxChange={handleCustomCheckboxChange}
                  onCustomSelectAll={handleLeftSelectAll}
                  selectionsVersion={selectionsVersion}
                  onTransfer={onTransfer}
                />
              </div>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlanShipDate;
